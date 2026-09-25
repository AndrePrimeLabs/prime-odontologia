<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Controller;

if (!defined('ABSPATH')) exit;


use ActionScheduler_Store;
use DateTimeImmutable;
use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\AutomationRun;
use MailPoet\Automation\Engine\Data\AutomationRunLog;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Registry;
use MailPoet\Automation\Engine\Storage\AutomationRunLogStorage;
use MailPoet\Automation\Engine\Utils\Json;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\MailPoet\Subjects\SubscriberSubject;
use MailPoet\Entities\SubscriberEntity;
use MailPoet\Subscribers\SubscribersRepository;

/**
 * @phpstan-type AutomationRunDataProps array{
 *   run: array{
 *     id: int,
 *     automation_id: int,
 *     status: string,
 *     is_past_due: bool
 *   },
 *   logs: array<array{
 *     id: ?int,
 *     automation_run_id: int,
 *     step_id: string,
 *     step_type: string,
 *     step_key: string,
 *     step_name: string,
 *     status: string,
 *     started_at: string,
 *     updated_at: string,
 *     run_number: int,
 *     data: string,
 *     time_left: ?string,
 *     error: ?array<string, mixed>
 *   }>,
 *   automation: array{
 *     steps: array<array{
 *       id: string,
 *       type: string,
 *       key: string,
 *       next_steps: array<array{id: string}>,
 *       args: array<string, mixed>,
 *       filters: ?array<string, mixed>
 *     }>
 *   },
 *   subscriber: ?array{
 *     id: int,
 *     email: string,
 *     first_name: string,
 *     last_name: string,
 *     avatar: string|false
 *   }
 * }
 */
class RunLogController {
  private ActionScheduler $actionScheduler;
  private AutomationRunLogStorage $automationRunLogStorage;
  private Registry $registry;
  private SubscribersRepository $subscribersRepository;
  private WordPress $wp;

  public function __construct(
    ActionScheduler $actionScheduler,
    AutomationRunLogStorage $automationRunLogStorage,
    Registry $registry,
    SubscribersRepository $subscribersRepository,
    WordPress $wp
  ) {
    $this->actionScheduler = $actionScheduler;
    $this->automationRunLogStorage = $automationRunLogStorage;
    $this->registry = $registry;
    $this->subscribersRepository = $subscribersRepository;
    $this->wp = $wp;
  }

  /** @return AutomationRunDataProps */
  public function getAutomationRunData(Automation $automation, AutomationRun $automationRun): array {
    $automationRunLogs = $this->automationRunLogStorage->getLogsForAutomationRun($automationRun->getId());
    $subscriber = $this->getAutomationRunSubscriber($automationRun);
    return $this->mapAutomationRunData($automationRun, $automationRunLogs, $automation, $subscriber);
  }

  private function getAutomationRunSubscriber(AutomationRun $automationRun): ?SubscriberEntity {
    $subjects = $automationRun->getSubjects(SubscriberSubject::KEY);
    if (empty($subjects)) {
      return null;
    }
    $subscriberSubject = reset($subjects);
    $id = $subscriberSubject->getArgs()['subscriber_id'];
    return $this->subscribersRepository->findOneById($id);
  }

  private function getTimeLeft(AutomationRun $run, AutomationRunLog $log): ?string {
    if ($log->getStatus() !== AutomationRunLog::STATUS_RUNNING) {
      return null;
    }
    return $this->calculateTimeLeft($run->getId(), $log->getStepId());
  }

  public function calculateTimeLeft(int $runId, string $stepId): ?string {
    $scheduledActions = $this->actionScheduler->getScheduledActions([
      'hook' => Hooks::AUTOMATION_STEP,
      'status' => ActionScheduler_Store::STATUS_PENDING,
      'args' => [
        'automation_run_id' => $runId,
        'step_id' => $stepId,
      ],
      // Undocumented feature https://github.com/woocommerce/action-scheduler/pull/563
      // This allows to filter actions, without the need to provide run_number argument
      'partial_args_matching' => 'like',
    ]);
    if (empty($scheduledActions)) {
      return null;
    }
    $scheduledAction = reset($scheduledActions);
    if (!($scheduledAction instanceof \ActionScheduler_Action)) {
      return null;
    }
    $scheduledActionSchedule = $scheduledAction->get_schedule();
    $nextSchedule = $scheduledActionSchedule ? $scheduledActionSchedule->next() : null;
    if (!$nextSchedule) {
      return null;
    }
    $scheduledTime = $nextSchedule->getTimestamp();
    $now = time();
    // Handle overdue actions
    if ($scheduledTime < $now) {
      // A grace period to account for the time it takes to process the action
      if ($now - $scheduledTime < MINUTE_IN_SECONDS) {
        return null;
      }
      // translators: used when the scheduled task is overdue, in "Time left: Overdue"
      return __('Overdue', 'mailpoet-premium');
    }
    return $this->wp->humanTimeDiff($now, $scheduledTime);
  }

  private function hasPastDueActions(AutomationRun $run): bool {
    $pastDueActionIds = $this->actionScheduler->getScheduledActions([
      'hook' => Hooks::AUTOMATION_STEP,
      'status' => ActionScheduler_Store::STATUS_PENDING,
      // A 1 minute grace period to account for the time it might take to run the action
      'date' => as_get_datetime_object(time() - MINUTE_IN_SECONDS),
      'date_compare' => '<',
      'args' => [
        'automation_run_id' => $run->getId(),
      ],
      // Undocumented feature https://github.com/woocommerce/action-scheduler/pull/563
      // This allows to filter all run actions, and not only for specific step and run
      // by providing the full args value
      'partial_args_matching' => 'like',
    ]);
    return !empty($pastDueActionIds);
  }

  /**
   * @param AutomationRunLog[] $automationRunLogs
   * @return AutomationRunDataProps
   */
  private function mapAutomationRunData(
    AutomationRun $automationRun,
    array $automationRunLogs,
    Automation $automation,
    ?SubscriberEntity $subscriber
  ): array {
    return [
      'run' => [
        'id' => $automationRun->getId(),
        'automation_id' => $automationRun->getAutomationId(),
        'status' => $automationRun->getStatus(),
        'is_past_due' => $this->hasPastDueActions($automationRun),
      ],
      'logs' => array_map(
        function ($automationRunLog) use ($automationRun): array {
          $stepKey = $automationRunLog->getStepKey();
          // translators: %s is step ID
          $stepName = sprintf(__('Unknown step: %s', 'mailpoet-premium'), $stepKey);
          $step = $this->registry->getStep($stepKey);
          if ($step && $step->getName() !== '') {
            $stepName = $step->getName();
          }
          return [
            'id' => $automationRunLog->getId(),
            'automation_run_id' => $automationRunLog->getAutomationRunId(),
            'step_id' => $automationRunLog->getStepId(),
            'step_type' => $automationRunLog->getStepType(),
            'step_key' => $automationRunLog->getStepKey(),
            'step_name' => $stepName,
            'status' => $automationRunLog->getStatus(),
            'started_at' => $automationRunLog->getStartedAt()->format(DateTimeImmutable::W3C),
            'updated_at' => $automationRunLog->getUpdatedAt()->format(DateTimeImmutable::W3C),
            'run_number' => $automationRunLog->getRunNumber(),
            'data' => Json::encode($automationRunLog->getData()),
            'time_left' => $this->getTimeLeft($automationRun, $automationRunLog),
            'error' => $automationRunLog->getError(),
          ];
        },
        $automationRunLogs
      ),
      'automation' => [
        'steps' => array_map(
          function ($step): array {
            return [
              'id' => $step->getId(),
              'type' => $step->getType(),
              'key' => $step->getKey(),
              'next_steps' => array_map(function (string $nextStepId) {
                return ['id' => $nextStepId];
              }, $step->getNextStepIds()),
              'args' => $step->getArgs(),
              'filters' => $step->getFilters() ? $step->getFilters()->toArray() : null,
            ];
          },
          $automation->getSteps()
        ),
      ],
      'subscriber' => $subscriber ? [
        'id' => (int)$subscriber->getId(),
        'email' => $subscriber->getEmail(),
        'first_name' => $subscriber->getFirstName(),
        'last_name' => $subscriber->getLastName(),
        'avatar' => $this->wp->getAvatarUrl($subscriber->getEmail(), ['size' => 40]),
      ] : null,
    ];
  }
}
