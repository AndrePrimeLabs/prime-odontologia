<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

namespace MailPoet\Premium\Subscriber\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\StatisticsClickEntity;
use MailPoet\Entities\StatisticsOpenEntity;
use MailPoet\Entities\StatisticsUnsubscribeEntity;
use MailPoet\Entities\StatisticsWooCommercePurchaseEntity;

/**
 * A single, flat activity event for the subscriber activity feed.
 *
 * Each event maps to exactly one row in the listing. The grouping by
 * newsletter that the feed used to do on the client is gone: filtering,
 * sorting and pagination now happen server-side over these events.
 */
class SubscriberActivityEvent {
  const TYPE_OPEN = 'open';
  const TYPE_CLICK = 'click';
  const TYPE_PURCHASE = 'purchase';
  const TYPE_UNSUBSCRIBE = 'unsubscribe';

  /** @var string */
  private $type;

  /** @var \DateTimeInterface */
  private $createdAt;

  /** @var NewsletterEntity|null */
  private $newsletter;

  /** @var StatisticsOpenEntity|null */
  private $open;

  /** @var StatisticsClickEntity|null */
  private $click;

  /** @var StatisticsUnsubscribeEntity|null */
  private $unsubscribe;

  /** @var StatisticsWooCommercePurchaseEntity|null */
  private $purchase;

  private function __construct(
    string $type,
    \DateTimeInterface $createdAt,
    ?NewsletterEntity $newsletter
  ) {
    $this->type = $type;
    $this->createdAt = $createdAt;
    $this->newsletter = $newsletter;
  }

  public static function forOpen(StatisticsOpenEntity $open, \DateTimeInterface $createdAt): self {
    $event = new self(self::TYPE_OPEN, $createdAt, $open->getNewsletter());
    $event->open = $open;
    return $event;
  }

  public static function forClick(StatisticsClickEntity $click, \DateTimeInterface $createdAt): self {
    $event = new self(self::TYPE_CLICK, $createdAt, $click->getNewsletter());
    $event->click = $click;
    return $event;
  }

  public static function forPurchase(StatisticsWooCommercePurchaseEntity $purchase, \DateTimeInterface $createdAt): self {
    $event = new self(self::TYPE_PURCHASE, $createdAt, $purchase->getNewsletter());
    $event->purchase = $purchase;
    return $event;
  }

  public static function forUnsubscribe(StatisticsUnsubscribeEntity $unsubscribe, \DateTimeInterface $createdAt): self {
    $event = new self(self::TYPE_UNSUBSCRIBE, $createdAt, $unsubscribe->getNewsletter());
    $event->unsubscribe = $unsubscribe;
    return $event;
  }

  public function getType(): string {
    return $this->type;
  }

  public function getCreatedAt(): \DateTimeInterface {
    return $this->createdAt;
  }

  public function getNewsletter(): ?NewsletterEntity {
    return $this->newsletter;
  }

  public function getOpen(): ?StatisticsOpenEntity {
    return $this->open;
  }

  public function getClick(): ?StatisticsClickEntity {
    return $this->click;
  }

  public function getUnsubscribe(): ?StatisticsUnsubscribeEntity {
    return $this->unsubscribe;
  }

  public function getPurchase(): ?StatisticsWooCommercePurchaseEntity {
    return $this->purchase;
  }
}
