<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints;

if (!defined('ABSPATH')) exit;


use MailPoet\API\REST\ApiException;
use MailPoet\API\REST\Endpoint;
use MailPoet\API\REST\Request;
use MailPoet\API\REST\Response;
use MailPoet\Config\AccessControl;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\ScheduledTaskEntity;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Util\License\Features\CapabilitiesManager;
use MailPoet\Validator\Builder;
use MailPoet\WP\Functions as WPFunctions;

abstract class AbstractNewsletterStatsListingEndpoint extends Endpoint {
  private const DEFAULT_PER_PAGE = 20;
  private const MAX_PER_PAGE = 100;
  private const MAX_PAGE = 100000;

  /** @var NewslettersRepository */
  private $newslettersRepository;

  /** @var CapabilitiesManager */
  private $capabilitiesManager;

  /** @var WPFunctions */
  private $wp;

  public function __construct(
    NewslettersRepository $newslettersRepository,
    CapabilitiesManager $capabilitiesManager,
    WPFunctions $wp
  ) {
    $this->newslettersRepository = $newslettersRepository;
    $this->capabilitiesManager = $capabilitiesManager;
    $this->wp = $wp;
  }

  public function checkPermissions(): bool {
    return $this->wp->currentUserCan(AccessControl::PERMISSION_MANAGE_EMAILS);
  }

  public static function getRequestSchema(): array {
    return [
      'id' => Builder::integer()->required(),
      'page' => Builder::integer(),
      'per_page' => Builder::integer(),
      'orderby' => Builder::string(),
      'order' => Builder::string(),
      'search' => Builder::string(),
      'group' => Builder::string(),
      'filter' => Builder::object(),
    ];
  }

  public function handle(Request $request): Response {
    $newsletter = $this->getNewsletter($request);
    $this->guardDetailedAnalyticsAccess();
    $this->guardNewsletterIsSent($newsletter);

    $perPage = $this->getPerPage($request);
    $page = $this->getPage($request);
    $listingData = $this->getListingData($newsletter, $request, $perPage, $page);
    $count = isset($listingData['count']) ? (int)$listingData['count'] : 0;

    return new Response([
      'items' => $this->buildItems($listingData['items'] ?? []),
      'meta' => [
        'count' => $count,
        'pages' => $count === 0 ? 0 : (int)ceil($count / max(1, $perPage)),
      ],
      'filters' => $listingData['filters'] ?? [],
      'groups' => $listingData['groups'] ?? [],
    ]);
  }

  /**
   * @return array{
   *   count: int,
   *   filters: array<mixed>,
   *   groups: array<mixed>,
   *   items: array<int, array<string, mixed>>
   * }
   */
  abstract protected function getListingData(
    NewsletterEntity $newsletter,
    Request $request,
    int $perPage,
    int $page
  ): array;

  /**
   * @param array<int, array<string, mixed>> $items
   * @return array<int, array<string, mixed>>
   */
  protected function buildItems(array $items): array {
    return array_map(function (array $item): array {
      $subscriberId = isset($item['subscriber_id']) && is_scalar($item['subscriber_id']) ? (string)$item['subscriber_id'] : '';
      $item['subscriber_url'] = $this->wp->adminUrl(
        'admin.php?page=mailpoet-subscribers#/edit/' . $subscriberId
      );
      return $item;
    }, $items);
  }

  /**
   * @return array{
   *   params: array{id: int},
   *   offset: int,
   *   limit: int,
   *   sort_by: string|null,
   *   sort_order: string,
   *   search: string|null,
   *   group: string|null,
   *   filter: array<string, mixed>
   * }
   */
  protected function getLegacyListingParameters(
    NewsletterEntity $newsletter,
    Request $request,
    int $perPage,
    int $page
  ): array {
    $order = $request->getParam('order');
    $sortOrder = is_string($order) && strtolower($order) === 'asc' ? 'asc' : 'desc';
    $orderBy = $request->getParam('orderby');
    $search = $request->getParam('search');
    $group = $request->getParam('group');
    $filter = $request->getParam('filter');

    return [
      'params' => [
        'id' => (int)$newsletter->getId(),
      ],
      'offset' => ($page - 1) * $perPage,
      'limit' => $perPage,
      'sort_by' => is_string($orderBy) ? $orderBy : null,
      'sort_order' => $sortOrder,
      'search' => is_string($search) ? $search : null,
      'group' => is_string($group) ? $group : null,
      'filter' => is_array($filter) ? $filter : [],
    ];
  }

  private function getNewsletter(Request $request): NewsletterEntity {
    $id = $request->getParam('id');
    $newsletter = is_numeric($id)
      ? $this->newslettersRepository->findOneById((int)$id)
      : null;

    if (!$newsletter instanceof NewsletterEntity) {
      throw new ApiException(
        __('This newsletter does not exist.', 'mailpoet-premium'),
        404,
        'mailpoet_stats_newsletter_not_found'
      );
    }

    return $newsletter;
  }

  private function guardDetailedAnalyticsAccess(): void {
    $capability = $this->capabilitiesManager->getCapability('detailedAnalytics');
    if ($capability && $capability->isRestricted) {
      throw new ApiException(
        __('Detailed analytics are not available for this site.', 'mailpoet-premium'),
        403,
        'mailpoet_stats_detailed_analytics_restricted'
      );
    }
  }

  private function guardNewsletterIsSent(NewsletterEntity $newsletter): void {
    if ($this->isNewsletterSent($newsletter)) {
      return;
    }

    throw new ApiException(
      __('This newsletter is not sent yet.', 'mailpoet-premium'),
      404,
      'mailpoet_stats_newsletter_not_sent'
    );
  }

  private function isNewsletterSent(NewsletterEntity $newsletter): bool {
    $queue = $newsletter->getLatestQueue();
    if (!$queue) return false;
    $task = $queue->getTask();
    if (!$task) return false;

    if (
      ($newsletter->getType() === NewsletterEntity::TYPE_WELCOME)
      || ($newsletter->getType() === NewsletterEntity::TYPE_AUTOMATIC)
    ) return true;

    return $task->getStatus() !== ScheduledTaskEntity::STATUS_SCHEDULED;
  }

  private function getPerPage(Request $request): int {
    $perPage = $request->getParam('per_page');
    return is_numeric($perPage)
      ? max(1, min(self::MAX_PER_PAGE, (int)$perPage))
      : self::DEFAULT_PER_PAGE;
  }

  private function getPage(Request $request): int {
    $page = $request->getParam('page');
    return is_numeric($page)
      ? min(self::MAX_PAGE, max(1, (int)$page))
      : 1;
  }
}
