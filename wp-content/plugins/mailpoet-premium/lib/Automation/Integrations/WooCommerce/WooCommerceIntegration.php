<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration;
use MailPoet\Automation\Engine\Registry;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Actions\AddOrderNoteAction;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Actions\ChangeOrderStatusAction;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Actions\Extenders\ReviewCrossSellHandler;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\CustomerWinBackSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\ReviewSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\SavedCardSubject;
use MailPoet\Premium\Automation\Integrations\WooCommerce\SubjectTransformers\SavedCardSubjectToWordPressUserSubjectTransformer;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\CustomerWinBackScheduler;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\CustomerWinBackTrigger;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\MadeAReviewTrigger;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\OrderPaidTrigger;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\SavedCardExpiresTrigger;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\SavedCardExpiresTriggerHooks;

class WooCommerceIntegration implements Integration {

  /** @var MadeAReviewTrigger */
  private $madeAReview;

  /** @var ChangeOrderStatusAction */
  private $changeOrderStatusAction;

  /** @var AddOrderNoteAction */
  private $addOrderNoteAction;

  /** @var OrderPaidTrigger */
  private $orderPaid;

  /** @var ReviewSubject */
  private $reviewSubject;

  /** @var CustomerWinBackSubject */
  private $customerWinBackSubject;

  /** @var CustomerWinBackTrigger */
  private $customerWinBackTrigger;

  /** @var CustomerWinBackScheduler */
  private $customerWinBackScheduler;

  /** @var ReviewCrossSellHandler */
  private $reviewCrossSellHandler;

  /** @var WordPress */
  private $wordPress;

  /** @var SavedCardSubject */
  private $savedCardSubject;

  /** @var SavedCardExpiresTrigger */
  private $savedCardExpiresTrigger;

  /** @var SavedCardExpiresTriggerHooks */
  private $savedCardExpiresTriggerHooks;

  /** @var SavedCardSubjectToWordPressUserSubjectTransformer */
  private $savedCardSubjectToWordPressUserSubjectTransformer;

  public function __construct(
    MadeAReviewTrigger $madeAReview,
    ChangeOrderStatusAction $changeOrderStatusAction,
    AddOrderNoteAction $addOrderNoteAction,
    OrderPaidTrigger $orderPaid,
    ReviewSubject $reviewSubject,
    CustomerWinBackSubject $customerWinBackSubject,
    CustomerWinBackTrigger $customerWinBackTrigger,
    CustomerWinBackScheduler $customerWinBackScheduler,
    ReviewCrossSellHandler $reviewCrossSellHandler,
    WordPress $wordPress,
    SavedCardSubject $savedCardSubject,
    SavedCardExpiresTrigger $savedCardExpiresTrigger,
    SavedCardExpiresTriggerHooks $savedCardExpiresTriggerHooks,
    SavedCardSubjectToWordPressUserSubjectTransformer $savedCardSubjectToWordPressUserSubjectTransformer
  ) {
    $this->madeAReview = $madeAReview;
    $this->changeOrderStatusAction = $changeOrderStatusAction;
    $this->addOrderNoteAction = $addOrderNoteAction;
    $this->orderPaid = $orderPaid;
    $this->reviewSubject = $reviewSubject;
    $this->customerWinBackSubject = $customerWinBackSubject;
    $this->customerWinBackTrigger = $customerWinBackTrigger;
    $this->customerWinBackScheduler = $customerWinBackScheduler;
    $this->reviewCrossSellHandler = $reviewCrossSellHandler;
    $this->wordPress = $wordPress;
    $this->savedCardSubject = $savedCardSubject;
    $this->savedCardExpiresTrigger = $savedCardExpiresTrigger;
    $this->savedCardExpiresTriggerHooks = $savedCardExpiresTriggerHooks;
    $this->savedCardSubjectToWordPressUserSubjectTransformer = $savedCardSubjectToWordPressUserSubjectTransformer;
  }

  public function register(Registry $registry): void {
    $registry->addTrigger($this->madeAReview);
    $registry->addTrigger($this->orderPaid);
    $registry->addTrigger($this->customerWinBackTrigger);
    $registry->addAction($this->changeOrderStatusAction);
    $registry->addAction($this->addOrderNoteAction);
    $registry->addSubject($this->reviewSubject);
    $registry->addSubject($this->customerWinBackSubject);
    $this->customerWinBackScheduler->init();

    $registry->addSubject($this->savedCardSubject);
    $registry->addTrigger($this->savedCardExpiresTrigger);
    $this->savedCardExpiresTriggerHooks->init();
    $registry->addSubjectTransformer($this->savedCardSubjectToWordPressUserSubjectTransformer);

    $this->wordPress->addFilter('mailpoet_automation_send_email_action_meta', [$this->reviewCrossSellHandler, 'addReviewCrossSells'], 10, 2);
    $this->wordPress->addFilter('mailpoet_dynamic_products_meta', [$this->reviewCrossSellHandler, 'handleDynamicProductsMeta'], 10, 2);
  }
}
