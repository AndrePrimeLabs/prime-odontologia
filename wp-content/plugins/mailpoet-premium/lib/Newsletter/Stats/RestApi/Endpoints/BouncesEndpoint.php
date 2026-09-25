<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints;

if (!defined('ABSPATH')) exit;


use MailPoet\API\REST\Request;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Premium\Newsletter\Stats\Bounces;
use MailPoet\Util\License\Features\CapabilitiesManager;
use MailPoet\WP\Functions as WPFunctions;

class BouncesEndpoint extends AbstractNewsletterStatsListingEndpoint {
  /** @var Bounces */
  private $bounces;

  public function __construct(
    NewslettersRepository $newslettersRepository,
    CapabilitiesManager $capabilitiesManager,
    WPFunctions $wp,
    Bounces $bounces
  ) {
    parent::__construct($newslettersRepository, $capabilitiesManager, $wp);
    $this->bounces = $bounces;
  }

  protected function getListingData(
    NewsletterEntity $newsletter,
    Request $request,
    int $perPage,
    int $page
  ): array {
    return $this->bounces->get(
      $this->getLegacyListingParameters($newsletter, $request, $perPage, $page)
    );
  }
}
