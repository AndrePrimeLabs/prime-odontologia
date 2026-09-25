<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints;

if (!defined('ABSPATH')) exit;


use MailPoet\API\REST\Request;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Premium\Newsletter\Stats\SubscriberEngagement;
use MailPoet\Util\License\Features\CapabilitiesManager;
use MailPoet\WP\Functions as WPFunctions;

class EngagementEndpoint extends AbstractNewsletterStatsListingEndpoint {
  /** @var SubscriberEngagement */
  private $subscriberEngagement;

  public function __construct(
    NewslettersRepository $newslettersRepository,
    CapabilitiesManager $capabilitiesManager,
    WPFunctions $wp,
    SubscriberEngagement $subscriberEngagement
  ) {
    parent::__construct($newslettersRepository, $capabilitiesManager, $wp);
    $this->subscriberEngagement = $subscriberEngagement;
  }

  protected function getListingData(
    NewsletterEntity $newsletter,
    Request $request,
    int $perPage,
    int $page
  ): array {
    return $this->subscriberEngagement->get(
      $this->getLegacyListingParameters($newsletter, $request, $perPage, $page)
    );
  }

  protected function buildItems(array $items): array {
    $items = parent::buildItems($items);
    return array_map(function (array $item): array {
      $sourceId = isset($item['source_id']) && is_scalar($item['source_id']) ? (string)$item['source_id'] : '';
      $subscriberId = isset($item['subscriber_id']) && is_scalar($item['subscriber_id']) ? (string)$item['subscriber_id'] : '';
      $status = isset($item['status']) && is_scalar($item['status']) ? (string)$item['status'] : '';
      $item['id'] = implode('-', array_filter([$status, $sourceId, $subscriberId]));
      return $item;
    }, $items);
  }
}
