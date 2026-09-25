<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Automation\Integrations\WordPress\Payloads\CommentPayload;

class ReviewPayload extends CommentPayload {
  /** @var \WC_Product|null|false */
  private $product;

  /** @var WooCommerce */
  private $woocommerce;

  public function __construct(
    int $commentId,
    WordPress $wp,
    WooCommerce $woocommerce
  ) {
    parent::__construct($commentId, $wp);
    $this->woocommerce = $woocommerce;
  }

  public function getRating(): int {
    $comment = $this->getComment();
    if (!$comment) {
      return 0;
    }

    //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
    $rating = $this->wp->getCommentMeta((int)$comment->comment_ID, 'rating', true);
    return is_numeric($rating) ? (int)$rating : 0;
  }

  /**
   * @return \WC_Product|null|false
   */
  public function getProduct() {
    if ($this->product === null) {
      $comment = $this->getComment();
      if (!$comment) {
        return null;
      }
      //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
      $this->product = $this->woocommerce->wcGetProduct($comment->comment_post_ID);
    }
    return $this->product;
  }
}
