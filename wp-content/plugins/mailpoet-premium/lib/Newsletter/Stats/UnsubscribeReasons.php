<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\StatisticsUnsubscribeEntity;
use MailPoet\Listing;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\NotFoundException;
use MailPoet\Statistics\UnsubscribeReasonTracker;
use MailPoetVendor\Doctrine\DBAL\ParameterType;
use MailPoetVendor\Doctrine\ORM\EntityManager;

class UnsubscribeReasons {
  use StatsListingFilterTrait;

  private const SORT_COLUMNS = [
    'reason' => 'reason',
    'count' => 'cnt',
  ];

  /** @var Listing\Handler */
  private $listingHandler;

  /** @var EntityManager */
  private $entityManager;

  /** @var NewslettersRepository */
  private $newslettersRepository;

  /** @var UnsubscribeReasonTracker */
  private $unsubscribeReasonTracker;

  public function __construct(
    Listing\Handler $listingHandler,
    EntityManager $entityManager,
    NewslettersRepository $newslettersRepository,
    UnsubscribeReasonTracker $unsubscribeReasonTracker
  ) {
    $this->listingHandler = $listingHandler;
    $this->entityManager = $entityManager;
    $this->newslettersRepository = $newslettersRepository;
    $this->unsubscribeReasonTracker = $unsubscribeReasonTracker;
  }

  private function parseData($data): Listing\ListingDefinition {
    $data['sort_order'] = ($data['sort_order'] ?? null) === 'asc' ? 'asc' : 'desc';
    $data['sort_by'] = (!empty($data['sort_by']) && isset(self::SORT_COLUMNS[$data['sort_by']]))
      ? $data['sort_by']
      : 'count';
    return $this->listingHandler->getListingDefinition($data);
  }

  /**
   * @return array{
   *   count: int,
   *   filters: array{},
   *   groups: array{},
   *   items: array<int, array<string, mixed>>
   * }
   */
  public function get($data = []): array {
    $definition = $this->parseData($data);
    $newsletter = $this->newslettersRepository->findOneById((int)$definition->getParameters()['id']);
    if (!$newsletter instanceof NewsletterEntity) {
      throw new NotFoundException();
    }

    $searchParam = $this->sanitizeSearchLike($definition->getSearch());
    $reasonMatches = $this->matchReasonKeys($definition->getSearch());
    $baseQuery = $this->getBaseQuery($definition, $searchParam !== null, $reasonMatches);
    $searchParams = [];
    $searchTypes = [];
    if ($searchParam !== null) {
      $searchParams['search'] = $searchParam;
      $searchTypes['search'] = ParameterType::STRING;
    }

    /** @var int|false $result */
    $result = $this->entityManager->getConnection()
      ->executeQuery('SELECT COUNT(*) as cnt FROM ( ' . $baseQuery . ' ) t', $searchParams, $searchTypes)
      ->fetchOne();
    $count = intval($result);

    $sortColumn = self::SORT_COLUMNS[(string)$definition->getSortBy()] ?? 'cnt';
    $query = $baseQuery
      . " ORDER BY {$sortColumn} {$definition->getSortOrder()}, reason ASC LIMIT :limit OFFSET :offset";
    $items = $this->entityManager->getConnection()
      ->executeQuery($query, $searchParams + [
        'limit' => $definition->getLimit(),
        'offset' => $definition->getOffset(),
      ], $searchTypes + [
        'limit' => ParameterType::INTEGER,
        'offset' => ParameterType::INTEGER,
      ])
      ->fetchAllAssociative();

    return [
      'count' => $count,
      'filters' => [],
      'groups' => [],
      'items' => $items,
    ];
  }

  /**
   * @param string[] $reasonMatches reason keys resolved from {@see matchReasonKeys()}
   */
  private function getBaseQuery(Listing\ListingDefinition $definition, bool $withSearch = false, array $reasonMatches = []): string {
    $table = $this->entityManager->getClassMetadata(StatisticsUnsubscribeEntity::class)->getTableName();
    $newsletterId = (int)$definition->getParameters()['id'];
    $unspecified = StatisticsUnsubscribeEntity::REASON_UNSPECIFIED;

    // Treat NULL and empty reasons as the "unspecified" bucket so they collapse
    // into a single, labelable row.
    $reasonExpr = "COALESCE(NULLIF(unsubscribes.reason, ''), '" . $unspecified . "')";

    $havingParts = $this->buildRangeHavingParts($definition->getFilters(), 'cnt', 'count_min', 'count_max');
    $having = $havingParts ? ' HAVING ' . join(' AND ', $havingParts) : '';

    // The table shows human labels ("Other", "No reason provided") instead of
    // the stored reason keys, so search matches both the raw reason value and
    // the reason keys whose label contains the term.
    $searchClauses = [];
    if ($withSearch) {
      $searchClauses[] = $reasonExpr . ' LIKE :search';
    }
    if ($reasonMatches) {
      $quoted = array_map(function (string $reason): string {
        return "'" . str_replace("'", "''", $reason) . "'";
      }, $reasonMatches);
      $searchClauses[] = $reasonExpr . ' IN (' . join(', ', $quoted) . ')';
    }
    $searchConstraint = $searchClauses ? ' AND (' . join(' OR ', $searchClauses) . ')' : '';

    return 'SELECT ' . $reasonExpr . ' as reason, COUNT(*) as cnt '
      . 'FROM ' . $table . ' unsubscribes '
      . "WHERE unsubscribes.newsletter_id = '" . $newsletterId . "'" . $searchConstraint . ' '
      . 'GROUP BY reason' . $having;
  }

  /**
   * Map a search term to the reason keys whose displayed label contains it, so
   * a search against the visible label (e.g. "spam") still matches the stored
   * reason key. Returned keys are fixed plugin constants, safe for callers to
   * inline.
   *
   * @return string[]
   */
  private function matchReasonKeys(?string $search): array {
    $search = $search === null ? '' : trim($search);
    if ($search === '') {
      return [];
    }
    $labels = $this->unsubscribeReasonTracker->getReasonLabels();
    $labels[StatisticsUnsubscribeEntity::REASON_UNSPECIFIED] = __('No reason provided', 'mailpoet-premium');
    $keys = [];
    foreach ($labels as $reason => $label) {
      if (stripos($label, $search) !== false) {
        $keys[] = (string)$reason;
      }
    }
    return $keys;
  }
}
