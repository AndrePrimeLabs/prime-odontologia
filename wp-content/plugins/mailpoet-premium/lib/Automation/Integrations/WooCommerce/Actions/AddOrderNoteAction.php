<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WooCommerce\Actions;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Control\StepRunController;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Data\StepRunArgs;
use MailPoet\Automation\Engine\Data\StepValidationArgs;
use MailPoet\Automation\Engine\Exceptions\RuntimeException;
use MailPoet\Automation\Engine\Integration\Action;
use MailPoet\Automation\Engine\Integration\ValidationException;
use MailPoet\Automation\Integrations\WooCommerce\Payloads\OrderPayload;
use MailPoet\Automation\Integrations\WooCommerce\Subjects\OrderSubject;
use MailPoet\Premium\Automation\Engine\AutomationAuthorization;
use MailPoet\Validator\Builder;
use MailPoet\Validator\Schema\ObjectSchema;

class AddOrderNoteAction implements Action {
  public const KEY = 'woocommerce:add-order-note';

  private const NOTE_TYPE_PRIVATE = 'private';
  private const NOTE_TYPE_CUSTOMER = 'customer';

  /** @var AutomationAuthorization */
  private $authorization;

  public function __construct(
    AutomationAuthorization $authorization
  ) {
    $this->authorization = $authorization;
  }

  public function getKey(): string {
    return self::KEY;
  }

  public function getName(): string {
    // translators: automation action title
    return __('Add order note', 'mailpoet-premium');
  }

  public function getArgsSchema(): ObjectSchema {
    return Builder::object([
      'note' => Builder::string()->required()->minLength(1),
      'note_type' => Builder::string()->required()->pattern('^(private|customer)$')->default(self::NOTE_TYPE_PRIVATE),
    ]);
  }

  public function getSubjectKeys(): array {
    return [
      OrderSubject::KEY,
    ];
  }

  public function validate(StepValidationArgs $args): void {
    $stepArgs = $args->getStep()->getArgs();
    $this->validateNote((string)($stepArgs['note'] ?? ''));
    $this->validateNoteType((string)($stepArgs['note_type'] ?? self::NOTE_TYPE_PRIVATE));
    $this->authorization->authorizeSave($args->getAutomation(), [AutomationAuthorization::CAPABILITY_MANAGE_WOOCOMMERCE], $this->getAuthorizationMessage());
  }

  public function run(StepRunArgs $args, StepRunController $controller): void {
    $this->authorization->authorizeRun($args->getAutomation(), [AutomationAuthorization::CAPABILITY_MANAGE_WOOCOMMERCE], $this->getAuthorizationMessage());
    $stepArgs = $args->getStep()->getArgs();
    $note = (string)($stepArgs['note'] ?? '');
    $noteType = (string)($stepArgs['note_type'] ?? self::NOTE_TYPE_PRIVATE);
    $this->validateNote($note);
    $this->validateNoteType($noteType);

    $order = $args->getSinglePayloadByClass(OrderPayload::class)->getOrder();
    try {
      $isCustomerNote = $noteType === self::NOTE_TYPE_CUSTOMER ? 1 : 0;
      $order->add_order_note($note, $isCustomerNote);
    } catch (\Throwable $e) {
      throw RuntimeException::create($e)->withMessage(
        __("Order note could not be added.", 'mailpoet-premium')
      );
    }
  }

  public function onDuplicate(Step $step): Step {
    return $step;
  }

  private function getAuthorizationMessage(): string {
    return __('The user who last saved this automation is not allowed to add order notes.', 'mailpoet-premium');
  }

  private function validateNote(string $note): void {
    if (trim($note) === '') {
      throw ValidationException::create()
        ->withError('note', __('Enter an order note.', 'mailpoet-premium'));
    }
  }

  private function validateNoteType(string $noteType): void {
    if (!in_array($noteType, [self::NOTE_TYPE_PRIVATE, self::NOTE_TYPE_CUSTOMER], true)) {
      throw ValidationException::create()
        ->withError('note_type', __('Select a valid note type.', 'mailpoet-premium'));
    }
  }
}
