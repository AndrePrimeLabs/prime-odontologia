<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints;

if (!defined('ABSPATH')) exit;


use MailPoet\API\REST\Request;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Premium\Newsletter\Stats\ClickedLinks;
use MailPoet\Util\License\Features\CapabilitiesManager;
use MailPoet\WP\Functions as WPFunctions;

class ClickedLinksEndpoint extends AbstractNewsletterStatsListingEndpoint {
  /** @var ClickedLinks */
  private $clickedLinks;

  public function __construct(
    NewslettersRepository $newslettersRepository,
    CapabilitiesManager $capabilitiesManager,
    WPFunctions $wp,
    ClickedLinks $clickedLinks
  ) {
    parent::__construct($newslettersRepository, $capabilitiesManager, $wp);
    $this->clickedLinks = $clickedLinks;
  }

  protected function getListingData(
    NewsletterEntity $newsletter,
    Request $request,
    int $perPage,
    int $page
  ): array {
    return $this->clickedLinks->get(
      $this->getLegacyListingParameters($newsletter, $request, $perPage, $page)
    );
  }

  protected function buildItems(array $items): array {
    return array_map(function (array $item): array {
      $item['cnt'] = isset($item['cnt']) && is_numeric($item['cnt']) ? (int)$item['cnt'] : 0;
      if (isset($item['link_id']) && is_scalar($item['link_id'])) {
        $item['id'] = (string)$item['link_id'];
      } else {
        $item['id'] = isset($item['url']) && is_scalar($item['url']) ? (string)$item['url'] : '';
      }
      return $item;
    }, $items);
  }
}
