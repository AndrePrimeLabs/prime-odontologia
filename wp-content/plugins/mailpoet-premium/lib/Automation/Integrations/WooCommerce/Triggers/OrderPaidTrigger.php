<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Engine\Storage\AutomationRunStorage;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\CustomerSubject;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\OrderSubject;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class OrderPaidTrigger implements Trigger {
  public const KEY = 'woocommerce:order-paid';

  /** @var WordPress */
  private $wp;

  /** @var WooCommerce */
  private $woocommerce;

  /** @var AutomationRunStorage */
  private $automationRunStorage;

  public function __construct(
    WordPress $wp,
    WooCommerce $woocommerce,
    AutomationRunStorage $automationRunStorage
  ) {
    $this->wp = $wp;
    $this->woocommerce = $woocommerce;
    $this->automationRunStorage = $automationRunStorage;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('Order paid', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object();
  }

  public function getSubjectKeys(): array {
    return [
      OrderSubject::KEY,
      CustomerSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
  }

  public function registerHooks(): void {
    $this->wp->addAction(
      'woocommerce_payment_complete',
      [
        $this,
        'handlePaymentComplete',
      ]
    );

    $this->wp->addAction(
      'woocommerce_order_status_changed',
      [
        $this,
        'handleStatusChanged',
      ],
      10,
      3
    );
  }

  public function handlePaymentComplete(int $orderId): void {
    $order = $this->woocommerce->wcGetOrder($orderId);
    if (!$order instanceof \WC_Order) {
      return;
    }

    $this->triggerOrder($order);
  }

  public function handleStatusChanged(int $orderId, string $oldStatus, string $newStatus): void {
    $paidStatuses = $this->woocommerce->wcGetIsPaidStatuses();
    if (in_array($oldStatus, $paidStatuses, true) || !in_array($newStatus, $paidStatuses, true)) {
      return;
    }

    $order = $this->woocommerce->wcGetOrder($orderId);
    if (!$order instanceof \WC_Order) {
      return;
    }

    $this->triggerOrder($order);
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    $orderSubjects = $args->getAutomationRun()->getSubjects(OrderSubject::KEY);
    $orderSubject = $orderSubjects[0] ?? null;
    if (!$orderSubject) {
      return false;
    }

    return $this->automationRunStorage->getCountByAutomationTriggerAndSubject(
      $args->getAutomation(),
      self::KEY,
      $orderSubject
    ) === 0;
  }

  private function triggerOrder(\WC_Order $order): void {
    $this->wp->doAction(Hooks::TRIGGER, $this, [
      new Subject(OrderSubject::KEY, ['order_id' => $order->get_id()]),
      new Subject(CustomerSubject::KEY, ['customer_id' => $order->get_customer_id(), 'order_id' => $order->get_id()]),
    ]);
  }
}
