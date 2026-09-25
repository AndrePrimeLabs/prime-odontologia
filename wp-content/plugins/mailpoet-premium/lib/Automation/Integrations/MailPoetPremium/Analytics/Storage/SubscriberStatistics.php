<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Storage;

if (!defined('ABSPATH')) exit;


use DateTimeImmutable;
use InvalidArgumentException;
use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\AutomationRun;
use MailPoet\Automation\Engine\Exceptions;
use MailPoet\Automation\Engine\Registry;
use MailPoet\Automation\Integrations\MailPoet\Analytics\Entities\Query;

/**
 * @phpstan-type RawSubscriberType array{id: int, updated_at: string, step_id: string, status: string, subscriber_id: int, email: string, last_name: string, first_name: string}
 */
class SubscriberStatistics {
  /** @var Registry */
  private $registry;

  /** @var string[] */
  private $validOrderByValues = ['updated_at', 'last_name', 'status', 'step'];

  /** @var array<string, string> */
  private $filterMap = ['step' => '`log`.`step_id`', 'status' => '`run`.`status`'];

  public function __construct(
    Registry $registry
  ) {
    $this->registry = $registry;
  }

  /**
   * @param Automation[] $automations
   * @param Query $query
   * @return RawSubscriberType[]
   */
  public function getSubscribersForAutomations(
    array $automations,
    Query $query
  ): array {
    $from = $query->getAfter();
    $to = $query->getBefore();
    $limit = $query->getLimit();
    $offset = max(0, ($query->getPage() - 1) * $query->getLimit());
    $orderBy = !empty($query->getOrderBy()) ? $query->getOrderBy() : 'updated_at';
    $order = $query->getOrderDirection() === 'asc' ? 'asc' : 'desc';
    $filter = $query->getFilter();
    $search = $query->getSearch();
    $versionId = $query->getVersionId();

    if (!in_array($orderBy, $this->validOrderByValues, true)) {
      throw new InvalidArgumentException('Invalid orderBy parameter');
    }
    if (!count($automations)) {
      throw new InvalidArgumentException('No automation given');
    }
    $result = $this->query($automations, $from, $to, $filter, $search, $limit, $offset, $orderBy, $order, false, $versionId);
    return is_array($result) ? $result : [];
  }

  /**
   * @param Automation[] $automations
   * @param Query $query
   * @return int
   */
  public function getLastCount(
    array $automations,
    Query $query
  ): int {

    if (!count($automations)) {
      throw new InvalidArgumentException('No automation given');
    }

    $from = $query->getAfter();
    $to = $query->getBefore();
    $filter = $query->getFilter();
    $search = $query->getSearch();
    $versionId = $query->getVersionId();
    $result = $this->query($automations, $from, $to, $filter, $search, 0, 0, '', '', true, $versionId);
    return !is_int($result) ? 0 : $result;
  }

  /**
   * @param Automation[] $automations
   * @param DateTimeImmutable $from
   * @param DateTimeImmutable $to
   * @param string[][] $filter
   * @param string|null $search
   * @param int $limit
   * @param int $offset
   * @param string $orderBy
   * @param string $order
   * @param bool $count
   * @param int|null $versionId
   * @return RawSubscriberType[] | int
   */
  private function query(
    array $automations,
    DateTimeImmutable $from,
    DateTimeImmutable $to,
    array $filter,
    ?string $search = null,
    int $limit = 100,
    int $offset = 0,
    string $orderBy = 'updated_at',
    string $order = 'desc',
    bool $count = false,
    ?int $versionId = null
  ) {
    global $wpdb;

    /** @var Automation $automation */
    $automation = current($automations);

    switch ($orderBy) {
      case 'last_name':
        $orderBy = '`subscribers`.`last_name`';
        break;
      case 'status':
        $orderBy = $this->orderByStatus();
        break;
      case 'step':
        $orderBy = $this->orderByStep($automations);
        break;
      case 'updated_at':
      default:
        $orderBy = '`run`.`updated_at`';
        break;
    }

    $filters = '';
    foreach ($filter as $filterKey => $value) {
      $value = array_filter($value);
      if (!array_key_exists($filterKey, $this->filterMap) || !$value) {
        continue;
      }

      $filters .= $wpdb->prepare(
        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- The filter map already contains identifier quotes.
        ' AND ' . $this->filterMap[$filterKey] . ' IN (' . implode(',', array_fill(0, count($value), '%s')) . ')',
        $value
      );
    }

    if ($search) {
      $filters .= $wpdb->prepare(
        ' AND (subscribers.last_name LIKE %s OR subscribers.first_name LIKE %s OR subscribers.email LIKE %s)',
        '%' . $wpdb->esc_like($search) . '%',
        '%' . $wpdb->esc_like($search) . '%',
        '%' . $wpdb->esc_like($search) . '%',
      );
    }
    if ($versionId !== null) {
      $filters .= $wpdb->prepare(' AND `run`.`version_id` = %d', $versionId);
    }

    $sqlSelect = $count
      ? 'COUNT(`run`.`id`) as `count`'
      : '`run`.`id`, `run`.`updated_at`, `run`.`status`, `log`.`step_id`, `subscribers`.`id` AS `subscriber_id`, `subscribers`.`email`, `subscribers`.`first_name`, `subscribers`.`last_name`';

    /** @var RawSubscriberType[] $result */
    $result = $wpdb->get_results(
      $wpdb->prepare(
        "
          SELECT " . $sqlSelect . /* phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- The statement is safe. */ "
          FROM %i AS `run`
          LEFT JOIN %i AS `subject` ON `run`.`id` = `subject`.`automation_run_id`
          LEFT JOIN %i AS `log` ON `run`.`id` = `log`.`automation_run_id`
          LEFT JOIN %i AS `subscribers` ON CONCAT('{\"subscriber_id\":', `subscribers`.`id`, '}') = `subject`.`args`
          WHERE `subject`.`key` = 'mailpoet:subscriber'
          AND `log`.`id` = (SELECT MAX(id) FROM %i WHERE `automation_run_id` = `log`.`automation_run_id`)
          AND `run`.`updated_at` BETWEEN %s AND %s
          AND `run`.`automation_id` = %d
        ",
        $wpdb->prefix . 'mailpoet_automation_runs',
        $wpdb->prefix . 'mailpoet_automation_run_subjects',
        $wpdb->prefix . 'mailpoet_automation_run_logs',
        $wpdb->prefix . 'mailpoet_subscribers',
        $wpdb->prefix . 'mailpoet_automation_run_logs',
        $from->format('Y-m-d H:i:s'),
        $to->format('Y-m-d H:i:s'),
        $automation->getId()
      )
      . $filters
      . (!$count ? (" ORDER BY $orderBy $order " . $wpdb->prepare(' LIMIT %d, %d', $offset, $limit)) : ''),
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

  private function orderByStatus(): string {
    global $wpdb;

    // Make sure this translation map is in sync with the frontend in automation/components/status/names.tsx
    return $wpdb->prepare(
      "
        CASE
          WHEN `run`.`status` = %s THEN %s
          WHEN `run`.`status` = %s THEN %s
          WHEN `run`.`status` = %s THEN %s
          WHEN `run`.`status` = %s THEN %s
          ELSE 'unknown'
        END
      ",
      AutomationRun::STATUS_FAILED,
      __('Failed', 'mailpoet-premium'),
      AutomationRun::STATUS_RUNNING,
      __('In Progress', 'mailpoet-premium'),
      AutomationRun::STATUS_CANCELLED,
      __('Cancelled', 'mailpoet-premium'),
      AutomationRun::STATUS_COMPLETE,
      __('Completed', 'mailpoet-premium')
    );
  }

  /**
   * @param Automation[] $automations
   * @return string
   */
  private function orderByStep(array $automations): string {
    global $wpdb;

    $keys = [];
    foreach ($automations as $automation) {
      foreach ($automation->getSteps() as $stepData) {
        $step = $this->registry->getStep($stepData->getKey());
        $keys[$stepData->getId()] = $step ? $step->getName() : '';
      }
    }

    $map = [];
    foreach ($keys as $id => $name) {
      $map[] = $wpdb->prepare('WHEN `log`.`step_id` = %s THEN %s ', $id, $name);
    }
    return 'CASE ' . implode(' ', $map) . "ELSE 'unknown' END";
  }
}
