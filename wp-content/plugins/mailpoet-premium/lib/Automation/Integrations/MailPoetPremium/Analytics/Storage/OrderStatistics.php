<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Storage;

if (!defined('ABSPATH')) exit;


use DateTimeImmutable;
use InvalidArgumentException;
use MailPoet\Automation\Engine\Exceptions;
use MailPoet\Automation\Integrations\MailPoet\Analytics\Entities\Query;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\WooCommerce\OrderAttributionRevenueReader;

/**
 * @phpstan-type RawOrderType array{created_at: string, newsletter_id: int, order_id: int, total: float, subscriber_id: int, first_name:string, last_name:string, email:string, subject:string, status:string}
 */

class OrderStatistics {
  /** @var WooCommerce */
  private $wooCommerce;

  /** @var OrderAttributionRevenueReader */
  private $orderAttributionRevenueReader;

  /** @var string[] */
  private $validOrderByValues = ['created_at', 'last_name', 'subject', 'status', 'revenue'];

  public function __construct(
    WooCommerce $wooCommerce,
    OrderAttributionRevenueReader $orderAttributionRevenueReader
  ) {
    $this->wooCommerce = $wooCommerce;
    $this->orderAttributionRevenueReader = $orderAttributionRevenueReader;
  }

  /**
   * @param NewsletterEntity[] $newsletters
   * @param Query $query
   * @return RawOrderType[]
   */
  public function getOrdersForNewsletters(
    array $newsletters,
    Query $query
  ): array {
    if (!$newsletters) {
      return [];
    }
    $from = $query->getAfter();
    $to = $query->getBefore();
    $limit = $query->getLimit();
    $offset = max(0, ($query->getPage() - 1) * $query->getLimit());
    $orderBy = !empty($query->getOrderBy()) ? $query->getOrderBy() : 'created_at';
    $order = $query->getOrderDirection() === 'asc' ? 'asc' : 'desc';

    if (!in_array($orderBy, $this->validOrderByValues, true)) {
      throw new InvalidArgumentException('Invalid orderBy parameter');
    }
    $search = $query->getSearch();
    $filter = $query->getFilter();
    $wooBackedResult = $this->getWooBackedOrdersForNewsletters($newsletters, $from, $to, $limit, $offset, $orderBy, $order, false, $search, $filter);
    if (is_array($wooBackedResult)) {
      return $wooBackedResult;
    }

    $result = ($this->wooCommerce->isWooCommerceCustomOrdersTableEnabled()) ?
      $this->getOrdersForNewslettersFromHpos($newsletters, $from, $to, $limit, $offset, $orderBy, $order, false, $search, $filter) :
      $this->getOrdersForNewslettersFromLegacy($newsletters, $from, $to, $limit, $offset, $orderBy, $order, false, $search, $filter);
    return is_array($result) ? $result : [];
  }

  /**
   * @param NewsletterEntity[] $newsletters
   * @param Query $query
   * @return int
   */
  public function getLastCount(
    array $newsletters,
    Query $query
  ): int {
    if (!$newsletters) {
      return 0;
    }
    $from = $query->getAfter();
    $to = $query->getBefore();
    $search = $query->getSearch();
    $filter = $query->getFilter();
    $wooBackedResult = $this->getWooBackedOrdersForNewsletters($newsletters, $from, $to, 0, 0, '', '', true, $search, $filter);
    if (is_int($wooBackedResult)) {
      return $wooBackedResult;
    }

    $result = ($this->wooCommerce->isWooCommerceCustomOrdersTableEnabled()) ?
      $this->getOrdersForNewslettersFromHpos($newsletters, $from, $to, 0, 0, '', '', true, $search, $filter) :
      $this->getOrdersForNewslettersFromLegacy($newsletters, $from, $to, 0, 0, '', '', true, $search, $filter);
    return !is_int($result) ? 0 : $result;
  }

  /**
   * @param NewsletterEntity[] $newsletters
   * @param array{status?: string[], emails?: int[]} $filter
   * @return RawOrderType[]|int|null
   */
  private function getWooBackedOrdersForNewsletters(
    array $newsletters,
    DateTimeImmutable $from,
    DateTimeImmutable $to,
    int $limit = 100,
    int $offset = 0,
    string $orderBy = 'created_at',
    string $order = 'desc',
    bool $count = false,
    ?string $search = null,
    array $filter = []
  ) {
    $newsletterIds = array_map(function (NewsletterEntity $newsletter): int {
      return (int)$newsletter->getId();
    }, $newsletters);

    $rows = $this->orderAttributionRevenueReader->getNewsletterOrderRows($newsletterIds, $from, $to);
    if ($rows === null) {
      return null;
    }

    $rows = $this->filterWooBackedRows($rows, $search, $filter);
    if ($count) {
      return count($rows);
    }

    $this->sortWooBackedRows($rows, $orderBy, $order);
    return array_slice($rows, $offset, $limit);
  }

  /**
   * @param RawOrderType[] $rows
   * @param array{status?: string[], emails?: int[]} $filter
   * @return RawOrderType[]
   */
  private function filterWooBackedRows(array $rows, ?string $search, array $filter): array {
    if ($search) {
      $search = substr($search, 0, 100);
      $rows = array_filter($rows, function(array $row) use ($search): bool {
        return stripos($row['last_name'], $search) !== false
          || stripos($row['first_name'], $search) !== false
          || stripos($row['email'], $search) !== false;
      });
    }

    $statusFilter = $filter['status'] ?? [];
    if (is_array($statusFilter) && !empty($statusFilter)) {
      $statusFilter = array_values(array_filter(array_map('sanitize_key', $statusFilter)));
      if ($statusFilter) {
        $rows = array_filter($rows, function(array $row) use ($statusFilter): bool {
          return in_array($row['status'], $statusFilter, true);
        });
      }
    }

    $emailsFilter = $filter['emails'] ?? [];
    if (is_array($emailsFilter) && !empty($emailsFilter)) {
      $emailsFilter = array_values(array_filter(array_map('intval', $emailsFilter), function(int $id): bool {
        return $id > 0;
      }));
      if ($emailsFilter) {
        $rows = array_filter($rows, function(array $row) use ($emailsFilter): bool {
          return in_array($row['newsletter_id'], $emailsFilter, true);
        });
      }
    }

    return array_values($rows);
  }

  /**
   * @param RawOrderType[] $rows
   */
  private function sortWooBackedRows(array &$rows, string $orderBy, string $order): void {
    $direction = $order === 'asc' ? 1 : -1;
    usort($rows, function(array $a, array $b) use ($orderBy, $direction): int {
      $result = $this->compareWooBackedRows($a, $b, $orderBy);
      if ($result === 0) {
        $result = $a['order_id'] <=> $b['order_id'];
      }
      if ($result === 0) {
        $result = $a['newsletter_id'] <=> $b['newsletter_id'];
      }
      if ($result === 0) {
        $result = $a['subscriber_id'] <=> $b['subscriber_id'];
      }
      return $result * $direction;
    });
  }

  /**
   * @param RawOrderType $a
   * @param RawOrderType $b
   */
  private function compareWooBackedRows(array $a, array $b, string $orderBy): int {
    if ($orderBy === 'revenue') {
      return $a['total'] <=> $b['total'];
    }

    $field = $orderBy;
    $aValue = (string)$a[$field];
    $bValue = (string)$b[$field];
    return strcasecmp($aValue, $bValue);
  }

  /**
   * @param NewsletterEntity[] $newsletters
   * @param DateTimeImmutable $from
   * @param DateTimeImmutable $to
   * @param int $limit
   * @param int $offset
   * @param string $orderBy
   * @param string $order
   * @param bool $count
   * @param string|null $search
   * @param array{status?: string[], emails?: int[]} $filter
   * @return RawOrderType[] | int
   */
  private function getOrdersForNewslettersFromHpos(
    array $newsletters,
    DateTimeImmutable $from,
    DateTimeImmutable $to,
    int $limit = 100,
    int $offset = 0,
    string $orderBy = 'createdAt',
    string $order = 'desc',
    bool $count = false,
    ?string $search = null,
    array $filter = []
  ) {
    global $wpdb;

    switch ($orderBy) {
      case 'last_name':
        $orderBy = 'subscriber.last_name';
        break;
      case 'subject':
        $orderBy = 'newsletter.subject';
        break;
      case 'status':
        $orderBy = 'order.status';
        break;
      case 'revenue':
        $orderBy = 'revenue.order_price_total';
        break;
      case 'created_at':
      default:
        $orderBy = 'revenue.created_at';
        break;
    }

    $newsletterIds = array_map(function ($newsletter) {
      return $newsletter->getId();
    }, $newsletters);

    $sqlSelect = $count
      ? 'COUNT(`revenue`.`id`) as `count`'
      : '
        `revenue`.`created_at`,
        `revenue`.`newsletter_id`,
        `revenue`.`order_id`,
        `revenue`.`order_price_total` AS `total`,
        `revenue`.`subscriber_id`,
        `subscriber`.`first_name`,
        `subscriber`.`last_name`,
        `subscriber`.`email`,
        `newsletter`.`subject`,
        `order`.`status`
      ';

    $filters = '';
    if ($search) {
      // Limit search string length for performance.
      $search = substr($search, 0, 100);
      $filters .= $wpdb->prepare(
        ' AND (`subscriber`.`last_name` LIKE %s OR `subscriber`.`first_name` LIKE %s OR `subscriber`.`email` LIKE %s)',
        '%' . $wpdb->esc_like($search) . '%',
        '%' . $wpdb->esc_like($search) . '%',
        '%' . $wpdb->esc_like($search) . '%',
      );
    }

    // Filter by order status.
    $statusFilter = $filter['status'] ?? [];
    if (is_array($statusFilter) && !empty($statusFilter)) {
      // Sanitize status values to prevent injection (allows alphanumeric, dashes, underscores).
      $statusFilter = array_map('sanitize_key', array_filter($statusFilter));
      if (count($statusFilter) > 0) {
        $filters .= $wpdb->prepare(
          ' AND `order`.`status` IN (' . implode(',', array_fill(0, count($statusFilter), '%s')) . ')',
          ...$statusFilter
        );
      }
    }

    // Filter by email (newsletter) IDs.
    $emailsFilter = $filter['emails'] ?? [];
    if (is_array($emailsFilter) && !empty($emailsFilter)) {
      $emailsFilter = array_map('intval', array_filter($emailsFilter));
      if (count($emailsFilter) > 0) {
        $filters .= $wpdb->prepare(
          ' AND `revenue`.`newsletter_id` IN (' . implode(',', array_fill(0, count($emailsFilter), '%d')) . ')',
          ...$emailsFilter
        );
      }
    }

    /** @var RawOrderType[] $result */
    $result = $wpdb->get_results(
      $wpdb->prepare(
        '
          SELECT ' . $sqlSelect . /* phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- The statement is safe. */ '
          FROM %i as `revenue`
          INNER JOIN %i as `order` ON `revenue`.order_id = `order`.id
          INNER JOIN %i as `subscriber` ON `subscriber`.ID = `revenue`.subscriber_id
          INNER JOIN %i as `newsletter` ON `newsletter`.ID = `revenue`.newsletter_id
          WHERE revenue.created_at BETWEEN %s AND %s
          AND revenue.newsletter_id IN (' . implode(',', array_fill(0, count($newsletterIds), '%d')) . ')
        ',
        array_merge(
          [
            $wpdb->prefix . 'mailpoet_statistics_woocommerce_purchases',
            $wpdb->prefix . 'wc_orders',
            $wpdb->prefix . 'mailpoet_subscribers',
            $wpdb->prefix . 'mailpoet_newsletters',
            $from->format('Y-m-d H:i:s'),
            $to->format('Y-m-d H:i:s'),
          ],
          $newsletterIds
        )
      )
      . $filters
      . (!$count ? (" ORDER BY $orderBy $order, order.id $order, revenue.id $order " . $wpdb->prepare(' LIMIT %d, %d', $offset, $limit)) : ''),
      ARRAY_A
    );

    // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
    $error = $wpdb->last_error;
    if ($error) {
      throw Exceptions::databaseError($error);
    }

    if (!$count) {
      return is_array($result) ? $result : [];
    }
    return is_array($result) && isset($result[0]['count']) ? (int)$result[0]['count'] : 0;
  }

  /**
   * @param NewsletterEntity[] $newsletters
   * @param DateTimeImmutable $from
   * @param DateTimeImmutable $to
   * @param int $limit
   * @param int $offset
   * @param string $orderBy
   * @param string $order
   * @param bool $count
   * @param string|null $search
   * @param array{status?: string[], emails?: int[]} $filter
   * @return RawOrderType[] | int
   */
  private function getOrdersForNewslettersFromLegacy(
    array $newsletters,
    DateTimeImmutable $from,
    DateTimeImmutable $to,
    int $limit = 100,
    int $offset = 0,
    string $orderBy = 'createdAt',
    string $order = 'desc',
    bool $count = false,
    ?string $search = null,
    array $filter = []
  ) {
    global $wpdb;

    switch ($orderBy) {
      case 'last_name':
        $orderBy = 'subscriber.last_name';
        break;
      case 'subject':
        $orderBy = 'newsletter.subject';
        break;
      case 'status':
        $orderBy = 'order.post_status';
        break;
      case 'revenue':
        $orderBy = 'revenue.order_price_total';
        break;
      case 'created_at':
      default:
        $orderBy = 'revenue.created_at';
        break;
    }

    $newsletterIds = array_map(function ($newsletter) {
      return $newsletter->getId();
    }, $newsletters);

    $sqlSelect = $count
      ? 'COUNT(`revenue`.`id`) as `count`'
      : '
        `revenue`.`created_at`,
        `revenue`.`newsletter_id`,
        `revenue`.`order_id`,
        `revenue`.`order_price_total` AS `total`,
        `revenue`.`subscriber_id`,
        `subscriber`.`first_name`,
        `subscriber`.`last_name`,
        `subscriber`.`email`,
        `newsletter`.`subject`,
        `order`.`post_status` as `status`
      ';

    $filters = '';
    if ($search) {
      // Limit search string length for performance.
      $search = substr($search, 0, 100);
      $filters .= $wpdb->prepare(
        ' AND (`subscriber`.`last_name` LIKE %s OR `subscriber`.`first_name` LIKE %s OR `subscriber`.`email` LIKE %s)',
        '%' . $wpdb->esc_like($search) . '%',
        '%' . $wpdb->esc_like($search) . '%',
        '%' . $wpdb->esc_like($search) . '%',
      );
    }

    // Filter by order status (legacy uses post_status).
    $statusFilter = $filter['status'] ?? [];
    if (is_array($statusFilter) && !empty($statusFilter)) {
      // Sanitize status values to prevent injection (allows alphanumeric, dashes, underscores).
      $statusFilter = array_map('sanitize_key', array_filter($statusFilter));
      if (count($statusFilter) > 0) {
        $filters .= $wpdb->prepare(
          ' AND `order`.`post_status` IN (' . implode(',', array_fill(0, count($statusFilter), '%s')) . ')',
          ...$statusFilter
        );
      }
    }

    // Filter by email (newsletter) IDs.
    $emailsFilter = $filter['emails'] ?? [];
    if (is_array($emailsFilter) && !empty($emailsFilter)) {
      $emailsFilter = array_map('intval', array_filter($emailsFilter));
      if (count($emailsFilter) > 0) {
        $filters .= $wpdb->prepare(
          ' AND `revenue`.`newsletter_id` IN (' . implode(',', array_fill(0, count($emailsFilter), '%d')) . ')',
          ...$emailsFilter
        );
      }
    }

    /** @var RawOrderType[] $result */
    $result = $wpdb->get_results(
      $wpdb->prepare(
        '
          SELECT ' . $sqlSelect . /* phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- The statement is safe. */ '
          FROM %i as `revenue`
          INNER JOIN %i as `order` ON `revenue`.order_id = `order`.ID
          INNER JOIN %i as `subscriber` ON `subscriber`.ID = `revenue`.subscriber_id
          INNER JOIN %i as `newsletter` ON `newsletter`.ID = `revenue`.newsletter_id
          WHERE revenue.created_at BETWEEN %s AND %s
          AND revenue.newsletter_id IN (' . implode(',', array_fill(0, count($newsletterIds), '%d')) . ')
        ',
        array_merge(
          [
            $wpdb->prefix . 'mailpoet_statistics_woocommerce_purchases',
            $wpdb->posts,
            $wpdb->prefix . 'mailpoet_subscribers',
            $wpdb->prefix . 'mailpoet_newsletters',
            $from->format('Y-m-d H:i:s'),
            $to->format('Y-m-d H:i:s'),
          ],
          $newsletterIds
        )
      )
      . $filters
      . (!$count ? (" ORDER BY $orderBy $order, order.id $order, revenue.id $order " . $wpdb->prepare(' LIMIT %d, %d', $offset, $limit)) : ''),
      ARRAY_A
    );

    // phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
    $error = $wpdb->last_error;
    if ($error) {
      throw Exceptions::databaseError($error);
    }

    if (!$count) {
      return is_array($result) ? $result : [];
    }

    return is_array($result) && isset($result[0]['count']) ? (int)$result[0]['count'] : 0;
  }
}
