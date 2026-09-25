<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\SubscriberEntity;

/**
 * Shared helpers for the campaign-stats listing services that assemble raw SQL.
 *
 * These listings build SQL strings by hand (for UNION / aggregate queries that
 * the Doctrine query builder can't express cleanly), so filter values can't be
 * bound as parameters in every spot. To stay injection-safe every value handled
 * here is validated against a fixed shape (calendar date, allow-listed enum,
 * finite number) before it is ever returned for inlining.
 */
trait StatsListingFilterTrait {
  /**
   * @param array<string, mixed> $filters
   * @return array{from: ?string, to: ?string}
   */
  private function sanitizeDateRange(array $filters): array {
    return [
      'from' => $this->sanitizeDate($filters['from'] ?? null),
      'to' => $this->sanitizeDate($filters['to'] ?? null),
    ];
  }

  private function sanitizeDate($value): ?string {
    if (!is_string($value) || $value === '') {
      return null;
    }
    $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    if (!$date || $date->format('Y-m-d') !== $value) {
      return null;
    }
    return $value;
  }

  /**
   * Builds an inclusive whole-day range constraint for a datetime column. Values
   * are guaranteed to be valid `Y-m-d` strings by {@see sanitizeDateRange()}.
   */
  private function buildDateRangeConstraint(string $column, ?string $from, ?string $to): string {
    $constraint = '';
    if ($from !== null) {
      $constraint .= " AND $column >= '" . $from . " 00:00:00'";
    }
    if ($to !== null) {
      $constraint .= " AND $column <= '" . $to . " 23:59:59'";
    }
    return $constraint;
  }

  /**
   * @param mixed $value
   * @return string[]
   */
  private function sanitizeSubscriberStatuses($value): array {
    if ($value === null || $value === '' || $value === []) {
      return [];
    }
    $values = array_filter(is_array($value) ? $value : [$value], 'is_scalar');
    $values = array_map(function ($item): string {
      return (string)$item;
    }, $values);
    $allowed = [
      SubscriberEntity::STATUS_SUBSCRIBED,
      SubscriberEntity::STATUS_UNSUBSCRIBED,
      SubscriberEntity::STATUS_UNCONFIRMED,
      SubscriberEntity::STATUS_INACTIVE,
      SubscriberEntity::STATUS_BOUNCED,
    ];
    return array_values(array_intersect($values, $allowed));
  }

  /**
   * @param string[] $statuses values must come from {@see sanitizeSubscriberStatuses()}
   */
  private function buildStatusConstraint(string $column, array $statuses): string {
    if (!$statuses) {
      return '';
    }
    $quoted = array_map(function (string $status): string {
      return "'" . $status . "'";
    }, $statuses);
    return " AND $column IN (" . join(', ', $quoted) . ')';
  }

  /**
   * @param mixed $value
   * @param string[] $additionalAllowed Trusted timezone values that are valid
   *   in the current context but missing from PHP's identifier list — sites
   *   configured with a UTC offset instead of a named timezone record their
   *   fallback batches with values like "+02:00".
   * @return string[]
   */
  private function sanitizeTimezones($value, array $additionalAllowed = []): array {
    if ($value === null || $value === '' || $value === []) {
      return [];
    }
    $values = array_filter(is_array($value) ? $value : [$value], 'is_scalar');
    $values = array_map(function ($item): string {
      return (string)$item;
    }, $values);
    return array_values(array_intersect($values, array_merge(\DateTimeZone::listIdentifiers(), $additionalAllowed)));
  }

  /**
   * $column is interpolated into SQL verbatim and MUST be a hardcoded
   * identifier at the call site, never derived from user input. The ids are
   * cast to integers, so only $column needs this care.
   *
   * @param int[] $ids
   */
  private function buildIdInConstraint(string $column, array $ids): string {
    if (!$ids) {
      return '';
    }
    return " AND $column IN (" . join(', ', array_map('intval', $ids)) . ')';
  }

  /**
   * Returns a `LIKE` pattern (`%needle%`) for a search term, or null when there
   * is nothing to search for. The needle is bound as a parameter by callers, but
   * LIKE wildcards are escaped here.
   */
  private function sanitizeSearchLike(?string $search): ?string {
    if ($search === null) {
      return null;
    }
    $search = trim($search);
    if ($search === '') {
      return null;
    }
    $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search);
    return '%' . $search . '%';
  }

  /**
   * The clicked-links / opened listings replace known stored URLs (legacy
   * `[link:...]` shortcodes, personalization tag tokens) with human labels
   * (e.g. "Unsubscribe link"), so a search against the visible text never
   * matches the stored URL. Map the search term back to the URLs whose label
   * contains it, so callers can match those rows too.
   *
   * The returned URLs are plugin-defined shortcodes and tag tokens (no user
   * input), so callers may inline them when quoted.
   *
   * @param array<string, string> $labels stored URL => label
   * @return string[]
   */
  private function matchLabeledLinkUrls(?string $search, array $labels): array {
    $search = $search === null ? '' : trim($search);
    if ($search === '') {
      return [];
    }
    $urls = [];
    foreach ($labels as $url => $label) {
      if (stripos($label, $search) !== false) {
        $urls[] = $url;
      }
    }
    return $urls;
  }

  /**
   * Build inclusive numeric range `HAVING` fragments for an aggregate
   * expression. Bounds come from `<minKey>` / `<maxKey>` filter values and are
   * validated to finite numbers before inlining.
   *
   * @param array<string, mixed> $filters
   * @return string[]
   */
  private function buildRangeHavingParts(array $filters, string $expression, string $minKey, string $maxKey): array {
    $parts = [];
    $min = $this->sanitizeThreshold($filters[$minKey] ?? null);
    if ($min !== null) {
      $parts[] = $expression . ' >= ' . $this->numberToSql($min);
    }
    $max = $this->sanitizeThreshold($filters[$maxKey] ?? null);
    if ($max !== null) {
      $parts[] = $expression . ' <= ' . $this->numberToSql($max);
    }
    return $parts;
  }

  private function numberToSql(float $value): string {
    return rtrim(rtrim(sprintf('%.6F', $value), '0'), '.');
  }

  /**
   * @param mixed $value
   */
  private function sanitizeThreshold($value): ?float {
    if (is_int($value) || is_float($value)) {
      return is_finite((float)$value) ? (float)$value : null;
    }
    if (is_string($value) && is_numeric(trim($value))) {
      return (float)trim($value);
    }
    return null;
  }
}
