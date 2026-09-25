<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Actions\Extenders;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Exceptions\NotFoundException;
use MailPoet\Entities\SendingQueueEntity;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads\ReviewPayload;

class ReviewCrossSellHandler {
  const REVIEW_CROSS_SELL_PRODUCTS_META_NAME = 'review_cross_sell_product_ids';

  /**
   * @param array<string, mixed> $meta
   * @return array<string, mixed>
   */
  public function addReviewCrossSells(array $meta, StepRunArgs $args): array {
    if (!$this->automationHasMadeAReviewTrigger($args->getAutomation())) {
      return $meta;
    }

    try {
      // Handle Review payload - get product cross-sells
      $reviewPayload = $args->getSinglePayloadByClass(ReviewPayload::class);
      $product = $reviewPayload->getProduct();

      if ($product) {
        $productId = $product->get_id();
        $crossSellIds = $product->get_cross_sell_ids();

        if (!empty($crossSellIds)) {
          $meta[self::REVIEW_CROSS_SELL_PRODUCTS_META_NAME] = array_unique($crossSellIds);
        }
      }
    } catch (NotFoundException $e) {
      // No ReviewPayload found, continue
    }

    return $meta;
  }

  /**
   * @param array<int> $productIds
   * @param SendingQueueEntity $sendingQueue
   * @return array<int>
   */
  public function handleDynamicProductsMeta(array $productIds, SendingQueueEntity $sendingQueue): array {
    if (!empty($productIds)) {
      return $productIds;
    }

    $meta = $sendingQueue->getMeta();
    // Check for ReviewSubject cross-sells
    if (!empty($meta[self::REVIEW_CROSS_SELL_PRODUCTS_META_NAME])) {
      return array_map('intval', (array)$meta[self::REVIEW_CROSS_SELL_PRODUCTS_META_NAME]);
    }

    return $productIds;
  }

  private function automationHasMadeAReviewTrigger(Automation $automation): bool {
    return (bool)array_filter(
      $automation->getTriggers(),
      function(Step $step): bool {
        return in_array($step->getKey(), ['woocommerce:made-a-review'], true);
      }
    );
  }
}
