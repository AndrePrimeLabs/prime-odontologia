<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\StepRunController;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Integration\Action;
use MailPoet\Automation\Integrations\MailPoet\Payloads\SubscriberPayload;
use MailPoet\Automation\Integrations\MailPoet\Subjects\SubscriberSubject;
use MailPoet\Entities\StatisticsUnsubscribeEntity;
use MailPoet\Entities\SubscriberEntity;
use MailPoet\InvalidStateException;
use MailPoet\Premium\Automation\Engine\AutomationAuthorization;
use MailPoet\Settings\TrackingConfig;
use MailPoet\Statistics\Track\Unsubscribes;
use MailPoet\Subscribers\SubscribersRepository;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class UnsubscribeAction implements Action {

  /** @var SubscribersRepository */
  private $subscribersRepository;

  /** @var TrackingConfig */
  private $trackingConfig;

  /** @var Unsubscribes */
  private $unsubscribesTracker;

  /** @var AutomationAuthorization */
  private $authorization;

  public function __construct(
    SubscribersRepository $subscribersRepository,
    TrackingConfig $trackingConfig,
    Unsubscribes $unsubscribesTracker,
    AutomationAuthorization $authorization
  ) {
    $this->subscribersRepository = $subscribersRepository;
    $this->trackingConfig = $trackingConfig;
    $this->unsubscribesTracker = $unsubscribesTracker;
    $this->authorization = $authorization;
  }

  public function getKey(): string {
    return 'mailpoet:unsubscribe';
  }

  public function getName(): string {
    // translators: automation action title
    return __('Unsubscribe', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object();
  }

  public function getSubjectKeys(): array {
    return [
      SubscriberSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
    $this->authorization->authorizeSave($args->getAutomation(), [], $this->getAuthorizationMessage());
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorization->authorizeRun($args->getAutomation(), [], $this->getAuthorizationMessage());
    $subscriberId = $args->getSinglePayloadByClass(SubscriberPayload::class)->getId();
    $subscriber = $this->subscribersRepository->findOneById($subscriberId);
    if (!$subscriber) {
      throw InvalidStateException::create()->withMessage(sprintf("subscriber with ID '%s' not found", $subscriberId));
    }

    if ($this->trackingConfig->isEmailTrackingEnabled()) {
      $meta = json_encode([
        'automation' => $args->getAutomation()->getId(),
        'automation_run' => $args->getAutomationRun()->getId(),
        'step' => $args->getStep()->getId(),
      ]);
      $this->unsubscribesTracker->track(
        (int)$subscriber->getId(),
        StatisticsUnsubscribeEntity::SOURCE_AUTOMATION,
        null,
        $meta ?: null
      );
    }

    $subscriber->setStatus(SubscriberEntity::STATUS_UNSUBSCRIBED);
    $this->subscribersRepository->persist($subscriber);
    $this->subscribersRepository->flush();
  }

  public function onDuplicate(Step $step): Step {
    // Intentionally left empty for now
    return $step;
  }

  private function getAuthorizationMessage(): string {
    return __('The user who last saved this automation is not allowed to manage automations.', 'mailpoet-premium');
  }
}
