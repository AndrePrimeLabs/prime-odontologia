<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Cron\Workers\StatsNotifications\NewsletterLinkRepository;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\NewsletterLinkEntity;
use MailPoet\Entities\SendingQueueEntity;
use MailPoet\Entities\StatisticsClickEntity;
use MailPoet\Entities\StatisticsNewsletterEntity;
use MailPoet\Entities\StatisticsOpenEntity;
use MailPoet\Entities\StatisticsUnsubscribeEntity;
use MailPoet\Entities\SubscriberEntity;
use MailPoet\Entities\UserAgentEntity;
use MailPoet\Listing;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Newsletter\Sending\TimeZoneCampaignScheduler;
use MailPoet\NotFoundException;
use MailPoet\Premium\Newsletter\StatisticsClicksRepository;
use MailPoet\Statistics\UnsubscribeReasonTracker;
use MailPoetVendor\Doctrine\DBAL\ParameterType;
use MailPoetVendor\Doctrine\ORM\EntityManager;

class SubscriberEngagement {
  use StatsListingFilterTrait;

  const STATUS_OPENED = 'opened';
  const STATUS_MACHINE_OPENED = 'machine-opened';
  const STATUS_CLICKED = 'clicked';
  const STATUS_UNSUBSCRIBED = 'unsubscribed';
  const STATUS_UNOPENED = 'unopened';

  /** @var Listing\Handler */
  private $listingHandler;

  /** @var EntityManager */
  private $entityManager;

  /** @var StatisticsClicksRepository */
  private $statisticsClicksRepository;

  /** @var NewslettersRepository */
  private $newslettersRepository;

  /** @var NewsletterLinkRepository */
  private $newsletterLinkRepository;

  /** @var UnsubscribeReasonTracker */
  private $unsubscribeReasonTracker;

  /** @var TimeZoneCampaignScheduler */
  private $timeZoneCampaignScheduler;

  public function __construct(
    Listing\Handler $listingHandler,
    EntityManager $entityManager,
    StatisticsClicksRepository $statisticsClicksRepository,
    NewsletterLinkRepository $newsletterLinkRepository,
    NewslettersRepository $newslettersRepository,
    UnsubscribeReasonTracker $unsubscribeReasonTracker,
    TimeZoneCampaignScheduler $timeZoneCampaignScheduler
  ) {
    $this->listingHandler = $listingHandler;
    $this->entityManager = $entityManager;
    $this->statisticsClicksRepository = $statisticsClicksRepository;
    $this->newslettersRepository = $newslettersRepository;
    $this->newsletterLinkRepository = $newsletterLinkRepository;
    $this->unsubscribeReasonTracker = $unsubscribeReasonTracker;
    $this->timeZoneCampaignScheduler = $timeZoneCampaignScheduler;
  }

  /**
   * @return Listing\ListingDefinition
   */
  private function parseData($data): Listing\ListingDefinition {
    // check if sort order was specified or default to "desc"
    $data['sort_order'] = ($data['sort_order'] ?? null) === 'asc' ? 'asc' : 'desc';

    // sanitize sort by
    $sortableColumns = ['email', 'status', 'created_at'];
    $sortBy = (!empty($data['sort_by']) && in_array($data['sort_by'], $sortableColumns, true))
      ? $data['sort_by']
      : '';

    if (empty($sortBy)) {
      $sortBy = 'created_at';
    }
    $data['sort_by'] = $sortBy;
    if (!empty($data['filter']['link'])) {
      $data['group'] = self::STATUS_CLICKED;
    }
    return $this->listingHandler->getListingDefinition($data);
  }

  /**
   * @param array{sort_order?: string, sort_by?: string|null, params?: array<string, int|null>, group?: string|null, filter?: array<string, mixed>} $data
   *
   * @return array{
   *   count: int,
   *   filters: array{link: array<int, array{label: string, value: string, url?: string, count?: int}>, delivery_timezone?: array<int, array{label: string, value: string}>},
   *   groups: array<int, array{name: string, label: string, count: int}>,
   *   items: array<int, array<string, mixed>>
   * }
   */
  public function get($data = []): array {
    $definition = $this->parseData($data);
    $newsletterId = $definition->getParameters()['id'];
    $newsletter = $this->newslettersRepository->findOneById($newsletterId);
    if (!$newsletter) {
      throw new NotFoundException();
    }

    $timezoneQueueMap = $this->getTimezoneQueueMap($newsletter);

    $countQuery = $this->getStatsQuery($definition, true, null, true, $timezoneQueueMap);
    if ($countQuery) {
      $query = 'SELECT COUNT(*) as cnt FROM ( ' . $countQuery . ' ) t ';

      /** @var int|null $result */
      $result = $this->entityManager->getConnection()->executeQuery($query, [
        'search' => $this->getSearchParameter($definition),
      ], [
        'search' => ParameterType::STRING,
      ])->fetchOne();
      $count = intval($result);

      $statsQuery = $this->getStatsQuery($definition, false, null, true, $timezoneQueueMap);
      $query = $statsQuery . " ORDER BY {$definition->getSortBy()} {$definition->getSortOrder()} LIMIT :limit OFFSET :offset ";
      $items = $this
        ->entityManager
        ->getConnection()
        ->executeQuery($query, [
          'limit' => $definition->getLimit(),
          'offset' => $definition->getOffset(),
          'search' => $this->getSearchParameter($definition),
        ], [
          'limit' => ParameterType::INTEGER,
          'offset' => ParameterType::INTEGER,
          'search' => ParameterType::STRING,
        ])
        ->fetchAllAssociative();
      $reasonLabels = $this->unsubscribeReasonTracker->getReasonLabels();
      $items = array_map(function (array $item) use ($reasonLabels, $timezoneQueueMap): array {
        $item = $this->addUnsubscribeReasonLabel($item, $reasonLabels);
        return $this->addDeliveryTimezone($item, $timezoneQueueMap);
      }, $items);
    } else {
      $count = 0;
      $items = [];
    }

    return [
      'count' => $count,
      'filters' => $this->filters($newsletter, $timezoneQueueMap),
      'groups' => $this->groups($definition, $newsletter, $timezoneQueueMap),
      'items' => $items,
    ];
  }

  /**
   * @param array<int, array{timezone: string, fallbackUsed: bool}> $timezoneQueueMap
   */
  private function getStatsQuery(Listing\ListingDefinition $definition, $count = false, $group = null, $applyConstraints = true, array $timezoneQueueMap = []) {
    $filterConstraint = '';
    $searchConstraint = '';
    $statusConstraint = '';
    $dateRange = ['from' => null, 'to' => null];
    $deliveryQueueIds = [];
    $newsletterId = intval($definition->getParameters()['id']);

    $subscriberTable = $this->entityManager->getClassMetadata(SubscriberEntity::class)->getTableName();
    $opensTable = $this->entityManager->getClassMetadata(StatisticsOpenEntity::class)->getTableName();
    $clicksTable = $this->entityManager->getClassMetadata(StatisticsClickEntity::class)->getTableName();
    $linksTable = $this->entityManager->getClassMetadata(NewsletterLinkEntity::class)->getTableName();
    $unsubscribeTable = $this->entityManager->getClassMetadata(StatisticsUnsubscribeEntity::class)->getTableName();
    $statisticsNewsletterTable = $this->entityManager->getClassMetadata(StatisticsNewsletterEntity::class)->getTableName();

    if ($applyConstraints) {
      $filterConstraint = $this->getFilterConstraint($definition);
      $searchConstraint = $this->getSearchConstraint($definition);
      $filters = $definition->getFilters();
      $statusConstraint = $this->buildStatusConstraint(
        'subscribers.status',
        $this->sanitizeSubscriberStatuses($filters['subscriber_status'] ?? null)
      );
      $dateRange = $this->sanitizeDateRange($filters);
      $deliveryQueueIds = $this->resolveDeliveryTimezoneQueueIds($filters, $timezoneQueueMap);
    }

    $dateConstraint = function (string $column) use ($dateRange): string {
      return $this->buildDateRangeConstraint($column, $dateRange['from'], $dateRange['to']);
    };

    $timezoneConstraint = function (string $alias) use ($deliveryQueueIds): string {
      return $this->buildIdInConstraint($alias . '.queue_id', $deliveryQueueIds);
    };

    $queries = [];

    $fields = [
      'opens.subscriber_id',
      'opens.newsletter_id',
      'opens.id as source_id',
      'NULL as link_id',
      'NULL as link_url',
      "'" . self::STATUS_OPENED . "' as status",
      'NULL as reason',
      'NULL as reason_text',
      'NULL as reason_submitted_at',
      'opens.created_at',
      'subscribers.email',
      'subscribers.first_name',
      'subscribers.last_name',
      'opens.queue_id',
    ];

    $queries[self::STATUS_OPENED] = '(SELECT DISTINCT '
      . self::getColumnList($fields, $count) . ' '
      . 'FROM ' . $opensTable . ' opens '
      . 'LEFT JOIN ' . $subscriberTable . ' subscribers ON subscribers.id = opens.subscriber_id '
      . "WHERE opens.newsletter_id = '" . $newsletterId . "' " . $searchConstraint
      . $statusConstraint . $dateConstraint('opens.created_at') . $timezoneConstraint('opens') . ' '
      . "AND opens.user_agent_type = '" . UserAgentEntity::USER_AGENT_TYPE_HUMAN . "') ";

    $fields = [
      'opens.subscriber_id',
      'opens.newsletter_id',
      'opens.id as source_id',
      'NULL as link_id',
      'NULL as link_url',
      "'" . self::STATUS_MACHINE_OPENED . "' as status",
      'NULL as reason',
      'NULL as reason_text',
      'NULL as reason_submitted_at',
      'opens.created_at',
      'subscribers.email',
      'subscribers.first_name',
      'subscribers.last_name',
      'opens.queue_id',
    ];

    $queries[self::STATUS_MACHINE_OPENED] = '(SELECT DISTINCT '
      . self::getColumnList($fields, $count) . ' '
      . 'FROM ' . $opensTable . ' opens '
      . 'LEFT JOIN ' . $subscriberTable . ' subscribers ON subscribers.id = opens.subscriber_id '
      . "WHERE opens.newsletter_id = '" . $newsletterId . "' " . $searchConstraint
      . $statusConstraint . $dateConstraint('opens.created_at') . $timezoneConstraint('opens') . ' '
      . "AND opens.user_agent_type = '" . UserAgentEntity::USER_AGENT_TYPE_MACHINE . "') ";

    $fields = [
      'clicks.subscriber_id',
      'clicks.newsletter_id',
      'clicks.id as source_id',
      'clicks.link_id',
      'links.url as link_url',
      "'" . self::STATUS_CLICKED . "' as status",
      'NULL as reason',
      'NULL as reason_text',
      'NULL as reason_submitted_at',
      'clicks.created_at',
      'subscribers.email',
      'subscribers.first_name',
      'subscribers.last_name',
      'clicks.queue_id',
    ];

    // Avoiding duplicates is managed during the insert process, so we don't need use DISTINCT here
    $queries[self::STATUS_CLICKED] = '(SELECT '
      . self::getColumnList($fields, $count) . ' '
      . 'FROM ' . $clicksTable . ' clicks '
      . 'LEFT JOIN ' . $subscriberTable . ' subscribers ON subscribers.id = clicks.subscriber_id '
      . 'LEFT JOIN ' . $linksTable . ' links ON links.id = clicks.link_id '
      . "WHERE clicks.newsletter_id = '" . $newsletterId . "' " . $searchConstraint . $filterConstraint
      . $statusConstraint . $dateConstraint('clicks.created_at') . $timezoneConstraint('clicks') . ') ';

    $fields = [
      'unsubscribes.subscriber_id',
      'unsubscribes.newsletter_id',
      'unsubscribes.id as source_id',
      'NULL as link_id',
      'NULL as link_url',
      "'" . self::STATUS_UNSUBSCRIBED . "' as status",
      'unsubscribes.reason',
      'unsubscribes.reason_text',
      'unsubscribes.reason_submitted_at',
      'unsubscribes.created_at',
      'subscribers.email',
      'subscribers.first_name',
      'subscribers.last_name',
      'unsubscribes.queue_id',
    ];

    $queries[self::STATUS_UNSUBSCRIBED] = '(SELECT DISTINCT '
      . self::getColumnList($fields, $count) . ' '
      . 'FROM ' . $unsubscribeTable . ' unsubscribes '
      . 'LEFT JOIN ' . $subscriberTable . ' subscribers ON subscribers.id = unsubscribes.subscriber_id '
      . "WHERE unsubscribes.newsletter_id = '" . $newsletterId . "' " . $searchConstraint
      . $statusConstraint . $dateConstraint('unsubscribes.created_at') . $timezoneConstraint('unsubscribes') . ') ';

    $fields = [
      'sent.subscriber_id',
      'sent.newsletter_id',
      'sent.id as source_id',
      'NULL as link_id',
      'NULL as link_url',
      "'" . self::STATUS_UNOPENED . "' as status",
      'NULL as reason',
      'NULL as reason_text',
      'NULL as reason_submitted_at',
      'sent.sent_at as created_at',
      'subscribers.email',
      'subscribers.first_name',
      'subscribers.last_name',
      'sent.queue_id',
    ];

    $queries[self::STATUS_UNOPENED] = '(SELECT '
      . self::getColumnList($fields, $count) . ' '
      . 'FROM ' . $statisticsNewsletterTable . ' sent '
      . 'LEFT JOIN ' . $subscriberTable . ' subscribers ON subscribers.id = sent.subscriber_id '
      . 'LEFT JOIN ' . $opensTable . ' opens ON sent.subscriber_id = opens.subscriber_id '
      . ' AND opens.newsletter_id = sent.newsletter_id ' . "WHERE sent.newsletter_id = '" . $newsletterId . "' "
      . ' AND opens.id IS NULL ' . $searchConstraint
      . $statusConstraint . $dateConstraint('sent.sent_at') . $timezoneConstraint('sent') . ') ';

    // A single group (used when counting one status) or the multi-select set of
    // engagement statuses resolved from the request.
    $statuses = $group !== null ? [$group] : $this->getSelectedStatuses($definition);
    $selected = array_values(array_filter(
      [
        self::STATUS_OPENED,
        self::STATUS_MACHINE_OPENED,
        self::STATUS_CLICKED,
        self::STATUS_UNSUBSCRIBED,
        self::STATUS_UNOPENED,
      ],
      function (string $status) use ($statuses): bool {
        return in_array($status, $statuses, true);
      }
    ));

    if (count($selected) === 1) {
      return $queries[$selected[0]];
    }

    return join(' UNION ALL ', array_map(function (string $status) use ($queries): string {
      return $queries[$status];
    }, $selected));
  }

  /**
   * Resolve which engagement statuses to include from the request: the
   * multi-select `status` filter, a selected link (implies clicked), the legacy
   * single `group` param, or the default "engaged" set.
   *
   * @return string[]
   */
  private function getSelectedStatuses(Listing\ListingDefinition $definition): array {
    $allowed = [
      self::STATUS_OPENED,
      self::STATUS_MACHINE_OPENED,
      self::STATUS_CLICKED,
      self::STATUS_UNSUBSCRIBED,
      self::STATUS_UNOPENED,
    ];
    $filters = $definition->getFilters();

    if (!empty($filters['link'])) {
      return [self::STATUS_CLICKED];
    }

    // Query strings deliver a single selected status as a scalar rather than an
    // array, so normalise both shapes before matching against the allowed set.
    $statusFilter = $filters['status'] ?? null;
    if ($statusFilter !== null && $statusFilter !== '' && $statusFilter !== []) {
      $statusValues = array_filter(is_array($statusFilter) ? $statusFilter : [$statusFilter], 'is_scalar');
      $statuses = array_values(array_intersect(array_map('strval', $statusValues), $allowed));
      if ($statuses) {
        return $statuses;
      }
    }

    $group = $definition->getGroup();
    if (is_string($group) && in_array($group, $allowed, true)) {
      return [$group];
    }

    return [
      self::STATUS_OPENED,
      self::STATUS_MACHINE_OPENED,
      self::STATUS_CLICKED,
      self::STATUS_UNSUBSCRIBED,
    ];
  }

  /**
   * @param array<string, mixed> $item
   * @param array<string, string> $reasonLabels
   *
   * @return array<string, mixed>
   */
  private function addUnsubscribeReasonLabel(array $item, array $reasonLabels): array {
    if (($item['status'] ?? null) !== self::STATUS_UNSUBSCRIBED) {
      $item['reason_label'] = null;
      return $item;
    }

    $reason = $item['reason'] ?? null;
    if (
      !is_string($reason)
      || $reason === ''
      || $reason === StatisticsUnsubscribeEntity::REASON_UNSPECIFIED
    ) {
      $item['reason_label'] = __('No reason provided', 'mailpoet-premium');
      return $item;
    }

    $item['reason_label'] = $reasonLabels[$reason] ?? $reason;
    return $item;
  }

  /**
   * A subscriber-timezone campaign has one sending queue per distinct delivery
   * timezone. Loading the few campaign queues once and mapping queue id to the
   * timezone recorded in the queue meta keeps timezone data out of SQL (no meta
   * parsing) and gives per-row lookups without extra queries.
   *
   * @return array<int, array{timezone: string, fallbackUsed: bool}>
   */
  private function getTimezoneQueueMap(NewsletterEntity $newsletter): array {
    $queue = $newsletter->getLatestQueue();
    if (!$queue instanceof SendingQueueEntity || !$this->timeZoneCampaignScheduler->isTimeZoneQueue($queue)) {
      return [];
    }
    $map = [];
    foreach ($this->timeZoneCampaignScheduler->getCampaignQueues($queue) as $campaignQueue) {
      $queueId = $campaignQueue->getId();
      $meta = $campaignQueue->getMeta() ?? [];
      $timezone = $meta[TimeZoneCampaignScheduler::META_GROUP_TIMEZONE] ?? null;
      if (!$queueId || !is_string($timezone) || $timezone === '') {
        continue;
      }
      $map[(int)$queueId] = [
        'timezone' => $timezone,
        'fallbackUsed' => !empty($meta[TimeZoneCampaignScheduler::META_FALLBACK_USED]),
      ];
    }
    return $map;
  }

  /**
   * Translates the delivery timezone filter into sending queue ids. Values are
   * whitelisted against PHP's timezone identifiers plus the campaign's own
   * timezones (fixed-offset site timezones like "+02:00" are not identifiers)
   * and then matched against the queue map, so no user input ever reaches the
   * SQL; unknown values are ignored like other listing filters.
   *
   * @param array<string, mixed> $filters
   * @param array<int, array{timezone: string, fallbackUsed: bool}> $timezoneQueueMap
   * @return int[]
   */
  private function resolveDeliveryTimezoneQueueIds(array $filters, array $timezoneQueueMap): array {
    if (!$timezoneQueueMap) {
      return [];
    }
    $timezones = $this->sanitizeTimezones(
      $filters['delivery_timezone'] ?? null,
      array_column($timezoneQueueMap, 'timezone')
    );
    if (!$timezones) {
      return [];
    }
    $queueIds = [];
    foreach ($timezoneQueueMap as $queueId => $info) {
      if (in_array($info['timezone'], $timezones, true)) {
        $queueIds[] = $queueId;
      }
    }
    if (!$queueIds) {
      // A valid timezone that matches none of the campaign's batches must
      // select zero rows, not silently drop the constraint; 0 is never a
      // real queue id.
      return [0];
    }
    return $queueIds;
  }

  /**
   * Decorates a row with the timezone of the batch it was actually delivered in.
   * The keys are added only for timezone campaigns so the response shape of all
   * other campaigns stays unchanged; the raw queue_id never leaves the service.
   *
   * @param array<string, mixed> $item
   * @param array<int, array{timezone: string, fallbackUsed: bool}> $timezoneQueueMap
   * @return array<string, mixed>
   */
  private function addDeliveryTimezone(array $item, array $timezoneQueueMap): array {
    $queueId = isset($item['queue_id']) && is_numeric($item['queue_id']) ? (int)$item['queue_id'] : null;
    unset($item['queue_id']);
    if (!$timezoneQueueMap) {
      return $item;
    }
    $info = $queueId !== null ? ($timezoneQueueMap[$queueId] ?? null) : null;
    $item['delivery_timezone'] = $info ? $info['timezone'] : null;
    $item['delivery_timezone_fallback'] = $info ? $info['fallbackUsed'] : false;
    return $item;
  }

  /**
   * @param array<int, array{timezone: string, fallbackUsed: bool}> $timezoneQueueMap
   * @return array<int, array{label: string, value: string}>
   */
  private function deliveryTimezoneFilterOptions(array $timezoneQueueMap): array {
    $timezones = [];
    foreach ($timezoneQueueMap as $info) {
      $fallbackOnly = $timezones[$info['timezone']] ?? true;
      $timezones[$info['timezone']] = $fallbackOnly && $info['fallbackUsed'];
    }
    ksort($timezones);
    $options = [];
    foreach ($timezones as $timezone => $fallbackOnly) {
      $options[] = [
        'label' => $fallbackOnly
          // translators: %s is a timezone name. "site default" marks subscribers without their own timezone who received the email in the site timezone.
          ? sprintf(__('%s (site default)', 'mailpoet-premium'), $timezone)
          : (string)$timezone,
        'value' => (string)$timezone,
      ];
    }
    return $options;
  }

  private function getFilterConstraint(Listing\ListingDefinition $definition): string {
    // Filter by link clicked
    $linkConstraint = '';
    $filters = $definition->getFilters();
    if (!empty($filters['link'])) {
      $link = $this->newsletterLinkRepository->findOneById((int)$filters['link']);
      if ($link instanceof NewsletterLinkEntity) {
        $linkConstraint = " AND clicks.link_id = '" . $link->getId() . "'";
      }
    }

    return $linkConstraint;
  }

  private function getSearchConstraint(Listing\ListingDefinition $definition) {
    // Search recipients
    if (empty($definition->getSearch())) {
      return '';
    }
    $qb = $this->entityManager->getConnection()->createQueryBuilder();
    $qb
      ->addSelect('id')
      ->from($this->entityManager->getClassMetadata(SubscriberEntity::class)->getTableName())
      ->orWhere($qb->expr()->like('email', ':search'))
      ->orWhere($qb->expr()->like('first_name', ':search'))
      ->orWhere($qb->expr()->like('last_name', ':search'));
    $subscriberSearchQuery = $qb->getSQL();
    $subscribersConstraint = ' AND subscribers.id IN (' . $subscriberSearchQuery . ') ';

    return $subscribersConstraint;
  }

  private function getSearchParameter(Listing\ListingDefinition $definition): ?string {
    if (empty($definition->getSearch())) {
      return null;
    }
    $search = trim($definition->getSearch());
    $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search); // escape for 'LIKE'
    return '%' . $search . '%';
  }

  /**
   * @param array<int, string> $fields
   * @param bool $count
   *
   * @return string
   */
  private static function getColumnList(array $fields, bool $count = false): string {
    // Select with DISTINCT on subscriber_id and newsletter_id to avoid duplicates
    // because due to race condition we can have multiple records for the same subscriber_id and newsletter_id
    return $count ? "{$fields[0]}, {$fields[1]}" : join(', ', $fields);
  }

  /**
   * @param NewsletterEntity $newsletter
   * @param array<int, array{timezone: string, fallbackUsed: bool}> $timezoneQueueMap
   *
   * @return array{link: array<int, array{label: string, value: string, url?: string, count?: int}>, delivery_timezone?: array<int, array{label: string, value: string}>}
   */
  private function filters(NewsletterEntity $newsletter, array $timezoneQueueMap): array {
    $clicks = $this->statisticsClicksRepository->getClickedLinksForFilter($newsletter);


    $linkList = [];
    $linkList[] = [
      'label' => __('Filter by link clicked', 'mailpoet-premium'),
      'value' => '',
    ];

    foreach ($clicks as $link) {
      $label = sprintf(
        '%s (%s)',
        $link['url'],
        number_format($link['cnt'])
      );

      $linkList[] = [
        'label' => $label,
        'value' => $link['link_id'],
        'url' => $link['url'],
        'count' => (int)$link['cnt'],
      ];
    }

    $filters = [
      'link' => $linkList,
    ];

    $timezoneOptions = $this->deliveryTimezoneFilterOptions($timezoneQueueMap);
    if ($timezoneOptions) {
      $filters['delivery_timezone'] = $timezoneOptions;
    }

    return $filters;
  }

  /**
   * @param Listing\ListingDefinition $definition
   * @param NewsletterEntity $newsletter
   * @param array<int, array{timezone: string, fallbackUsed: bool}> $timezoneQueueMap
   *
   * @return array<int, array{name: string, label: string, count: int}>
   */
  private function groups(Listing\ListingDefinition $definition, NewsletterEntity $newsletter, array $timezoneQueueMap): array {
    $groups = [
      [
        'name' => self::STATUS_CLICKED,
        'label' => _x('Clicked', 'Subscriber engagement filter - filter those who clicked on a newsletter link', 'mailpoet-premium'),
        'count' => $this->fetchStatsCount($definition, self::STATUS_CLICKED, $timezoneQueueMap),
      ],
      [
        'name' => self::STATUS_OPENED,
        'label' => _x('Opened', 'Subscriber engagement filter - filter those who opened a newsletter', 'mailpoet-premium'),
        'count' => $this->fetchStatsCount($definition, self::STATUS_OPENED, $timezoneQueueMap),
      ],
      [
        'name' => self::STATUS_MACHINE_OPENED,
        'label' => _x('Machine-opened', 'Subscriber engagement filter - shows machine-opens for a given newsletter', 'mailpoet-premium'),
        'count' => $this->fetchStatsCount($definition, self::STATUS_MACHINE_OPENED, $timezoneQueueMap),
      ],
      [
        'name' => self::STATUS_UNSUBSCRIBED,
        'label' => _x('Unsubscribed', 'Subscriber engagement filter - filter those who unsubscribed from a newsletter', 'mailpoet-premium'),
        'count' => $this->fetchStatsCount($definition, self::STATUS_UNSUBSCRIBED, $timezoneQueueMap),
      ],
    ];

    array_unshift(
      $groups,
      [
        'name' => 'all',
        'label' => _x('All engaged', 'Subscriber engagement filter - filter those who performed any action (e.g., clicked, opened, unsubscribed)', 'mailpoet-premium'),
        'count' => array_sum(array_column($groups, 'count')),
      ]
    );

    $groups[] = [
      'name' => self::STATUS_UNOPENED,
      'label' => _x('Unopened', 'Subscriber engagement filter - filter those who did not open a newsletter', 'mailpoet-premium'),
      'count' => $this->fetchStatsCount($definition, self::STATUS_UNOPENED, $timezoneQueueMap),
    ];

    return $groups;
  }

  /**
   * @param array<int, array{timezone: string, fallbackUsed: bool}> $timezoneQueueMap
   */
  private function fetchStatsCount(Listing\ListingDefinition $definition, string $group, array $timezoneQueueMap): int {
    // Apply the same date / subscriber-status / link / timezone / search
    // constraints as the listing query so the counts shown beside each Status
    // filter chip match the rows the listing actually returns.
    $subQuery = $this->getStatsQuery($definition, true, $group, true, $timezoneQueueMap);
    $query = ' SELECT COUNT(*) as cnt FROM ( ' . $subQuery . ' ) t ';
    /** @var int|null $result */
    $result = $this->entityManager->getConnection()->executeQuery($query, [
      'search' => $this->getSearchParameter($definition),
    ], [
      'search' => ParameterType::STRING,
    ])->fetchOne();
    return intval($result);
  }
}
