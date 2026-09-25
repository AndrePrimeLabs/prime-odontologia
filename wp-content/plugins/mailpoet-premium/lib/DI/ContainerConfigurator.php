<?php // phpcs:ignore SlevomatCodingStandard.TypeHints.DeclareStrictTypes.DeclareStrictTypesMissing

namespace MailPoet\Premium\DI;

if (!defined('ABSPATH')) exit;


use MailPoet\DI\IContainerConfigurator;
use MailPoetVendor\Symfony\Component\DependencyInjection\ContainerBuilder;
use MailPoetVendor\Symfony\Component\DependencyInjection\Reference;

class ContainerConfigurator implements IContainerConfigurator {
  public function getDumpNamespace() {
    return 'MailPoetGenerated';
  }

  public function getDumpClassname() {
    return 'PremiumCachedContainer';
  }

  public function configure(ContainerBuilder $container) {
    // Factory for free deps
    $container->register(IContainerConfigurator::FREE_CONTAINER_SERVICE_SLUG)
      ->setSynthetic(true)
      ->setPublic(true);

    // Free plugin dependencies
    $this->registerFreeService($container, \MailPoet\Subscribers\SubscriberTagRepository::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Storage\AutomationRunStorage::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\Sending\ScheduledTasksRepository::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\Sending\ScheduledTaskSubscribersRepository::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\Sending\TimeZoneCampaignScheduler::class);
    $this->registerFreeService($container, \MailPoet\Tags\TagRepository::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Builder\UpdateStepsController::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Builder\UpdateAutomationController::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Control\FilterHandler::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Control\ActionScheduler::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Mappers\AutomationMapper::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Storage\AutomationRunLogStorage::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Storage\AutomationStorage::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Storage\AutomationStatisticsStorage::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Hooks::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Templates\AutomationBuilder::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Validation\AutomationValidator::class);
    $this->registerFreeService($container, \MailPoet\Automation\Integrations\MailPoet\Subjects\SubscriberSubject::class);
    $this->registerFreeService($container, \MailPoet\Config\AccessControl::class);
    $this->registerFreeService($container, \MailPoet\Config\Renderer::class);
    $this->registerFreeService($container, \MailPoet\Cron\Workers\StatsNotifications\NewsletterLinkRepository::class);
    $this->registerFreeService($container, \MailPoet\CustomFields\CustomFieldsRepository::class);
    $this->registerFreeService($container, \MailPoet\Features\FeaturesController::class);
    $this->registerFreeService($container, \MailPoet\Listing\Handler::class);
    $this->registerFreeService($container, \MailPoet\Listing\PageLimit::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\NewslettersRepository::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\NewsletterSaveController::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\Options\NewsletterOptionsRepository::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\Options\NewsletterOptionFieldsRepository::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\Url::class);
    $this->registerFreeService($container, \MailPoet\Newsletter\Statistics\NewsletterStatisticsRepository::class);
    $this->registerFreeService($container, \MailPoet\Segments\SegmentsRepository::class);
    $this->registerFreeService($container, \MailPoet\Settings\TrackingConfig::class);
    $this->registerFreeService($container, \MailPoet\Statistics\StatisticsUnsubscribesRepository::class);
    $this->registerFreeService($container, \MailPoet\Statistics\StatisticsWooCommercePurchasesRepository::class);
    $this->registerFreeService($container, \MailPoet\Statistics\Track\Unsubscribes::class);
    $this->registerFreeService($container, \MailPoet\Statistics\UnsubscribeReasonTracker::class);
    $this->registerFreeService($container, \MailPoet\Subscribers\SubscriberCustomFieldRepository::class);
    $this->registerFreeService($container, \MailPoet\Subscribers\SubscriberSegmentRepository::class);
    $this->registerFreeService($container, \MailPoet\Subscribers\SubscribersRepository::class);
    $this->registerFreeService($container, \MailPoet\WooCommerce\Helper::class);
    $this->registerFreeService($container, \MailPoet\WooCommerce\OrderAttributionRevenueReader::class);
    $this->registerFreeService($container, \MailPoet\WooCommerce\WooCommerceSubscriptions\Helper::class);
    $this->registerFreeService($container, \MailPoet\WooCommerce\WooCommerceBookings\Helper::class);
    $this->registerFreeService($container, \MailPoet\WP\Functions::class);
    $this->registerFreeService($container, \MailPoetVendor\Doctrine\ORM\EntityManager::class);
    $this->registerFreeService($container, \MailPoet\Util\CdnAssetUrl::class);
    $this->registerFreeService($container, \MailPoet\Util\License\Features\CapabilitiesManager::class);
    $this->registerFreeService($container, \MailPoet\Util\License\Features\Subscribers::class);
    $this->registerFreeService($container, \MailPoet\Mailer\MailerFactory::class);
    $this->registerFreeService($container, \MailPoet\Settings\SettingsController::class);
    $this->registerFreeService($container, \MailPoet\Automation\Integrations\WooCommerce\WooCommerce::class);
    $this->registerFreeService($container, \MailPoet\EmailEditor\Integrations\MailPoet\Patterns\PatternsController::class);
    $this->registerFreeService($container, \MailPoet\EmailEditor\Integrations\MailPoet\PersonalizationTagManager::class);
    $this->registerFreeService($container, \MailPoet\EmailEditor\Integrations\MailPoet\Templates\TemplatesController::class);
    $this->registerFreeService($container, \MailPoet\Segments\WooCommerce::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\WordPress::class);
    $this->registerFreeService($container, \MailPoet\Automation\Integrations\MailPoet\Analytics\Controller\AutomationTimeSpanController::class);
    $this->registerFreeService($container, \MailPoet\Automation\Engine\Registry::class);
    $this->registerFreeService($container, \MailPoet\Automation\Integrations\MailPoet\Templates\EmailFactory::class);
    $this->registerFreeService($container, \MailPoet\Automation\Integrations\MailPoet\Actions\SendEmailAction::class);
    $this->registerFreeService($container, \MailPoet\EmailEditor\Integrations\MailPoet\Patterns\PatternsController::class);
    $this->registerFreeService($container, \MailPoet\EmailEditor\Integrations\MailPoet\Templates\TemplatesController::class);

    // API
    $container->autowire(\MailPoet\Premium\API\JSON\v1\Stats::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\API\JSON\v1\SubscriberDetailedStats::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\API\JSON\v1\ResponseBuilders\StatsResponseBuilder::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\API\JSON\v1\ResponseBuilders\SubscriberDetailedStatsResponseBuilder::class);

    // Automation
    $container->autowire(\MailPoet\Premium\Automation\Engine\Builder\CreateAutomationController::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Engine\Builder\UpdateAutomationController::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Engine\Engine::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Engine\AutomationAuthorization::class)->setPublic(true);

    // Automation - API endpoints
    $container->autowire(\MailPoet\Premium\Automation\Engine\Endpoints\Automations\AutomationsPostEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Engine\Endpoints\Automations\AutomationsPutEndpoint::class)->setPublic(true);

    // Automation - MailPoet Premium integration
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\MailPoetPremiumIntegration::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\ContextFactory::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\CustomHookChain::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\UnsubscribeAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\AddTagAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\RemoveTagAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\AddToListAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\RemoveFromListAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\UpdateSubscriberAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\NotificationEmailAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\AnnualDateTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\AnnualDateTriggerHooks::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\TagAddedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\TagRemovedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects\TagSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Templates\PremiumTemplatesFactory::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Templates\PremiumEmailFactory::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\CustomTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\ClicksEmailLinkTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Actions\CustomAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects\CustomDataSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Triggers\UserRoleChangedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Subjects\UserRoleChangeSubject::class)->setPublic(true);

    // Automation - Analytics
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Analytics::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Endpoints\OrderEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Storage\OrderStatistics::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Controller\OrderController::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Endpoints\RunLogEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Controller\RunLogController::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Endpoints\SubscriberEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Storage\SubscriberStatistics::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Controller\SubscriberController::class)->setPublic(true);

    // Automation - WordPress integration
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WordPress\WordPressIntegration::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WordPress\Actions\ChangeUserRoleAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WordPress\Triggers\MadeACommentTrigger::class)->setPublic(true);

    // Automation - WooCommerce integration
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Actions\Extenders\ReviewCrossSellHandler::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Actions\ChangeOrderStatusAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Actions\AddOrderNoteAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\WooCommerceIntegration::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\ReviewSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\CustomerWinBackSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\MadeAReviewTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\OrderPaidTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\CustomerWinBackTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\CustomerWinBackScheduler::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects\SavedCardSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Fields\SavedCardFieldsFactory::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\SavedCardExpiresTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\Triggers\SavedCardExpiresTriggerHooks::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerce\SubjectTransformers\SavedCardSubjectToWordPressUserSubjectTransformer::class)->setPublic(true)->setShared(false);

    // Automation - WooCommerce Subscriptions integration
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\WooCommerceSubscriptionsIntegration::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\ContextFactory::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Triggers\SubscriptionCreatedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Triggers\SubscriptionStatusChangedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Triggers\SubscriptionTrialStartedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Triggers\SubscriptionRenewedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Triggers\SubscriptionExpiredTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Triggers\SubscriptionPaymentFailedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Triggers\SubscriptionTrialEndedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Actions\ChangeSubscriptionStatusAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Actions\AddProductToSubscriptionAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Actions\RemoveProductFromSubscriptionAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Actions\UpdateProductOnSubscriptionAction::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Subjects\WooCommerceSubscriptionSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Subjects\WooCommerceSubscriptionStatusChangeSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceSubscriptions\Fields\SubscriptionFields::class)->setPublic(true);

    // Automation - WooCommerce Bookings integration
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\WooCommerceBookingsIntegration::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\ContextFactory::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\BookingProviderInterface::class)
      ->setClass(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\WooCommerceBookingProvider::class)
      ->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingStatusChangedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Subjects\WooCommerceBookingStatusChangeSubject::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingCreatedTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingStartsTrigger::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Triggers\BookingStartsHooks::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\Fields\BookingFields::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Automation\Integrations\WooCommerceBookings\SubjectTransformers\BookingSubjectToSubscriberSubjectTransformer::class)->setPublic(true)->setShared(false);

    // Email Editor - Personalization Tags
    $container->autowire(\MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTags\WooCommerceSubscription::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTags\WooCommerceBooking::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\EmailEditor\Integrations\MailPoet\PersonalizationTagManager::class)->setPublic(true);

    // Config
    $container->autowire(\MailPoet\Premium\Config\Hooks::class);
    $container->autowire(\MailPoet\Premium\Config\Initializer::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Config\RendererFactory::class)->setPublic(true);
    $container->register(\MailPoet\Premium\Config\Renderer::class)
      ->setPublic(true)
      ->setFactory([new Reference(\MailPoet\Premium\Config\RendererFactory::class), 'getRenderer']);
    // Segments
    $container->autowire(\MailPoet\Premium\Segments\DynamicSegments\SegmentCombinations::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Segments\DynamicSegments\Filters\SubscriberTag::class)->setPublic(true);
    // Stats
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\Bounces::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\ClickedLinks::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\PurchasedProducts::class);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\PurchasedProductsListing::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\RecipientsExporter::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\SubscriberEngagement::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\UnsubscribeReasons::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints\BouncesEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints\ClickedLinksEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints\EngagementEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints\ProductsEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\Stats\RestApi\Endpoints\UnsubscribeReasonsEndpoint::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\StatisticsClicksRepository::class)->setPublic(true);
    $container->autowire(\MailPoet\Premium\Newsletter\StatisticsOpensRepository::class);
    $container->autowire(\MailPoet\Premium\Newsletter\StatisticsUnsubscribesRepository::class);
    // Subscriber
    $container->autowire(\MailPoet\Premium\Subscriber\Stats\SubscriberNewsletterStatsRepository::class);
    return $container;
  }

  private function registerFreeService(ContainerBuilder $container, $id) {
    $container->register($id)
      ->setPublic(true)
      ->addArgument($id)
      ->setFactory([
        new Reference(IContainerConfigurator::FREE_CONTAINER_SERVICE_SLUG),
        'get',
      ]);
  }
}
