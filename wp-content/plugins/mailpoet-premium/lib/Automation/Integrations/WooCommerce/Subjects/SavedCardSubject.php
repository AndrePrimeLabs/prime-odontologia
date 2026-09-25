<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Subjects;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Field;
use MailPoet\Automation\Engine\Data\Subject as SubjectData;
use MailPoet\Automation\Engine\Integration\Payload;
use MailPoet\Automation\Engine\Integration\Subject;
use MailPoet\NotFoundException;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Fields\SavedCardFieldsFactory;
use MailPoet\Premium\Automation\Integrations\WooCommerce\Payloads\SavedCardPayload;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;
use WC_Payment_Token_CC;
use WC_Payment_Tokens;

/**
 * @implements Subject<SavedCardPayload>
 */
class SavedCardSubject implements Subject {
  public const KEY = 'woocommerce:saved-card';

  private SavedCardFieldsFactory $savedCardFieldsFactory;

  public function __construct(
    SavedCardFieldsFactory $savedCardFieldsFactory
  ) {
    $this->savedCardFieldsFactory = $savedCardFieldsFactory;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation subject (entity entering automation) title
    return __('Saved card', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'token_id' => Builder::integer()->required(),
    ]);
  }

  public function getPayload(SubjectData $subjectData): Payload {
    $tokenId = (int)$subjectData->getArgs()['token_id'];
    $token = WC_Payment_Tokens::get($tokenId);
    if (!$token instanceof WC_Payment_Token_CC) {
      // translators: %d is the ID of the payment token.
      throw NotFoundException::create()->withMessage(sprintf(__("Saved card with ID '%d' not found.", 'mailpoet-premium'), $tokenId));
    }
    return new SavedCardPayload($token);
  }

  /** @return Field[] */
  public function getFields(): array {
    return $this->savedCardFieldsFactory->getFields();
  }
}
