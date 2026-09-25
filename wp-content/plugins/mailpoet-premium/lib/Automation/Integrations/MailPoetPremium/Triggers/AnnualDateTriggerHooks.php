<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Automation\Engine\WordPress;

class AnnualDateTriggerHooks {

  private const ENSURE_SCHEDULED_THROTTLE = 'mailpoet_premium_annual_date_hook_ensured';
  private const ENSURE_SCHEDULED_THROTTLE_SECONDS = 3600;

  /** @var WordPress */
  private $wp;

  /** @var ActionScheduler */
  private $actionScheduler;

  /** @var AutomationStorage */
  private $automationStorage;

  public function __construct(
    WordPress $wp,
    ActionScheduler $actionScheduler,
    AutomationStorage $automationStorage
  ) {
    $this->wp = $wp;
    $this->actionScheduler = $actionScheduler;
    $this->automationStorage = $automationStorage;
  }

  public function init(): void {
    $this->wp->addAction(Hooks::AUTOMATION_BEFORE_SAVE, [$this, 'handleBeforeSave']);
    $this->ensureScheduledHook();
  }

  /**
   * Self-heals automations whose hourly hook stopped being rescheduled (e.g.
   * sites that ran the buggy version where the chain died after the first run).
   * Throttled so it queries Action Scheduler at most once per hour. When active
   * automations exist but no run is queued, it reschedules the hook.
   */
  public function ensureScheduledHook(): void {
    if ($this->wp->getTransient(self::ENSURE_SCHEDULED_THROTTLE)) {
      return;
    }
    $this->wp->setTransient(self::ENSURE_SCHEDULED_THROTTLE, 1, self::ENSURE_SCHEDULED_THROTTLE_SECONDS);

    if ($this->actionScheduler->hasScheduledAction(AnnualDateTrigger::SCHEDULED_HOOK)) {
      return;
    }

    if (count($this->automationStorage->getActiveAutomationsByTriggerKey(AnnualDateTrigger::KEY)) > 0) {
      $this->scheduleHook();
    }
  }

  public function handleBeforeSave(Automation $automation): void {
    $trigger = $automation->getTrigger(AnnualDateTrigger::KEY);
    if (!$trigger) {
      return;
    }

    $isBecomingActive = $automation->getStatus() === Automation::STATUS_ACTIVE;

    // Count how many automations with this trigger are currently active (before this save)
    $activeAutomations = $this->automationStorage->getActiveAutomationsByTriggerKey(AnnualDateTrigger::KEY);
    $activeCount = count($activeAutomations);

    // Check if this automation is already counted among active ones (i.e. it was already active)
    $isCurrentlyActive = false;
    foreach ($activeAutomations as $activeAutomation) {
      if ($activeAutomation->getId() === $automation->getId()) {
        $isCurrentlyActive = true;
        break;
      }
    }

    if ($isBecomingActive && !$isCurrentlyActive && $activeCount === 0) {
      // First automation being activated — schedule the daily hook
      $this->scheduleHook();
    } elseif (!$isBecomingActive && $isCurrentlyActive && $activeCount === 1) {
      // Last active automation being deactivated — unschedule the hook
      $this->actionScheduler->unscheduleAction(AnnualDateTrigger::SCHEDULED_HOOK);
    }
  }

  private function scheduleHook(): void {
    if ($this->actionScheduler->hasScheduledAction(AnnualDateTrigger::SCHEDULED_HOOK)) {
      return;
    }

    $now = new \DateTimeImmutable('now', $this->wp->wpTimezone());
    $nextHourTime = $now->modify('+1 hour');
    $nextHour = $nextHourTime->setTime((int)$nextHourTime->format('G'), 0);
    $this->actionScheduler->schedule((int)$nextHour->getTimestamp(), AnnualDateTrigger::SCHEDULED_HOOK);
  }
}
