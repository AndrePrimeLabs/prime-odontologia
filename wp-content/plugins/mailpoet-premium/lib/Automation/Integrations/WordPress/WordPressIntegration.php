<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\WordPress;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Integration;
use MailPoet\Automation\Engine\Registry;
use MailPoet\Premium\Automation\Integrations\WordPress\Actions\ChangeUserRoleAction;
use MailPoet\Premium\Automation\Integrations\WordPress\Triggers\MadeACommentTrigger;

class WordPressIntegration implements Integration {

  /** @var MadeACommentTrigger */
  private $madeACommentTrigger;

  /** @var ChangeUserRoleAction */
  private $changeUserRoleAction;

  public function __construct(
    MadeACommentTrigger $madeACommentTrigger,
    ChangeUserRoleAction $changeUserRoleAction
  ) {
    $this->madeACommentTrigger = $madeACommentTrigger;
    $this->changeUserRoleAction = $changeUserRoleAction;
  }

  public function register(Registry $registry): void {
    $registry->addTrigger($this->madeACommentTrigger);
    $registry->addAction($this->changeUserRoleAction);
  }
}
