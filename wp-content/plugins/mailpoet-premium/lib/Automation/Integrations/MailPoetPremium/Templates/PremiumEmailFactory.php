<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Templates;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Integrations\MailPoet\Templates\EmailFactory;
use MailPoet\Premium\Config\Env;

class PremiumEmailFactory extends EmailFactory {
  // Set the premium templates directory, called here because Env::$libPath is not set in the constructor
  public function getTemplatesDirectory(): string {
    return $this->templatesDirectory
      ?: Env::$libPath . '/Automation/Integrations/MailPoetPremium/Templates/EmailTemplates';
  }
}
