<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Field;
use MailPoet\Automation\Engine\Data\Subject as SubjectData;
use MailPoet\Automation\Engine\Integration\Payload;
use MailPoet\Automation\Engine\Integration\Subject;
use MailPoet\Automation\Engine\WordPress;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads\ReviewPayload;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

/**
 * @implements Subject<ReviewPayload>
 */
class ReviewSubject implements Subject {


  public const KEY = 'woocommerce:review';

  private $wp;

  /** @var WooCommerce */
  private $woocommerce;

  public function __construct(
    WordPress $wp,
    WooCommerce $woocommerce
  ) {
    $this->wp = $wp;
    $this->woocommerce = $woocommerce;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation subject (entity entering automation) title
    return __('Review', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'review_id' => Builder::integer()->required(),
    ]);
  }

  public function getFields(): array {
    return [
      new Field(
        'woocommerce:review:rating',
        Field::TYPE_INTEGER,
        __('Review rating', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          return $payload->getRating();
        }
      ),
      new Field(
        'woocommerce:review:text',
        Field::TYPE_STRING,
        __('Review text', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $comment = $payload->getComment();
          //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return $comment ? $comment->comment_content : null;
        }
      ),
      new Field(
        'woocommerce:review:admin-url',
        Field::TYPE_STRING,
        __('Review admin URL', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $comment = $payload->getComment();
          //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return $comment ? $this->wp->adminUrl('comment.php?action=editcomment&c=' . (int)$comment->comment_ID) : null;
        }
      ),
      new Field(
        'woocommerce:review:product:id',
        Field::TYPE_INTEGER,
        __('Product ID', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $comment = $payload->getComment();
          //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return $comment ? (int)$comment->comment_post_ID : null;
        }
      ),
      new Field(
        'woocommerce:review:product:name',
        Field::TYPE_STRING,
        __('Product name', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $product = $payload->getProduct();
          return $product ? $product->get_name() : null;
        }
      ),
      new Field(
        'woocommerce:review:product:url',
        Field::TYPE_STRING,
        __('Product URL', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $product = $payload->getProduct();
          return $product ? $this->wp->getPermalink($product->get_id()) : null;
        }
      ),
      new Field(
        'woocommerce:review:product:price',
        Field::TYPE_NUMBER,
        __('Product price', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $product = $payload->getProduct();
          return $product ? (float)$product->get_price('edit') : null;
        }
      ),
      new Field(
        'woocommerce:review:reviewer:id',
        Field::TYPE_INTEGER,
        __('Reviewer ID', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $comment = $payload->getComment();
          //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return $comment ? (int)$comment->user_id : null;
        }
      ),
      new Field(
        'woocommerce:review:reviewer:name',
        Field::TYPE_STRING,
        __('Reviewer name', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $comment = $payload->getComment();
          //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return $comment ? $comment->comment_author : null;
        }
      ),
      new Field(
        'woocommerce:review:reviewer:email',
        Field::TYPE_STRING,
        __('Reviewer email', 'mailpoet-premium'),
        function (ReviewPayload $payload) {
          $comment = $payload->getComment();
          //phpcs:ignore Squiz.NamingConventions.ValidVariableName.MemberNotCamelCaps
          return $comment ? $comment->comment_author_email : null;
        }
      ),
    ];
  }

  public function getPayload(SubjectData $subjectData): Payload {
    $reviewId = (int)$subjectData->getArgs()['review_id'];
    return new ReviewPayload($reviewId, $this->wp, $this->woocommerce);
  }
}
