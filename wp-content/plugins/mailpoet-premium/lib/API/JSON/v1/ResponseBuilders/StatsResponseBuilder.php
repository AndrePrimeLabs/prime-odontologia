<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

namespace MailPoet\Premium\API\JSON\v1\ResponseBuilders;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\NewsletterSegmentEntity;
use MailPoet\Entities\ScheduledTaskEntity;
use MailPoet\Entities\SegmentEntity;
use MailPoet\Entities\SendingQueueEntity;
use MailPoet\Newsletter\Sending\TimeZoneCampaignScheduler;
use MailPoet\Newsletter\Statistics\NewsletterStatistics;
use MailPoet\Newsletter\Url as NewsletterUrl;
use MailPoetVendor\Doctrine\Common\Collections\ArrayCollection;

class StatsResponseBuilder {
  const DATE_FORMAT = 'Y-m-d H:i:s';

  /** @var TimeZoneCampaignScheduler */
  private $timeZoneCampaignScheduler;

  public function __construct(
    TimeZoneCampaignScheduler $timeZoneCampaignScheduler
  ) {
    $this->timeZoneCampaignScheduler = $timeZoneCampaignScheduler;
  }

  /**
   * @param NewsletterEntity $newsletter
   * @param NewsletterStatistics $statistics
   * @param array<array<string, int|string>> $clickedLinks
   * @param NewsletterUrl $newsletterUrl
   * @param array<array<string, int|string>> $unsubscribeReasons
   *
   * @return array<string, int|string|array<string, mixed>|null>
   */
  public function build(
    NewsletterEntity $newsletter,
    NewsletterStatistics $statistics,
    array $clickedLinks,
    NewsletterUrl $newsletterUrl,
    array $unsubscribeReasons = []
  ): array {
    $segments = $newsletter->getNewsletterSegments();

    $statisticsArray = $statistics->asArray();
    $statisticsArray['unsubscribeReasons'] = $unsubscribeReasons;

    $result = [
      'id' => (string)$newsletter->getId(),
      'subject' => $newsletter->getSubject(),
      'campaign_name' => $newsletter->getCampaignName(),
      'sender_address' => $newsletter->getSenderAddress(),
      'sender_name' => $newsletter->getSenderName(),
      'reply_to_address' => $newsletter->getReplyToAddress(),
      'reply_to_name' => $newsletter->getReplyToName(),
      'segments' => $this->buildSegments($segments),
      'hash' => $newsletter->getHash(),
      'type' => $newsletter->getType(),
      'statistics' => $statisticsArray,
      'total_sent' => $statistics->getTotalSentCount(),
      'ga_campaign' => $newsletter->getGaCampaign(),
      'clicked_links' => $clickedLinks,
      'created_at' => ($createdAt = $newsletter->getCreatedAt()) ? $createdAt->format(self::DATE_FORMAT) : null,
      'updated_at' => $newsletter->getUpdatedAt()->format(self::DATE_FORMAT),
      'deleted_at' => ($deletedAt = $newsletter->getDeletedAt()) ? $deletedAt->format(self::DATE_FORMAT) : null,
      'sent_at' => ($sentAt = $newsletter->getSentAt()) ? $sentAt->format(self::DATE_FORMAT) : null,
      'status' => $newsletter->getStatus(),
      'parent_id' => ($parent = $newsletter->getParent()) ? $parent->getId() : null,
      'wp_post_id' => $newsletter->getWpPostId(),
    ];

    $queue = $newsletter->getLatestQueue();

    if ($queue instanceof SendingQueueEntity) {
      $task = $queue->getTask();
      if ($task instanceof ScheduledTaskEntity) {
        // For a time zone campaign the aggregate data is authoritative: it spans
        // all sibling batch queues and its meta carries the timezoneBreakdown the
        // stats page renders.
        $aggregateData = $this->timeZoneCampaignScheduler->getAggregateQueueData($queue);
        $scheduledAt = $aggregateData ? $aggregateData['scheduledAt'] : $task->getScheduledAt();
        $result['queue'] = [
          'id' => $queue->getId(),
          'scheduled_at' => is_null($scheduledAt) ? null : $scheduledAt->format(self::DATE_FORMAT),
          'created_at' => ($createdAt = $task->getCreatedAt()) ? $createdAt->format(self::DATE_FORMAT) : null,
          'meta' => $aggregateData ? $aggregateData['meta'] : $queue->getMeta(),
        ];
      }
    }

    $result['preview_url'] = $newsletterUrl->getViewInBrowserUrl(
      $newsletter,
      null,
      in_array($newsletter->getStatus(), [NewsletterEntity::STATUS_SENT, NewsletterEntity::STATUS_SENDING], true)
        ? $queue
        : null
    );

    return $result;
  }

  /**
   * @param ArrayCollection<int, NewsletterSegmentEntity> $segments
   * @return array<array<string, int|string>>
   */
  private function buildSegments($segments): array {
    $result = [];
    foreach ($segments as $newsletterSegment) {
      $segment = $newsletterSegment->getSegment();
      if ($segment instanceof SegmentEntity) {
        $result[] = [
          'name' => $segment->getName(),
          'id' => (string)$segment->getId(), // (string) for BC and consistency
        ];
      }
    }
    return $result;
  }
}
