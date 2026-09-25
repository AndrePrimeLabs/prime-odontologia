<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Data\Subject;
use MailPoet\Automation\Engine\Hooks;
use MailPoet\Automation\Engine\Integration\Trigger;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\MailPoet\Payloads\NewsletterLinkPayload;
use MailPoet\Automation\Integrations\MailPoet\Payloads\SubscriberPayload;
use MailPoet\Automation\Integrations\MailPoet\Subjects\NewsletterLinkSubject;
use MailPoet\Automation\Integrations\MailPoet\Subjects\SubscriberSubject;
use MailPoet\Cron\Workers\StatsNotifications\NewsletterLinkRepository;
use MailPoet\Entities\NewsletterEntity;
use MailPoet\Entities\NewsletterLinkEntity;
use MailPoet\Entities\StatisticsClickEntity;
use MailPoet\Entities\SubscriberEntity;
use MailPoet\InvalidStateException;
use MailPoet\Newsletter\NewslettersRepository;
use MailPoet\Premium\Newsletter\StatisticsClicksRepository;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class ClicksEmailLinkTrigger implements Trigger {

  const KEY = 'mailpoet:clicks-email-link';

  /** @var NewslettersRepository */
  private $newslettersRepository;

  /** @var NewsletterLinkRepository */
  private $newsletterLinkRepository;

  /** @var StatisticsClicksRepository */
  private $statisticsClicksRepository;

  /** @var WordPress */
  private $wp;

  public function __construct(
    NewslettersRepository $newslettersRepository,
    NewsletterLinkRepository $newsletterLinkRepository,
    StatisticsClicksRepository $statisticsClicksRepository,
    WordPress $wp
  ) {
    $this->newslettersRepository = $newslettersRepository;
    $this->newsletterLinkRepository = $newsletterLinkRepository;
    $this->statisticsClicksRepository = $statisticsClicksRepository;
    $this->wp = $wp;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation trigger title
    return __('Subscriber clicks a link in email', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object(
      [
        'newsletter_id' => Builder::integer()->default(0)->minimum(1)->required(),
        'link_ids' => Builder::array(Builder::oneOf([Builder::number(), Builder::string()->minLength(1)]))->minItems(1)->default([])->required(),
        'operator' => Builder::string()->required()->default('any'),
      ]
    );
  }

  public function getSubjectKeys(): array {
    return [
      SubscriberSubject::KEY,
      NewsletterLinkSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
    $newsletterId = $args->getStep()->getArgs()['newsletter_id'];
    if (!$newsletterId) {
      throw InvalidStateException::create()->withMessage(
        __('Please select a newsletter.', 'mailpoet-premium')
      );
    }
    $newsletter = $this->newslettersRepository->findOneById($newsletterId);
    if (!$newsletter) {
      throw InvalidStateException::create()->withMessage(
      // translators: %d is the ID of the newsletter
        sprintf(__("Newsletter with ID '%d' not found.", 'mailpoet-premium'), $newsletterId)
      );
    }

    $operator = $args->getStep()->getArgs()['operator'];
    if (!in_array($operator, ['all', 'any', 'none'])) {
      throw InvalidStateException::create()->withMessage(
        __('Please select an operator.', 'mailpoet-premium')
      );
    }

    $links = $args->getStep()->getArgs()['link_ids'];
    foreach ($links as $link) {
      // Automation email URLs come through as non-empty, non-numeric strings; they reference
      // a URL across all generated runs and have no DB row to look up.
      if (is_string($link) && trim($link) !== '' && !$this->isNumericLinkId($link)) {
        continue;
      }

      if (!$this->isNumericLinkId($link)) {
        throw InvalidStateException::create()->withMessage(
          __('Please select a link.', 'mailpoet-premium')
        );
      }

      $linkEntity = $this->newsletterLinkRepository->findOneById((int)$link);
      if (!$linkEntity) {
        throw InvalidStateException::create()->withMessage(
          // translators: %d is the ID of the link
          sprintf(__("Link with ID '%d' not found.", 'mailpoet-premium'), (int)$link)
        );
      }
    }
  }

  public function registerHooks(): void {
    $this->wp->addAction(
      'mailpoet_link_clicked',
      [
        $this,
        'handle',
      ],
      10,
      3
    );
  }

  public function handle(NewsletterLinkEntity $link, SubscriberEntity $subscriber, bool $isPreview): void {

    if ($isPreview) {
      return;
    }

    $this->wp->doAction(
      Hooks::TRIGGER,
      $this,
      [
        new Subject(SubscriberSubject::KEY, ['subscriber_id' => $subscriber->getId()]),
        new Subject(NewsletterLinkSubject::KEY, ['link_id' => $link->getId()]),
      ]
    );
  }

  public function isTriggeredBy(StepRunArgs $args): bool {
    $operator = $args->getStep()->getArgs()['operator'];
    $linkIds = $args->getStep()->getArgs()['link_ids'];
    $newsletterId = $args->getStep()->getArgs()['newsletter_id'];

    $subscriberPayload = $args->getSinglePayloadByClass(SubscriberPayload::class);
    $linkPayload = $args->getSinglePayloadByClass(NewsletterLinkPayload::class);
    $clickedLink = $linkPayload->getLink();
    $newsletter = $clickedLink->getNewsletter();

    if (
      !$newsletter instanceof NewsletterEntity ||
      $newsletterId !== $newsletter->getId()
    ) {
      return false;
    }

    $selectedLinkIds = $this->getSelectedLinkIds($linkIds);
    $matchByUrl = $this->isAutomationNewsletter($newsletter) || $this->hasUrlLinkIds($linkIds);
    $selectedUrls = $matchByUrl ? $this->getSelectedUrls($linkIds) : [];
    if ($operator === 'any') {
      return $matchByUrl
        ? $this->isSelectedLink($clickedLink, $selectedLinkIds, $selectedUrls)
        : in_array($clickedLink->getId(), $selectedLinkIds, true);
    } elseif ($operator === 'none') {
      return $matchByUrl
        ? !$this->isSelectedLink($clickedLink, $selectedLinkIds, $selectedUrls)
        : !in_array($clickedLink->getId(), $selectedLinkIds, true);
    }

    if (!$matchByUrl) {
      if (!$selectedLinkIds) {
        return false;
      }
      $allLinkClicks = $this->statisticsClicksRepository->findBy([
        'subscriber' => $subscriberPayload->getSubscriber(),
        'link' => $selectedLinkIds,
      ]);
      $clickedLinkIds = array_filter(array_map(
        function(StatisticsClickEntity $link) {
          return $link->getLink() ? $link->getLink()->getId() : null;
        },
        $allLinkClicks
      ));

      return count(array_diff($selectedLinkIds, $clickedLinkIds)) === 0;
    }

    if (!$selectedUrls) {
      return false;
    }

    $clickedUrls = $this->statisticsClicksRepository->findClickedUrlsBySubscriberAndNewsletter(
      $subscriberPayload->getSubscriber(),
      $newsletter,
      $selectedUrls
    );

    return count(array_diff($selectedUrls, $clickedUrls)) === 0;
  }

  /**
   * @param mixed[] $linkIds
   * @return int[]
   */
  private function getSelectedLinkIds(array $linkIds): array {
    $selectedLinkIds = [];
    foreach ($linkIds as $linkId) {
      if ($this->isNumericLinkId($linkId)) {
        $selectedLinkIds[] = (int)$linkId;
      }
    }
    return array_values(array_unique($selectedLinkIds));
  }

  /**
   * @param mixed[] $linkIds
   * @return string[]
   */
  private function getSelectedUrls(array $linkIds): array {
    $selectedUrls = [];
    foreach ($linkIds as $linkId) {
      if ($this->isNumericLinkId($linkId)) {
        $link = $this->newsletterLinkRepository->findOneById((int)$linkId);
        if ($link instanceof NewsletterLinkEntity) {
          $selectedUrls[] = $link->getUrl();
        }
        continue;
      }

      if (is_string($linkId) && trim($linkId) !== '') {
        $selectedUrls[] = trim($linkId);
      }
    }
    return array_values(array_unique($selectedUrls));
  }

  /**
   * @param int[] $selectedLinkIds
   * @param string[] $selectedUrls
   */
  private function isSelectedLink(NewsletterLinkEntity $link, array $selectedLinkIds, array $selectedUrls): bool {
    $linkId = $link->getId();
    return ($linkId && in_array($linkId, $selectedLinkIds, true)) || in_array($link->getUrl(), $selectedUrls, true);
  }

  /**
   * @param mixed $linkId
   * @phpstan-assert-if-true int|float|numeric-string $linkId
   */
  private function isNumericLinkId($linkId): bool {
    return is_int($linkId)
      || (is_float($linkId) && floor($linkId) === $linkId)
      || (is_string($linkId) && ctype_digit($linkId));
  }

  private function isAutomationNewsletter(NewsletterEntity $newsletter): bool {
    return in_array($newsletter->getType(), [NewsletterEntity::TYPE_AUTOMATION, NewsletterEntity::TYPE_AUTOMATION_TRANSACTIONAL], true);
  }

  /** @param mixed[] $linkIds */
  private function hasUrlLinkIds(array $linkIds): bool {
    foreach ($linkIds as $linkId) {
      if (is_string($linkId) && !$this->isNumericLinkId($linkId)) {
        return true;
      }
    }
    return false;
  }
}
