<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

namespace MailPoet\Premium\Config;

if (!defined('ABSPATH')) exit;


use MailPoet\Cron\Workers\StatsNotifications\Worker;
use MailPoet\EmailEditor\Integrations\MailPoet\PersonalizationTagManager as FreePersonalizationTagManager;
use MailPoet\Newsletter\Statistics\Export\StatisticsExporter;
use MailPoet\Premium\Automation\Engine\Engine;
use MailPoet\Premium\Config\Hooks as ConfigHooks;
use MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTagManager;
use MailPoet\Premium\Newsletter\Stats\RecipientsExporter;
use MailPoet\Premium\Segments\DynamicSegments\Filters\SubscriberTag;
use MailPoet\Premium\Segments\DynamicSegments\SegmentCombinations;
use MailPoet\Util\License\Features\Subscribers;
use MailPoet\WP\Functions as WPFunctions;

class Initializer {

  /** @var Renderer */
  private $renderer;

  /** @var WPFunctions */
  private $wp;

  /** @var ConfigHooks */
  private $hooks;

  /** @var SegmentCombinations */
  private $segmentCombinations;

  /** @var SubscriberTag */
  private $subscriberTag;

  /** @var Engine */
  private $automationEngine;

  /** @var Subscribers */
  private $subscribers;

  private RendererFactory $rendererFactory;

  private PersonalizationTagManager $personalizationTagManager;

  private FreePersonalizationTagManager $freePersonalizationTagManager;

  /** @var RecipientsExporter */
  private $recipientsExporter;

  const INITIALIZED = 'MAILPOET_PREMIUM_INITIALIZED';

  public function __construct(
    WPFunctions $wp,
    ConfigHooks $hooks,
    SegmentCombinations $segmentCombinations,
    SubscriberTag $subscriberTag,
    Engine $automationEngine,
    RendererFactory $rendererFactory,
    Subscribers $subscribers,
    PersonalizationTagManager $personalizationTagManager,
    FreePersonalizationTagManager $freePersonalizationTagManager,
    RecipientsExporter $recipientsExporter
  ) {
    $this->wp = $wp;
    $this->hooks = $hooks;
    $this->segmentCombinations = $segmentCombinations;
    $this->subscriberTag = $subscriberTag;
    $this->automationEngine = $automationEngine;
    $this->rendererFactory = $rendererFactory;
    $this->subscribers = $subscribers;
    $this->personalizationTagManager = $personalizationTagManager;
    $this->freePersonalizationTagManager = $freePersonalizationTagManager;
    $this->recipientsExporter = $recipientsExporter;
  }

  public function init(
    $params = [
      'file' => '',
      'version' => '1.0.0',
    ]
  ) {
    Env::init($params['file'], $params['version']);

    $this->wp->addAction('mailpoet_initialized', [
      $this,
      'setup',
    ]);

    $this->wp->addAction('init', [
      $this,
      'setupAutomations',
    ], 1);
  }

  public function setup() {
    $this->setupLocalizer();
    $this->setupRenderer();

    $this->wp->addAction(
      'mailpoet_styles_admin_after',
      [$this, 'includePremiumStyles']
    );

    $this->wp->addAction(
      'mailpoet_scripts_admin_before',
      [$this, 'includePremiumJavascript']
    );

    $this->setupStatsPages();
    $this->setupStatisticsExport();
    $this->setupSegmentCombinations();
    $this->setupSegmentFilters();
    $this->setupEmailEditor();

    $this->hooks->init();

    if (!defined(self::INITIALIZED)) {
      define(self::INITIALIZED, true);
    }
  }

  public function setupEmailEditor(): void {
    $this->personalizationTagManager->initialize();
  }

  public function setupAutomations() {

    // automation
    $subscriberLimitReached = $this->subscribers->check();
    $premiumFeaturesEnabled = $this->subscribers->hasValidPremiumKey() && !$subscriberLimitReached;
    if ($premiumFeaturesEnabled) {
      $this->automationEngine->initialize();
    }
  }

  public function setupRenderer() {
    $this->renderer = $this->rendererFactory->getRenderer();
  }

  public function setupLocalizer() {
    $localizer = new Localizer();
    $localizer->init();
  }

  public function setupStatsPages() {
    $this->wp->addAction(
      'mailpoet_newsletters_translations_after',
      [$this, 'newslettersCampaignStats']
    );
    $this->wp->addAction(
      'mailpoet_subscribers_translations_after',
      [$this, 'subscribersStats']
    );
  }

  public function setupStatisticsExport(): void {
    $this->wp->addFilter(
      StatisticsExporter::FILTER_RECIPIENT_ROWS,
      [$this->recipientsExporter, 'getRows'],
      10,
      2
    );
  }

  public function setupSegmentCombinations() {
    $this->wp->addFilter(
      'mailpoet_dynamic_segments_filters_map',
      [$this->segmentCombinations, 'mapMultipleFilters'],
      10,
      2
    );
    $this->wp->addAction(
      'mailpoet_dynamic_segments_filters_save',
      [$this->segmentCombinations, 'saveMultipleFilters'],
      10,
      2
    );
  }

  public function setupSegmentFilters(): void {
    $this->wp->addAction(
      'mailpoet_dynamic_segments_filter_subscriber_tag_apply',
      [$this->subscriberTag, 'apply'],
      10,
      2
    );
    $this->wp->addFilter(
      'mailpoet_dynamic_segments_filter_subscriber_tag_getLookupData',
      [$this->subscriberTag, 'getLookupDataFilterCallback'],
      10,
      2
    );
  }

  public function newslettersCampaignStats() {
    $data['shortcode_links'] = $this->getLinkLabels();

    $this->renderView('newsletters/campaign_stats.html', $data);
  }

  public function subscribersStats() {
    $data['shortcode_links'] = $this->getLinkLabels();

    $this->renderView('subscribers/stats.html', $data);
  }

  /**
   * Stored link URLs to substitute with user-friendly names: legacy shortcodes
   * and personalization tag tokens.
   *
   * @return array<string, string>
   */
  private function getLinkLabels(): array {
    return Worker::getShortcodeLinksMapping() + $this->freePersonalizationTagManager->getTokenDisplayNames();
  }

  public function includePremiumStyles() {
    $this->wp->wpEnqueueStyle(
      'mailpoet_premium',
      Env::$assetsUrl . '/dist/css/' . $this->renderer->getCssAsset('mailpoet-premium.css'),
      [],
      Env::$version
    );
  }

  public function includePremiumJavascript() {
    $this->wp->wpEnqueueScript(
      'premium',
      Env::$assetsUrl . '/dist/js/' . $this->renderer->getJsAsset('premium.js'),
      ['mailpoet_admin_vendor'],
      Env::$version,
      true
    );
    $this->wp->wpSetScriptTranslations('premium', 'mailpoet-premium');
  }

  /**
   * @param string $path
   * @param array<string, mixed> $data
   * @return void
   * @throws \Exception
   */
  private function renderView(string $path, array $data = []) {
    // We control those templates and the data.
    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    echo $this->renderer->render($path, $data);
  }
}
