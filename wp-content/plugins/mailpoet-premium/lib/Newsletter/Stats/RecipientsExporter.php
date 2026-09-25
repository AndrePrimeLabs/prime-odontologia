<?php declare(strict_types = 1);

namespace MailPoet\Premium\Newsletter\Stats;

if (!defined('ABSPATH')) exit;


use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\SendingQueueEntity;
use MailPoet\Entities\StatisticsBounceEntity;
use MailPoet\Entities\StatisticsClickEntity;
use MailPoet\Entities\StatisticsNewsletterEntity;
use MailPoet\Entities\StatisticsOpenEntity;
use MailPoet\Entities\StatisticsUnsubscribeEntity;
use MailPoet\Entities\SubscriberEntity;
use MailPoet\Entities\UserAgentEntity;
use MailPoet\Newsletter\Sending\TimeZoneCampaignScheduler;
use MailPoet\Settings\TrackingConfig;
use MailPoetVendor\Doctrine\DBAL\ParameterType;
use MailPoetVendor\Doctrine\ORM\EntityManager;

/**
 * Premium-side per-recipient exporter. Builds one row per subscriber that
 * received the campaign, joining open/click/bounce/unsubscribe stats. Hooked
 * into the free plugin via the `mailpoet_statistics_export_recipient_rows`
 * filter.
 *
 * Column order MUST match StatisticsExporter::getRecipientHeaders() in the
 * free plugin. For subscriber-timezone campaigns, the same resolver used by
 * the free headers adds three cells in this order: delivery timezone,
 * timezone fallback used, local send time.
 */
class RecipientsExporter {
  /** @var EntityManager */
  private $entityManager;

  /** @var TimeZoneCampaignScheduler */
  private $timeZoneCampaignScheduler;

  /** @var TrackingConfig */
  private $trackingConfig;

  public function __construct(
    EntityManager $entityManager,
    TimeZoneCampaignScheduler $timeZoneCampaignScheduler,
    TrackingConfig $trackingConfig
  ) {
    $this->entityManager = $entityManager;
    $this->timeZoneCampaignScheduler = $timeZoneCampaignScheduler;
    $this->trackingConfig = $trackingConfig;
  }

  /**
   * @param array<array<int|string|float|null>> $rows
   * @return array<array<int|string|float|null>>
   */
  public function getRows(array $rows, NewsletterEntity $newsletter): array {
    $newsletterId = (int)$newsletter->getId();
    if ($newsletterId <= 0) {
      return $rows;
    }

    $timeZoneCampaignQueue = $this->timeZoneCampaignScheduler->resolveTimeZoneCampaignQueue($newsletter);
    $timeZoneCampaignId = $timeZoneCampaignQueue !== null
      ? $this->timeZoneCampaignScheduler->getCampaignId($timeZoneCampaignQueue)
      : null;

    $subscribersTable = $this->entityManager->getClassMetadata(SubscriberEntity::class)->getTableName();
    $sentTable = $this->entityManager->getClassMetadata(StatisticsNewsletterEntity::class)->getTableName();
    $opensTable = $this->entityManager->getClassMetadata(StatisticsOpenEntity::class)->getTableName();
    $clicksTable = $this->entityManager->getClassMetadata(StatisticsClickEntity::class)->getTableName();
    $unsubscribesTable = $this->entityManager->getClassMetadata(StatisticsUnsubscribeEntity::class)->getTableName();
    $bouncesTable = $this->entityManager->getClassMetadata(StatisticsBounceEntity::class)->getTableName();

    $queueMetaSelect = 'NULL';
    $deliveryQueueJoin = '';
    if ($timeZoneCampaignId !== null) {
      $sendingQueuesTable = $this->entityManager->getClassMetadata(SendingQueueEntity::class)->getTableName();
      $queueMetaSelect = 'MAX(delivery_queue.meta)';
      $deliveryQueueJoin = "LEFT JOIN {$sendingQueuesTable} delivery_queue ON delivery_queue.id = sent.queue_id";
    }

    $humanType = UserAgentEntity::USER_AGENT_TYPE_HUMAN;
    $machineType = UserAgentEntity::USER_AGENT_TYPE_MACHINE;

    $countedOpensCondition = $this->trackingConfig->areOpensSeparated()
      ? '(counted_opens.user_agent_type = :humanType OR counted_opens.user_agent_type IS NULL)'
      : '(counted_opens.user_agent_type != :machineType OR counted_opens.user_agent_type IS NULL)';

    // The derived table chooses the subscriber's first sent row by id so the
    // exported delivery timezone and local send time stay paired even when
    // duplicate sent rows exist for a subscriber.
    $sql = "SELECT
        s.id AS subscriber_id,
        s.email AS email,
        s.first_name AS first_name,
        s.last_name AS last_name,
        s.status AS status,
        sent.sent_at AS sent_at,
        {$queueMetaSelect} AS queue_meta,
        MIN(counted_opens.created_at) AS first_open_at,
        COUNT(DISTINCT counted_opens.id) AS open_count,
        COUNT(DISTINCT machine_opens.id) AS machine_open_count,
        COUNT(DISTINCT clicks.id) AS click_count,
        MAX(CASE WHEN unsubscribes.id IS NULL THEN 0 ELSE 1 END) AS unsubscribed,
        MAX(CASE WHEN bounces.id IS NULL THEN 0 ELSE 1 END) AS bounced
      FROM (
        SELECT subscriber_id, MIN(id) AS first_sent_id
        FROM {$sentTable}
        WHERE newsletter_id = :newsletterId
        GROUP BY subscriber_id
      ) first_sent
      INNER JOIN {$sentTable} sent ON sent.id = first_sent.first_sent_id
      INNER JOIN {$subscribersTable} s ON s.id = sent.subscriber_id
      {$deliveryQueueJoin}
      LEFT JOIN {$opensTable} counted_opens
        ON counted_opens.subscriber_id = sent.subscriber_id
        AND counted_opens.newsletter_id = sent.newsletter_id
        AND {$countedOpensCondition}
      LEFT JOIN {$opensTable} machine_opens
        ON machine_opens.subscriber_id = sent.subscriber_id
        AND machine_opens.newsletter_id = sent.newsletter_id
        AND machine_opens.user_agent_type = :machineType
      LEFT JOIN {$clicksTable} clicks
        ON clicks.subscriber_id = sent.subscriber_id
        AND clicks.newsletter_id = sent.newsletter_id
        AND (clicks.user_agent_type = :humanType OR clicks.user_agent_type IS NULL)
      LEFT JOIN {$unsubscribesTable} unsubscribes
        ON unsubscribes.subscriber_id = sent.subscriber_id
        AND unsubscribes.newsletter_id = sent.newsletter_id
      LEFT JOIN {$bouncesTable} bounces
        ON bounces.subscriber_id = sent.subscriber_id
        AND bounces.newsletter_id = sent.newsletter_id
      GROUP BY s.id, s.email, s.first_name, s.last_name, s.status, sent.queue_id, sent.sent_at
      ORDER BY s.email ASC";

    $statement = $this->entityManager->getConnection()->executeQuery(
      $sql,
      [
        'newsletterId' => $newsletterId,
        'humanType' => $humanType,
        'machineType' => $machineType,
      ],
      [
        'newsletterId' => ParameterType::INTEGER,
        'humanType' => ParameterType::INTEGER,
        'machineType' => ParameterType::INTEGER,
      ]
    );

    foreach ($statement->iterateAssociative() as $row) {
      /** @var array{
       *   subscriber_id: int|string,
       *   email: string,
       *   first_name: string|null,
       *   last_name: string|null,
       *   status: string|null,
       *   sent_at: string|null,
       *   queue_meta: string|null,
       *   first_open_at: string|null,
       *   open_count: int|string,
       *   machine_open_count: int|string,
       *   click_count: int|string,
       *   unsubscribed: int|string,
       *   bounced: int|string,
       * } $row */
      $openCount = (int)$row['open_count'];
      $machineOpenCount = (int)$row['machine_open_count'];
      $clickCount = (int)$row['click_count'];
      $exportRow = [
        (int)$row['subscriber_id'],
        $row['email'],
        $row['first_name'] ?? '',
        $row['last_name'] ?? '',
        $row['status'] ?? '',
        $openCount > 0 ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium'),
        $this->formatExportDateTimeCell($row['first_open_at'] ?? null),
        $openCount,
        $machineOpenCount > 0 ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium'),
        $clickCount > 0 ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium'),
        $clickCount,
        ((int)$row['bounced']) === 1 ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium'),
        ((int)$row['unsubscribed']) === 1 ? __('Yes', 'mailpoet-premium') : __('No', 'mailpoet-premium'),
      ];
      if ($timeZoneCampaignId !== null) {
        $queueMeta = $this->decodeTimeZoneQueueMeta($row['queue_meta'] ?? null, $timeZoneCampaignId);
        if ($queueMeta === null) {
          // A recipient sent outside the campaign's timezone queues has no
          // delivery-timezone truth; empty cells are more honest than a
          // misleading "No" fallback value.
          $exportRow[] = '';
          $exportRow[] = '';
          $exportRow[] = '';
        } else {
          $groupTimeZone = $queueMeta[TimeZoneCampaignScheduler::META_GROUP_TIMEZONE] ?? null;
          $groupTimeZone = is_string($groupTimeZone) ? $groupTimeZone : null;
          $exportRow[] = $groupTimeZone ?? '';
          $exportRow[] = !empty($queueMeta[TimeZoneCampaignScheduler::META_FALLBACK_USED])
            ? __('Yes', 'mailpoet-premium')
            : __('No', 'mailpoet-premium');
          $exportRow[] = $this->formatLocalSendTimeCell($row['sent_at'] ?? null, $groupTimeZone);
        }
      }
      $rows[] = $exportRow;
    }

    return $rows;
  }

  /**
   * @return array<string, mixed>|null
   */
  private function decodeTimeZoneQueueMeta(?string $encodedMeta, string $campaignId): ?array {
    if ($encodedMeta === null || $encodedMeta === '') {
      return null;
    }
    $meta = json_decode($encodedMeta, true);
    if (
      !is_array($meta)
      || empty($meta[TimeZoneCampaignScheduler::META_SEND_BY_TIMEZONE])
      || ($meta[TimeZoneCampaignScheduler::META_TIMEZONE_CAMPAIGN_ID] ?? null) !== $campaignId
    ) {
      return null;
    }
    return $meta;
  }

  /**
   * Converts the UTC send time into the recipient group's timezone. When the
   * timezone is missing or invalid the raw UTC value is exported with a note
   * instead of failing the whole export.
   *
   * @param \DateTimeInterface|string|null $sentAt
   */
  private function formatLocalSendTimeCell($sentAt, ?string $timeZone): string {
    $sentAt = $this->formatExportDateTimeCell($sentAt);
    if ($sentAt === '') {
      return '';
    }
    if ($timeZone !== null && $timeZone !== '') {
      try {
        $localSentAt = new \DateTimeImmutable($sentAt, new \DateTimeZone('UTC'));
        return $localSentAt->setTimezone(new \DateTimeZone($timeZone))->format('Y-m-d H:i:s');
      } catch (\Exception $e) {
        // Unknown timezone identifier: fall through to the raw UTC value.
      }
    }
    // translators: %s is the send time in UTC, shown when the recipient's delivery timezone could not be resolved.
    return sprintf(__('%s (UTC)', 'mailpoet-premium'), $sentAt);
  }

  /**
   * @param \DateTimeInterface|string|null $value
   */
  private function formatExportDateTimeCell($value): string {
    if ($value instanceof \DateTimeInterface) {
      return $value->format('Y-m-d H:i:s');
    }
    if ($value === null || $value === '') {
      return '';
    }
    return $value;
  }
}
