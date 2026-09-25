<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\NewsletterEntity;
use MailPoet\Listing;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\NotFoundException;

/**
 * Server-side wrapper around {@see PurchasedProducts} for the campaign-stats
 * listing.
 *
 * Product revenue is resolved through PurchasedProducts, which follows the
 * WooCommerce order-attribution read model: Woo-backed reporting is default-on
 * (orders whose standard Woo source resolved to `mailpoet`), with the legacy
 * `statistics_woocommerce_purchases` table as fallback. That resolution
 * aggregates per-product totals across every attributed order, so - unlike the
 * other campaign-stats listings - the minimum-threshold filters, search,
 * sorting and pagination are applied in PHP over the already-aggregated product
 * set rather than in the database query.
 *
 * This is the explicit database-side exception the parent epic allows: the
 * per-product aggregation is unavoidably a full scan of the newsletter's orders
 * regardless of paging (a single product spans many orders), and reusing the
 * attribution reader keeps MailPoet's reported revenue consistent with Woo
 * Analytics. The aggregated product set is small, so PHP paging is cheap.
 */
class PurchasedProductsListing {
  use StatsListingFilterTrait;

  private const SORT_COLUMNS = ['name', 'count', 'total'];

  /** @var Listing\Handler */
  private $listingHandler;

  /** @var NewslettersRepository */
  private $newslettersRepository;

  /** @var PurchasedProducts */
  private $purchasedProducts;

  public function __construct(
    Listing\Handler $listingHandler,
    NewslettersRepository $newslettersRepository,
    PurchasedProducts $purchasedProducts
  ) {
    $this->listingHandler = $listingHandler;
    $this->newslettersRepository = $newslettersRepository;
    $this->purchasedProducts = $purchasedProducts;
  }

  private function parseData($data): Listing\ListingDefinition {
    $data['sort_order'] = ($data['sort_order'] ?? null) === 'asc' ? 'asc' : 'desc';
    $data['sort_by'] = (!empty($data['sort_by']) && in_array($data['sort_by'], self::SORT_COLUMNS, true))
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

    $products = $this->purchasedProducts->getStats((int)$newsletter->getId());
    $products = $this->applyFilters($products, $definition);
    $products = $this->applySorting($products, $definition);

    $count = count($products);
    $items = array_slice($products, $definition->getOffset(), $definition->getLimit());

    return [
      'count' => $count,
      'filters' => [],
      'groups' => [],
      'items' => array_values($items),
    ];
  }

  /**
   * @param array<int, array<string, mixed>> $products
   * @return array<int, array<string, mixed>>
   */
  private function applyFilters(array $products, Listing\ListingDefinition $definition): array {
    $filters = $definition->getFilters();
    $countMin = $this->sanitizeThreshold($filters['count_min'] ?? null);
    $countMax = $this->sanitizeThreshold($filters['count_max'] ?? null);
    $totalMin = $this->sanitizeThreshold($filters['total_min'] ?? null);
    $totalMax = $this->sanitizeThreshold($filters['total_max'] ?? null);
    $search = is_string($definition->getSearch()) ? trim((string)$definition->getSearch()) : '';
    $search = $search === '' ? null : $this->strToLower($search);

    return array_values(array_filter($products, function (array $product) use ($countMin, $countMax, $totalMin, $totalMax, $search): bool {
      $quantity = isset($product['count']) && is_numeric($product['count']) ? (float)$product['count'] : 0.0;
      $revenue = isset($product['total']) && is_numeric($product['total']) ? (float)$product['total'] : 0.0;
      if ($countMin !== null && $quantity < $countMin) {
        return false;
      }
      if ($countMax !== null && $quantity > $countMax) {
        return false;
      }
      if ($totalMin !== null && $revenue < $totalMin) {
        return false;
      }
      if ($totalMax !== null && $revenue > $totalMax) {
        return false;
      }
      if ($search !== null) {
        $name = isset($product['name']) && is_scalar($product['name']) ? $this->strToLower((string)$product['name']) : '';
        if (strpos($name, $search) === false) {
          return false;
        }
      }
      return true;
    }));
  }

  /**
   * @param array<int, array<string, mixed>> $products
   * @return array<int, array<string, mixed>>
   */
  private function applySorting(array $products, Listing\ListingDefinition $definition): array {
    $sortBy = in_array($definition->getSortBy(), self::SORT_COLUMNS, true) ? (string)$definition->getSortBy() : 'count';
    $direction = $definition->getSortOrder() === 'asc' ? 1 : -1;

    usort($products, function (array $first, array $second) use ($sortBy, $direction): int {
      $a = $first[$sortBy] ?? null;
      $b = $second[$sortBy] ?? null;
      if ($sortBy === 'name') {
        $result = strcasecmp(is_scalar($a) ? (string)$a : '', is_scalar($b) ? (string)$b : '');
      } else {
        $result = ((float)(is_numeric($a) ? $a : 0)) <=> ((float)(is_numeric($b) ? $b : 0));
      }
      return $result * $direction;
    });

    return $products;
  }

  private function strToLower(string $value): string {
    return function_exists('mb_strtolower') ? mb_strtolower($value) : strtolower($value);
  }
}
