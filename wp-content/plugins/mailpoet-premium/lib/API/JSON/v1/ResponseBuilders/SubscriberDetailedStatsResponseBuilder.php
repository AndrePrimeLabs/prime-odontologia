<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

namespace MailPoet\Premium\API\JSON\v1\ResponseBuilders;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\NewsletterLinkEntity;
use MailPoet\Entities\StatisticsClickEntity;
use MailPoet\Entities\StatisticsOpenEntity;
use MailPoet\Entities\StatisticsUnsubscribeEntity;
use MailPoet\Entities\StatisticsWooCommercePurchaseEntity;
use MailPoet\Entities\UserAgentEntity;
use MailPoet\Newsletter\Url as NewsletterUrl;
use MailPoet\Premium\Subscriber\Stats\SubscriberActivityEvent;
use MailPoet\Statistics\UnsubscribeReasonTracker;
use MailPoet\WooCommerce\Helper as WCHelper;

class SubscriberDetailedStatsResponseBuilder {
  const DATE_FORMAT = 'Y-m-d H:i:s';

  /** @var WCHelper */
  private $wooCommerce;

  /** @var NewsletterUrl */
  private $newsletterUrl;

  /** @var UnsubscribeReasonTracker */
  private $unsubscribeReasonTracker;

  public function __construct(
    NewsletterUrl $newsletterUrl,
    WCHelper $wooCommerce,
    UnsubscribeReasonTracker $unsubscribeReasonTracker
  ) {
    $this->newsletterUrl = $newsletterUrl;
    $this->wooCommerce = $wooCommerce;
    $this->unsubscribeReasonTracker = $unsubscribeReasonTracker;
  }

  /**
   * @param SubscriberActivityEvent[] $events
   * @return array<int, array<string, mixed>>
   */
  public function buildEvents(array $events): array {
    $reasonLabels = $this->unsubscribeReasonTracker->getReasonLabels();
    $response = [];
    foreach ($events as $event) {
      $response[] = $this->buildEvent($event, $reasonLabels);
    }
    return $response;
  }

  /**
   * @param array<string, string> $reasonLabels
   * @return array<string, mixed>
   */
  private function buildEvent(SubscriberActivityEvent $event, array $reasonLabels): array {
    $base = [
      'created_at' => $event->getCreatedAt()->format(self::DATE_FORMAT),
      'newsletter' => $this->buildNewsletter($event->getNewsletter()),
    ];

    $open = $event->getOpen();
    if ($open instanceof StatisticsOpenEntity) {
      return array_merge($base, $this->buildOpen($open));
    }
    $click = $event->getClick();
    if ($click instanceof StatisticsClickEntity) {
      return array_merge($base, $this->buildClick($click));
    }
    $purchase = $event->getPurchase();
    if ($purchase instanceof StatisticsWooCommercePurchaseEntity) {
      return array_merge($base, $this->buildPurchase($purchase));
    }
    $unsubscribe = $event->getUnsubscribe();
    if ($unsubscribe instanceof StatisticsUnsubscribeEntity) {
      return array_merge($base, $this->buildUnsubscribe($unsubscribe, $reasonLabels));
    }

    throw new \InvalidArgumentException('Activity event has no associated statistic entity.');
  }

  /**
   * @param NewsletterEntity|null $newsletter
   *
   * @return array{
   *   id: int|null,
   *   preview_url: string,
   *   subject: string,
   *   campaign_name: string|null,
   *   sent_at: non-empty-string|null
   * }|null
   */
  private function buildNewsletter(?NewsletterEntity $newsletter): ?array {
    if (!$newsletter instanceof NewsletterEntity) {
      return null;
    }

    $sentAt = $newsletter->getSentAt();
    $previewUrl = $this->newsletterUrl->getViewInBrowserUrl(
      $newsletter,
      null,
      in_array($newsletter->getStatus(), [NewsletterEntity::STATUS_SENT, NewsletterEntity::STATUS_SENDING], true)
        ? $newsletter->getLatestQueue()
        : null
    );
    return [
      'id' => $newsletter->getId(),
      'preview_url' => $previewUrl,
      'subject' => $newsletter->getSubject(),
      'campaign_name' => $newsletter->getCampaignName(),
      'sent_at' => $sentAt ? $sentAt->format(self::DATE_FORMAT) : null,
    ];
  }

  /**
   * @return array<string, int|string|null>
   */
  private function buildOpen(StatisticsOpenEntity $open): array {
    return [
      'id' => 'open-' . $open->getId(),
      'type' => $open->getUserAgentType() === UserAgentEntity::USER_AGENT_TYPE_MACHINE ? 'machine-open' : 'open',
    ];
  }

  /**
   * @return array<string, int|string|null>
   */
  private function buildClick(StatisticsClickEntity $click): array {
    $link = $click->getLink();
    $linkUrl = ($link instanceof NewsletterLinkEntity) ? $link->getUrl() : '';
    return [
      'id' => 'click-' . $click->getId(),
      'type' => 'click',
      'count' => $click->getCount(),
      'url' => $linkUrl,
    ];
  }

  /**
   * @return array<string, int|string|null>
   */
  private function buildPurchase(StatisticsWooCommercePurchaseEntity $purchase): array {
    $order = $this->wooCommerce->wcGetOrder($purchase->getOrderId());
    return [
      'id' => 'purchase-' . $purchase->getId(),
      'type' => 'purchase',
      'order_id' => $purchase->getOrderId(),
      'order_url' => $order instanceof \WC_Order ? $order->get_edit_order_url() : null,
      'revenue' => $this->wooCommerce->getRawPrice(
        $purchase->getOrderPriceTotal(),
        ['currency' => $purchase->getOrderCurrency()]
      ),
    ];
  }

  /**
   * @param array<string, string> $reasonLabels
   * @return array<string, int|string|null>
   */
  private function buildUnsubscribe(StatisticsUnsubscribeEntity $unsubscribe, array $reasonLabels): array {
    $reasonText = $unsubscribe->getReasonText();
    $reasonText = $reasonText !== null ? trim($reasonText) : null;
    $reasonSubmittedAt = $unsubscribe->getReasonSubmittedAt();

    return [
      'id' => 'unsubscribe-' . $unsubscribe->getId(),
      'type' => 'unsubscribe',
      'reason' => $unsubscribe->getReason(),
      'reason_label' => $this->getUnsubscribeReasonLabel($unsubscribe->getReason(), $reasonLabels),
      'reason_text' => $reasonText !== null && $reasonText !== '' ? $reasonText : null,
      'reason_submitted_at' => $reasonSubmittedAt instanceof \DateTimeInterface
        ? $reasonSubmittedAt->format(self::DATE_FORMAT)
        : null,
    ];
  }

  /**
   * @param array<string, string> $reasonLabels
   */
  private function getUnsubscribeReasonLabel(?string $reason, array $reasonLabels): string {
    if ($reason === null) {
      return __('No reason provided', 'mailpoet-premium');
    }
    if ($reason === '' || $reason === StatisticsUnsubscribeEntity::REASON_UNSPECIFIED) {
      return __('No reason provided', 'mailpoet-premium');
    }
    return $reasonLabels[$reason] ?? $reason;
  }
}
