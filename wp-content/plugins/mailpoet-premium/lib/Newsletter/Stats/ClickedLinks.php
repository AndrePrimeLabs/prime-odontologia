<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Cron\Workers\StatsNotifications\Worker;
use MailPoet\EmailEditor\Integrations\MailPoet\PersonalizationTagManager as FreePersonalizationTagManager;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\NewsletterLinkEntity;
use MailPoet\Entities\StatisticsClickEntity;
use MailPoet\Listing;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\NotFoundException;
use MailPoetVendor\Doctrine\DBAL\ParameterType;
use MailPoetVendor\Doctrine\ORM\EntityManager;

class ClickedLinks {
  use StatsListingFilterTrait;

  /** @var Listing\Handler */
  private $listingHandler;

  /** @var EntityManager */
  private $entityManager;

  /** @var NewslettersRepository */
  private $newslettersRepository;

  private FreePersonalizationTagManager $freePersonalizationTagManager;

  public function __construct(
    Listing\Handler $listingHandler,
    EntityManager $entityManager,
    NewslettersRepository $newslettersRepository,
    FreePersonalizationTagManager $freePersonalizationTagManager
  ) {
    $this->listingHandler = $listingHandler;
    $this->entityManager = $entityManager;
    $this->newslettersRepository = $newslettersRepository;
    $this->freePersonalizationTagManager = $freePersonalizationTagManager;
  }

  private function parseData($data): Listing\ListingDefinition {
    $data['sort_order'] = ($data['sort_order'] ?? null) === 'asc' ? 'asc' : 'desc';
    $sortableColumns = ['url', 'cnt'];
    $data['sort_by'] = (!empty($data['sort_by']) && in_array($data['sort_by'], $sortableColumns, true))
      ? $data['sort_by']
      : 'cnt';
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
    $labels = Worker::getShortcodeLinksMapping() + $this->freePersonalizationTagManager->getTokenDisplayNames();
    $shortcodeUrls = $this->matchLabeledLinkUrls($definition->getSearch(), $labels);
    $baseQuery = $this->getBaseQuery($definition, $newsletter, $searchParam !== null, $shortcodeUrls);
    $params = [];
    $types = [];
    if ($searchParam !== null) {
      $params['search'] = $searchParam;
      $types['search'] = ParameterType::STRING;
    }

    /** @var int|false $result */
    $result = $this->entityManager->getConnection()
      ->executeQuery('SELECT COUNT(*) as cnt FROM ( ' . $baseQuery . ' ) t', $params, $types)
      ->fetchOne();
    $count = intval($result);

    $query = $baseQuery
      . " ORDER BY {$definition->getSortBy()} {$definition->getSortOrder()}, link_id ASC LIMIT :limit OFFSET :offset";
    $items = $this->entityManager->getConnection()
      ->executeQuery(
        $query,
        $params + ['limit' => $definition->getLimit(), 'offset' => $definition->getOffset()],
        $types + ['limit' => ParameterType::INTEGER, 'offset' => ParameterType::INTEGER]
      )
      ->fetchAllAssociative();

    return [
      'count' => $count,
      'filters' => [],
      'groups' => [],
      'items' => $items,
    ];
  }

  /**
   * @param string[] $shortcodeUrls fixed plugin values from {@see matchLabeledLinkUrls()}
   */
  private function getBaseQuery(Listing\ListingDefinition $definition, NewsletterEntity $newsletter, bool $withSearch = false, array $shortcodeUrls = []): string {
    $clicksTable = $this->entityManager->getClassMetadata(StatisticsClickEntity::class)->getTableName();
    $linksTable = $this->entityManager->getClassMetadata(NewsletterLinkEntity::class)->getTableName();
    $newsletterId = (int)$newsletter->getId();

    // Welcome emails create a link row per sending, so the same URL appears
    // under several link ids; group by URL to keep one row per link (matches
    // StatisticsClicksRepository::getClickedLinks).
    $isWelcome = $newsletter->getType() === NewsletterEntity::TYPE_WELCOME;
    $groupBy = $isWelcome ? 'links.url' : 'links.id';
    $linkIdSelect = $isWelcome ? 'MIN(links.id) as link_id' : 'links.id as link_id';

    $havingParts = $this->buildRangeHavingParts($definition->getFilters(), 'cnt', 'cnt_min', 'cnt_max');
    $having = $havingParts ? ' HAVING ' . join(' AND ', $havingParts) : '';

    $searchClauses = [];
    if ($withSearch) {
      $searchClauses[] = 'links.url LIKE :search';
    }
    if ($shortcodeUrls) {
      $quotedUrls = array_map(function (string $url): string {
        return "'" . str_replace("'", "''", $url) . "'";
      }, $shortcodeUrls);
      $searchClauses[] = 'links.url IN (' . join(', ', $quotedUrls) . ')';
    }
    $searchConstraint = $searchClauses ? ' AND (' . join(' OR ', $searchClauses) . ')' : '';

    return 'SELECT links.url as url, COUNT(DISTINCT clicks.subscriber_id) as cnt, ' . $linkIdSelect . ' '
      . 'FROM ' . $clicksTable . ' clicks '
      . 'JOIN ' . $linksTable . ' links ON links.id = clicks.link_id '
      . "WHERE clicks.newsletter_id = '" . $newsletterId . "'" . $searchConstraint . ' '
      . 'GROUP BY ' . $groupBy . $having;
  }
}
