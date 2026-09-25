<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Endpoints;

if (!defined('ABSPATH')) exit;


use MailPoet\API\REST\Request;
use MailPoet\API\REST\Response;
use MailPoet\Automation\Engine\API\Endpoint;
use MailPoet\Automation\Engine\Exceptions;
use MailPoet\Automation\Engine\Storage\AutomationRunStorage;
use MailPoet\Automation\Engine\Storage\AutomationStorage;
use MailPoet\Premium\Automation\Integrations\MailPoetPremium\Analytics\Controller\RunLogController;
use MailPoet\Validator\Builder;

class RunLogEndpoint extends Endpoint {
  private AutomationRunStorage $automationRunStorage;
  private AutomationStorage $automationStorage;
  private RunLogController $runLogController;

  public function __construct(
    AutomationRunStorage $automationRunStorage,
    AutomationStorage $automationStorage,
    RunLogController $runLogController
  ) {
    $this->automationRunStorage = $automationRunStorage;
    $this->automationStorage = $automationStorage;
    $this->runLogController = $runLogController;
  }

  public static function getRequestSchema(): array {
    return [
      'id' => Builder::integer()->required(),
    ];
  }

  public function handle(Request $request): Response {
    $runId = absint(is_numeric($request->getParam('id')) ? $request->getParam('id') : 0);
    $automationRun = $this->automationRunStorage->getAutomationRun($runId);
    if (!$automationRun) {
      throw Exceptions::automationRunNotFound($runId);
    }
    $automation = $this->automationStorage->getAutomation($automationRun->getAutomationId());
    if (!$automation) {
      throw Exceptions::automationNotFound($automationRun->getAutomationId());
    }
    $result = $this->runLogController->getAutomationRunData($automation, $automationRun);
    return new Response($result);
  }
}
