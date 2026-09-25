<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration;
use MailPoet\Automation\Engine\Registry;
use MailPoet\Logging\LoggerFactory;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\AddTagAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\AddToListAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\CustomAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\NotificationEmailAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\RemoveFromListAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\RemoveTagAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\UnsubscribeAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\UpdateSubscriberAction;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Analytics;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects\CustomDataSubject;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects\TagSubject;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects\UserRoleChangeSubject;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Templates\PremiumTemplatesFactory;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\AnnualDateTrigger;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\AnnualDateTriggerHooks;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\ClicksEmailLinkTrigger;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\CustomTrigger;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\TagAddedTrigger;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\TagRemovedTrigger;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\UserRoleChangedTrigger;

class MailPoetPremiumIntegration implements Integration {
  /** @var ContextFactory */
  private $contextFactory;

  /** @var UnsubscribeAction */
  private $unsubscribeAction;

  /** @var AddTagAction */
  private $addTagAction;

  /** @var RemoveTagAction  */
  private $removeTagAction;

  /** @var AddToListAction */
  private $addToListAction;

  /** @var RemoveFromListAction */
  private $removeFromListAction;

  /** @var UpdateSubscriberAction */
  private $updateSubscriberAction;

  /** @var NotificationEmailAction */
  private $notificationEmailAction;

  /** @var CustomTrigger */
  private $customTrigger;

  /** @var CustomDataSubject */
  private $customDataSubject;

  /** @var UserRoleChangeSubject */
  private $userRoleChangeSubject;

  /** @var CustomAction */
  private $customAction;

  /** @var TagAddedTrigger  */
  private $tagAddedTrigger;

  /** @var TagRemovedTrigger  */
  private $tagRemovedTrigger;

  /** @var ClicksEmailLinkTrigger */
  private $clicksEmailLinkTrigger;

  /** @var UserRoleChangedTrigger */
  private $userRoleChangedTrigger;

  /** @var TagSubject  */
  private $tagSubject;

  /** @var PremiumTemplatesFactory */
  private $premiumTemplatesFactory;

  /** @var AnnualDateTrigger */
  private $annualDateTrigger;

  /** @var AnnualDateTriggerHooks */
  private $annualDateTriggerHooks;

  /** @var Analytics */
  private $analytics;

  public function __construct(
    ContextFactory $contextFactory,
    UnsubscribeAction $unsubscribeAction,
    AddTagAction $addTagAction,
    RemoveTagAction $removeTagAction,
    AddToListAction $addToListAction,
    RemoveFromListAction $removeFromListAction,
    UpdateSubscriberAction $updateSubscriberAction,
    NotificationEmailAction $notificationEmailAction,
    CustomTrigger $customTrigger,
    ClicksEmailLinkTrigger $clicksEmailLinkTrigger,
    CustomDataSubject $customDataSubject,
    CustomAction $customAction,
    TagAddedTrigger $tagAddedTrigger,
    TagRemovedTrigger $tagRemovedTrigger,
    TagSubject $tagSubject,
    UserRoleChangeSubject $userRoleChangeSubject,
    UserRoleChangedTrigger $userRoleChangedTrigger,
    PremiumTemplatesFactory $premiumTemplatesFactory,
    Analytics $analytics,
    AnnualDateTrigger $annualDateTrigger,
    AnnualDateTriggerHooks $annualDateTriggerHooks
  ) {
    $this->contextFactory = $contextFactory;
    $this->unsubscribeAction = $unsubscribeAction;
    $this->addTagAction = $addTagAction;
    $this->removeTagAction = $removeTagAction;
    $this->addToListAction = $addToListAction;
    $this->tagRemovedTrigger = $tagRemovedTrigger;
    $this->removeFromListAction = $removeFromListAction;
    $this->updateSubscriberAction = $updateSubscriberAction;
    $this->notificationEmailAction = $notificationEmailAction;
    $this->customTrigger = $customTrigger;
    $this->clicksEmailLinkTrigger = $clicksEmailLinkTrigger;
    $this->customDataSubject = $customDataSubject;
    $this->customAction = $customAction;
    $this->tagAddedTrigger = $tagAddedTrigger;
    $this->tagSubject = $tagSubject;
    $this->userRoleChangeSubject = $userRoleChangeSubject;
    $this->userRoleChangedTrigger = $userRoleChangedTrigger;
    $this->premiumTemplatesFactory = $premiumTemplatesFactory;
    $this->analytics = $analytics;
    $this->annualDateTrigger = $annualDateTrigger;
    $this->annualDateTriggerHooks = $annualDateTriggerHooks;
  }

  public function register(Registry $registry): void {
    $registry->addContextFactory('mailpoet-premium', function () {
      return $this->contextFactory->getContextData();
    });

    $registry->addAction($this->unsubscribeAction);
    $registry->addAction($this->addTagAction);
    $registry->addAction($this->removeTagAction);
    $registry->addAction($this->addToListAction);
    $registry->addAction($this->removeFromListAction);
    $registry->addAction($this->updateSubscriberAction);
    $registry->addAction($this->notificationEmailAction);
    $registry->addTrigger($this->annualDateTrigger);
    $this->annualDateTriggerHooks->init();
    $registry->addTrigger($this->customTrigger);
    $registry->addSubject($this->customDataSubject);
    $registry->addAction($this->customAction);
    $registry->addTrigger($this->tagAddedTrigger);
    $registry->addTrigger($this->tagRemovedTrigger);
    $registry->addTrigger($this->clicksEmailLinkTrigger);
    $registry->addSubject($this->tagSubject);
    $registry->addSubject($this->userRoleChangeSubject);
    $registry->addTrigger($this->userRoleChangedTrigger);

    // add/overwrite by premium templates
    foreach ($this->premiumTemplatesFactory->createTemplates() as $template) {
      $registry->removeTemplate($template->getSlug());
      try {
        $registry->addTemplate($template);
      } catch (\Throwable $e) {
        LoggerFactory::getInstance()->getLogger(LoggerFactory::TOPIC_PREMIUM)->error('Failed to register template "{slug}": {message}', ['slug' => $template->getSlug(), 'message' => $e->getMessage()]);
      }
    }

    $this->analytics->register();
  }
}
