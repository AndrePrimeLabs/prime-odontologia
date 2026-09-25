<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

namespace MailPoet\Premium\API\JSON\v1;

if (!defined('ABSPATH')) exit;


use MailPoet\API\JSON\Endpoint as APIEndpoint;
use MailPoet\API\JSON\Error as APIError;
use MailPoet\Config\AccessControl;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\NewsletterLinkEntity;
use MailPoet\Entities\ScheduledTaskEntity;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Newsletter\Statistics\NewsletterStatisticsRepository;
use MailPoet\Newsletter\Url as NewsletterUrl;
use MailPoet\Premium\API\JSON\v1\ResponseBuilders\StatsResponseBuilder;
use MailPoet\Premium\Newsletter\StatisticsClicksRepository;
use MailPoet\Premium\Newsletter\Stats as CampaignStats;
use MailPoet\Statistics\StatisticsUnsubscribesRepository;

class Stats extends APIEndpoint {
  public $permissions = [
    'global' => AccessControl::PERMISSION_MANAGE_EMAILS,
  ];

  /** @var CampaignStats\PurchasedProducts */
  private $purchasedProducts;

  /** @var NewslettersRepository */
  private $newslettersRepository;

  /** @var NewsletterStatisticsRepository */
  private $newsletterStatisticsRepository;

  /** @var StatsResponseBuilder */
  private $statsResponseBuilder;

  /** @var StatisticsClicksRepository */
  private $statisticsClicksRepository;

  /** @var NewsletterUrl */
  private $newsletterUrl;

  /** @var StatisticsUnsubscribesRepository */
  private $statisticsUnsubscribesRepository;

  public function __construct(
    CampaignStats\PurchasedProducts $purchasedProducts,
    NewslettersRepository $newslettersRepository,
    StatsResponseBuilder $statsResponseBuilder,
    StatisticsClicksRepository $statisticsClicksRepository,
    NewsletterStatisticsRepository $newsletterStatisticsRepository,
    NewsletterUrl $newsletterUrl,
    StatisticsUnsubscribesRepository $statisticsUnsubscribesRepository
  ) {
    $this->purchasedProducts = $purchasedProducts;
    $this->newslettersRepository = $newslettersRepository;
    $this->newsletterStatisticsRepository = $newsletterStatisticsRepository;
    $this->statsResponseBuilder = $statsResponseBuilder;
    $this->statisticsClicksRepository = $statisticsClicksRepository;
    $this->newsletterUrl = $newsletterUrl;
    $this->statisticsUnsubscribesRepository = $statisticsUnsubscribesRepository;
  }

  public function get($data = []) {
    $newsletter = isset($data['id'])
      ? $this->newslettersRepository->findOneById((int)$data['id'])
      : null;
    if (!$newsletter instanceof NewsletterEntity) {
      return $this->errorResponse(
        [
          APIError::NOT_FOUND => __('This newsletter does not exist.', 'mailpoet-premium'),
        ]
      );
    }

    $allowAllNewsletterTypes = isset($data['accept']) && strtolower($data['accept']) === 'all';
    $isNewsletterSent = $this->isNewsletterSent($newsletter);

    $statistics = $this->newsletterStatisticsRepository->getStatistics($newsletter);

    if (!$allowAllNewsletterTypes && !$isNewsletterSent) {
      return $this->errorResponse(
        [
          APIError::NOT_FOUND => __('This newsletter is not sent yet.', 'mailpoet-premium'),
        ]
      );
    }

    $clickedLinks = $isNewsletterSent ? $this->statisticsClicksRepository->getClickedLinks($newsletter) : [];

    $clickedLinksWithAggregatedUnsubscribes = $isNewsletterSent ? $this->getClickedLinksWithAggregatedUnsubscribes($clickedLinks) : [];

    $unsubscribeReasons = $isNewsletterSent ? $this->statisticsUnsubscribesRepository->getReasonCountsForNewsletter($newsletter) : [];

    return $this->successResponse(
      $this->statsResponseBuilder->build(
        $newsletter,
        $statistics,
        $clickedLinksWithAggregatedUnsubscribes,
        $this->newsletterUrl,
        $unsubscribeReasons
      )
    );
  }

  public function isNewsletterSent(NewsletterEntity $newsletter): bool {
    // for statistics purposes, newsletter (except for welcome notifications) is sent
    // when it has a queue record and it's status is not scheduled
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

  /**
   * @param array<string, int> $data
   *
   * @return \MailPoet\API\JSON\SuccessResponse
   */
  public function getProducts(array $data = []) {
    $id = (isset($data['newsletter_id']) ? (int)$data['newsletter_id'] : false);
    return $this->successResponse($this->purchasedProducts->getStats($id));
  }

  /**
   * @param array<int|string, array{cnt: int, url: string}> $clickedLinks
   * @return array<int, array{cnt: int, url: string}>
   */
  private function getClickedLinksWithAggregatedUnsubscribes(array $clickedLinks): array {
    /** @var array<string|int, array{cnt: int, url: string}> $associativeClickedLinks */
    $associativeClickedLinks = array_reduce($clickedLinks, function ($allCounts, $item): array {
      if (in_array($item['url'], NewsletterLinkEntity::UNSUBSCRIBE_LINK_SHORTCODES)) {
        $existingUnsubscribe = $allCounts[NewsletterLinkEntity::UNSUBSCRIBE_LINK_SHORT_CODE] ?? null;
        $existingCnt = is_array($existingUnsubscribe) && is_int($existingUnsubscribe['cnt'] ?? null) ? $existingUnsubscribe['cnt'] : 0;
        $cnt = (int)$item['cnt'] + $existingCnt;
        $allCounts[NewsletterLinkEntity::UNSUBSCRIBE_LINK_SHORT_CODE] = [
          'cnt' => $cnt,
          'url' => NewsletterLinkEntity::UNSUBSCRIBE_LINK_SHORT_CODE,
        ];
      } else {
        $allCounts[] = $item;
      }

      return $allCounts;
    }, []);

    usort($associativeClickedLinks, function (array $a, array $b): int {
      return $a['cnt'] > $b['cnt'] ? -1 : 1;
    });

    return array_values($associativeClickedLinks);
  }
}
