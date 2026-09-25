<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\ActionScheduler;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Automation\Engine\WordPress;

class SavedCardExpiresTriggerHooks {

  private const ENSURE_SCHEDULED_THROTTLE = 'mailpoet_premium_saved_card_expires_hook_ensured';
  private const ENSURE_SCHEDULED_THROTTLE_SECONDS = 3600;

  private WordPress $wp;
  private ActionScheduler $actionScheduler;
  private AutomationStorage $automationStorage;

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

    if ($this->actionScheduler->hasScheduledAction(SavedCardExpiresTrigger::SCHEDULED_HOOK)) {
      return;
    }

    if (count($this->automationStorage->getActiveAutomationsByTriggerKey(SavedCardExpiresTrigger::KEY)) > 0) {
      $this->scheduleHook();
    }
  }

  public function handleBeforeSave(Automation $automation): void {
    $trigger = $automation->getTrigger(SavedCardExpiresTrigger::KEY);
    if (!$trigger) {
      return;
    }

    $isBecomingActive = $automation->getStatus() === Automation::STATUS_ACTIVE;
    $activeAutomations = $this->automationStorage->getActiveAutomationsByTriggerKey(SavedCardExpiresTrigger::KEY);
    $activeCount = count($activeAutomations);

    $isCurrentlyActive = false;
    foreach ($activeAutomations as $activeAutomation) {
      if ($activeAutomation->getId() === $automation->getId()) {
        $isCurrentlyActive = true;
        break;
      }
    }

    if ($isBecomingActive && !$isCurrentlyActive && $activeCount === 0) {
      $this->scheduleHook();
    } elseif (!$isBecomingActive && $isCurrentlyActive && $activeCount === 1) {
      $this->actionScheduler->unscheduleAction(SavedCardExpiresTrigger::SCHEDULED_HOOK);
    }
  }

  private function scheduleHook(): void {
    if ($this->actionScheduler->hasScheduledAction(SavedCardExpiresTrigger::SCHEDULED_HOOK)) {
      return;
    }

    $now = new \DateTimeImmutable('now', $this->wp->wpTimezone());
    $nextHourTime = $now->modify('+1 hour');
    $nextHour = $nextHourTime->setTime((int)$nextHourTime->format('G'), 0);
    $this->actionScheduler->schedule((int)$nextHour->getTimestamp(), SavedCardExpiresTrigger::SCHEDULED_HOOK);
  }
}
