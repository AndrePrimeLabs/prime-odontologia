<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

namespace MailPoet\Premium\Subscriber\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\StatisticsClickEntity;
use MailPoet\Entities\StatisticsOpenEntity;
use MailPoet\Entities\StatisticsUnsubscribeEntity;
use MailPoet\Entities\StatisticsWooCommercePurchaseEntity;
use MailPoet\Listing\ListingDefinition;
use MailPoet\Listing\ListingRepository;
use MailPoet\WooCommerce\Helper as WCHelper;
use MailPoetVendor\Doctrine\ORM\EntityManager;
use MailPoetVendor\Doctrine\ORM\QueryBuilder;

class SubscriberNewsletterStatsRepository extends ListingRepository {
  const SORT_BY_DATE = 'date';
  const SORT_BY_EVENT_TYPE = 'eventType';

  /** @var WCHelper */
  private $wooCommerceHelper;

  /**
   * @var array{signature: string, events: SubscriberActivityEvent[]}|null
   * Memoizes the assembled event list so getActivityData() + getActivityCount()
   * for the same request don't compute it twice.
   */
  private $eventsCache = null;

  public function __construct(
    EntityManager $entityManager,
    WCHelper $wooCommerceHelper
  ) {
    parent::__construct($entityManager);
    $this->wooCommerceHelper = $wooCommerceHelper;
  }

  /**
   * @return SubscriberActivityEvent[]
   */
  public function getActivityData(ListingDefinition $definition): array {
    $events = $this->buildEvents($definition);
    return array_slice($events, $definition->getOffset(), $definition->getLimit());
  }

  public function getActivityCount(ListingDefinition $definition): int {
    return count($this->buildEvents($definition));
  }

  /**
   * @return SubscriberActivityEvent[]
   */
  private function buildEvents(ListingDefinition $definition): array {
    $signature = $this->getDefinitionSignature($definition);
    if ($this->eventsCache !== null && $this->eventsCache['signature'] === $signature) {
      return $this->eventsCache['events'];
    }

    $subscriberId = $definition->getParameters()['id'] ?? null;
    if (!$subscriberId) {
      $this->eventsCache = ['signature' => $signature, 'events' => []];
      return [];
    }

    $filters = $definition->getFilters() ?: [];
    $types = $this->normalizeEventTypes($filters['eventType'] ?? null);
    $from = $this->parseDate($filters['fromDate'] ?? null);
    $to = $this->parseDate($filters['toDate'] ?? null);
    // `toDate` arrives as a whole-day boundary (Y-m-d), so make it inclusive of
    // the entire day to match the logs listing's date-range semantics.
    if ($to instanceof \DateTimeImmutable) {
      $to = $to->setTime(23, 59, 59);
    }
    $search = $definition->getSearch();
    $search = ($search !== null && strlen(trim($search)) > 0) ? trim($search) : null;

    $events = [];
    if (in_array(SubscriberActivityEvent::TYPE_OPEN, $types, true)) {
      $events = array_merge($events, $this->getOpenEvents($subscriberId, $from, $to, $search));
    }
    if (in_array(SubscriberActivityEvent::TYPE_CLICK, $types, true)) {
      $events = array_merge($events, $this->getClickEvents($subscriberId, $from, $to, $search));
    }
    if (in_array(SubscriberActivityEvent::TYPE_PURCHASE, $types, true)) {
      $events = array_merge($events, $this->getPurchaseEvents($subscriberId, $from, $to, $search));
    }
    if (in_array(SubscriberActivityEvent::TYPE_UNSUBSCRIBE, $types, true)) {
      $events = array_merge($events, $this->getUnsubscribeEvents($subscriberId, $from, $to, $search));
    }

    $this->sortEvents($events, $definition->getSortBy(), $definition->getSortOrder());

    $this->eventsCache = ['signature' => $signature, 'events' => $events];
    return $events;
  }

  /**
   * @param int|string $subscriberId
   * @return SubscriberActivityEvent[]
   */
  private function getOpenEvents($subscriberId, ?\DateTimeInterface $from, ?\DateTimeInterface $to, ?string $search): array {
    $queryBuilder = clone $this->queryBuilder;
    $queryBuilder
      ->select('o, n')
      ->from(StatisticsOpenEntity::class, 'o')
      ->join('o.newsletter', 'n')
      ->where('o.subscriber = :subscriber')
      ->setParameter('subscriber', $subscriberId);
    $this->applyDateRange($queryBuilder, 'o.createdAt', $from, $to);
    if ($search !== null) {
      $this->applyNewsletterSearch($queryBuilder, 'n', $search);
    }

    $events = [];
    /** @var StatisticsOpenEntity $open */
    foreach ($queryBuilder->getQuery()->getResult() as $open) {
      $createdAt = $open->getCreatedAt();
      if ($createdAt instanceof \DateTimeInterface) {
        $events[] = SubscriberActivityEvent::forOpen($open, $createdAt);
      }
    }
    return $events;
  }

  /**
   * @param int|string $subscriberId
   * @return SubscriberActivityEvent[]
   */
  private function getClickEvents($subscriberId, ?\DateTimeInterface $from, ?\DateTimeInterface $to, ?string $search): array {
    $queryBuilder = clone $this->queryBuilder;
    $queryBuilder
      ->select('c, l, n')
      ->from(StatisticsClickEntity::class, 'c')
      ->join('c.link', 'l')
      ->join('c.newsletter', 'n')
      ->where('c.subscriber = :subscriber')
      ->setParameter('subscriber', $subscriberId);
    $this->applyDateRange($queryBuilder, 'c.createdAt', $from, $to);
    if ($search !== null) {
      $escaped = $this->escapeLike($search);
      $queryBuilder
        ->andWhere('n.subject LIKE :search OR l.url LIKE :search')
        ->setParameter('search', "%$escaped%");
    }

    $events = [];
    /** @var StatisticsClickEntity $click */
    foreach ($queryBuilder->getQuery()->getResult() as $click) {
      $createdAt = $click->getCreatedAt();
      if ($createdAt instanceof \DateTimeInterface) {
        $events[] = SubscriberActivityEvent::forClick($click, $createdAt);
      }
    }
    return $events;
  }

  /**
   * @param int|string $subscriberId
   * @return SubscriberActivityEvent[]
   */
  private function getPurchaseEvents($subscriberId, ?\DateTimeInterface $from, ?\DateTimeInterface $to, ?string $search): array {
    $queryBuilder = clone $this->queryBuilder;
    $queryBuilder
      ->select('wp, n')
      ->from(StatisticsWooCommercePurchaseEntity::class, 'wp')
      ->leftJoin('wp.newsletter', 'n')
      ->where('wp.subscriber = :subscriber')
      ->andWhere('wp.status IN (:states)')
      ->setParameter('subscriber', $subscriberId)
      ->setParameter('states', $this->wooCommerceHelper->getPurchaseStates());
    $this->applyDateRange($queryBuilder, 'wp.createdAt', $from, $to);
    if ($search !== null) {
      $escaped = $this->escapeLike($search);
      $queryBuilder
        ->andWhere("n.subject LIKE :search OR CONCAT('', wp.orderId) LIKE :search")
        ->setParameter('search', "%$escaped%");
    }

    $events = [];
    /** @var StatisticsWooCommercePurchaseEntity $purchase */
    foreach ($queryBuilder->getQuery()->getResult() as $purchase) {
      $createdAt = $purchase->getCreatedAt();
      if ($createdAt instanceof \DateTimeInterface) {
        $events[] = SubscriberActivityEvent::forPurchase($purchase, $createdAt);
      }
    }
    return $events;
  }

  /**
   * @param int|string $subscriberId
   * @return SubscriberActivityEvent[]
   */
  private function getUnsubscribeEvents($subscriberId, ?\DateTimeInterface $from, ?\DateTimeInterface $to, ?string $search): array {
    $queryBuilder = clone $this->queryBuilder;
    $queryBuilder
      ->select('u, n')
      ->from(StatisticsUnsubscribeEntity::class, 'u')
      ->leftJoin('u.newsletter', 'n')
      ->where('u.subscriber = :subscriber')
      ->setParameter('subscriber', $subscriberId);
    $this->applyDateRange($queryBuilder, 'u.createdAt', $from, $to);
    if ($search !== null) {
      $escaped = $this->escapeLike($search);
      $queryBuilder
        ->andWhere('n.subject LIKE :search OR u.reasonText LIKE :search')
        ->setParameter('search', "%$escaped%");
    }

    $events = [];
    /** @var StatisticsUnsubscribeEntity $unsubscribe */
    foreach ($queryBuilder->getQuery()->getResult() as $unsubscribe) {
      $createdAt = $unsubscribe->getCreatedAt();
      if ($createdAt instanceof \DateTimeInterface) {
        $events[] = SubscriberActivityEvent::forUnsubscribe($unsubscribe, $createdAt);
      }
    }
    return $events;
  }

  private function applyDateRange(QueryBuilder $queryBuilder, string $field, ?\DateTimeInterface $from, ?\DateTimeInterface $to): void {
    if ($from instanceof \DateTimeInterface) {
      $queryBuilder
        ->andWhere("$field >= :fromDate")
        ->setParameter('fromDate', $from);
    }
    if ($to instanceof \DateTimeInterface) {
      $queryBuilder
        ->andWhere("$field <= :toDate")
        ->setParameter('toDate', $to);
    }
  }

  private function applyNewsletterSearch(QueryBuilder $queryBuilder, string $alias, string $search): void {
    // campaign_name is derived from the linked WP post title, not a DB column,
    // so newsletter search matches on the subject only (as it did before).
    $escaped = $this->escapeLike($search);
    $queryBuilder
      ->andWhere("$alias.subject LIKE :search")
      ->setParameter('search', "%$escaped%");
  }

  /**
   * @param SubscriberActivityEvent[] $events
   */
  private function sortEvents(array &$events, string $sortBy, string $sortOrder): void {
    $direction = strtolower($sortOrder) === 'asc' ? 1 : -1;
    usort($events, function (SubscriberActivityEvent $first, SubscriberActivityEvent $second) use ($sortBy, $direction): int {
      if ($sortBy === self::SORT_BY_EVENT_TYPE) {
        // Sort by the translated label the user actually sees, not the
        // internal type, so the order matches the visible Event column.
        $result = strcmp(
          $this->getEventTypeLabel($first->getType()),
          $this->getEventTypeLabel($second->getType())
        );
        if ($result !== 0) {
          return $direction * $result;
        }
      }
      $result = $first->getCreatedAt()->getTimestamp() <=> $second->getCreatedAt()->getTimestamp();
      return $direction * $result;
    });
  }

  private function getEventTypeLabel(string $type): string {
    $labels = [
      SubscriberActivityEvent::TYPE_OPEN => __('Email open', 'mailpoet-premium'),
      SubscriberActivityEvent::TYPE_CLICK => __('Link click', 'mailpoet-premium'),
      SubscriberActivityEvent::TYPE_PURCHASE => __('Purchase', 'mailpoet-premium'),
      SubscriberActivityEvent::TYPE_UNSUBSCRIBE => __('Unsubscribe', 'mailpoet-premium'),
    ];
    return $labels[$type] ?? $type;
  }

  /**
   * @param mixed $eventType
   * @return string[]
   */
  private function normalizeEventTypes($eventType): array {
    $all = [
      SubscriberActivityEvent::TYPE_OPEN,
      SubscriberActivityEvent::TYPE_CLICK,
      SubscriberActivityEvent::TYPE_PURCHASE,
      SubscriberActivityEvent::TYPE_UNSUBSCRIBE,
    ];
    if ($eventType === null || $eventType === '' || $eventType === 'all') {
      return $all;
    }
    $requested = is_array($eventType) ? $eventType : [$eventType];
    $requested = array_filter($requested, function ($value): bool {
      return is_string($value);
    });
    $filtered = array_values(array_intersect($all, $requested));
    return empty($filtered) ? $all : $filtered;
  }

  /**
   * @param mixed $value
   */
  private function parseDate($value): ?\DateTimeInterface {
    if (!is_string($value) || trim($value) === '') {
      return null;
    }
    try {
      return new \DateTimeImmutable($value);
    } catch (\Exception $e) {
      return null;
    }
  }

  private function getDefinitionSignature(ListingDefinition $definition): string {
    return (string)wp_json_encode([
      'id' => $definition->getParameters()['id'] ?? null,
      'filters' => $definition->getFilters(),
      'search' => $definition->getSearch(),
      'sortBy' => $definition->getSortBy(),
      'sortOrder' => $definition->getSortOrder(),
    ]);
  }

  private function escapeLike(string $search): string {
    return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search);
  }

  protected function applySelectClause(QueryBuilder $queryBuilder) {
    $queryBuilder->select('o, n');
  }

  protected function applyFromClause(QueryBuilder $queryBuilder) {
    $queryBuilder->from(StatisticsOpenEntity::class, 'o')
      ->join('o.newsletter', 'n');
  }

  protected function applyGroup(QueryBuilder $queryBuilder, string $group) {
    // No groups for this listing
  }

  /**
   * @param QueryBuilder $queryBuilder
   * @param string $search
   * @param array<mixed> $parameters
   * @return void
   */
  protected function applySearch(QueryBuilder $queryBuilder, string $search, array $parameters = []) {
    $search = $this->escapeLike($search);
    $queryBuilder
      ->andWhere('n.subject LIKE :search')
      ->setParameter('search', "%$search%");
  }

  /**
   * @param QueryBuilder $queryBuilder
   * @param array<int|string> $filters
   */
  protected function applyFilters(QueryBuilder $queryBuilder, array $filters) {
    // Filtering is handled by buildEvents() for the activity feed
  }

  /**
   * @param QueryBuilder $queryBuilder
   * @param array<int|string> $parameters
   */
  protected function applyParameters(QueryBuilder $queryBuilder, array $parameters) {
    $subscriberId = $parameters['id'] ?? null;
    if ($subscriberId) {
      $queryBuilder
        ->andWhere('o.subscriber = :subscriber')
        ->setParameter('subscriber', $subscriberId);
    }
  }

  protected function applySorting(QueryBuilder $queryBuilder, string $sortBy, string $sortOrder) {
    $queryBuilder->addOrderBy('n.sentAt', 'desc');
  }
}
