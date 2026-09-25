<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints;

if (!defined('ABSPATH')) exit;


use MailPoet\API\REST\Request;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Premium\Newsletter\Stats\PurchasedProductsListing;
use MailPoet\Util\License\Features\CapabilitiesManager;
use MailPoet\WP\Functions as WPFunctions;

class ProductsEndpoint extends AbstractNewsletterStatsListingEndpoint {
  /** @var PurchasedProductsListing */
  private $purchasedProductsListing;

  public function __construct(
    NewslettersRepository $newslettersRepository,
    CapabilitiesManager $capabilitiesManager,
    WPFunctions $wp,
    PurchasedProductsListing $purchasedProductsListing
  ) {
    parent::__construct($newslettersRepository, $capabilitiesManager, $wp);
    $this->purchasedProductsListing = $purchasedProductsListing;
  }

  protected function getListingData(
    NewsletterEntity $newsletter,
    Request $request,
    int $perPage,
    int $page
  ): array {
    return $this->purchasedProductsListing->get(
      $this->getLegacyListingParameters($newsletter, $request, $perPage, $page)
    );
  }

  protected function buildItems(array $items): array {
    return array_map(function (array $item): array {
      $item['id'] = isset($item['product_id']) && is_scalar($item['product_id'])
        ? (string)$item['product_id']
        : '';
      return $item;
    }, $items);
  }
}
