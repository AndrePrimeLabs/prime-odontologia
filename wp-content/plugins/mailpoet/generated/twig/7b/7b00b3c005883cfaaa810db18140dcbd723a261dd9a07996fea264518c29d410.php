<?php

if (!defined('ABSPATH')) exit;


use MailPoetVendor\Twig\Environment;
use MailPoetVendor\Twig\Error\LoaderError;
use MailPoetVendor\Twig\Error\RuntimeError;
use MailPoetVendor\Twig\Extension\CoreExtension;
use MailPoetVendor\Twig\Extension\SandboxExtension;
use MailPoetVendor\Twig\Markup;
use MailPoetVendor\Twig\Sandbox\SecurityError;
use MailPoetVendor\Twig\Sandbox\SecurityNotAllowedTagError;
use MailPoetVendor\Twig\Sandbox\SecurityNotAllowedFilterError;
use MailPoetVendor\Twig\Sandbox\SecurityNotAllowedFunctionError;
use MailPoetVendor\Twig\Source;
use MailPoetVendor\Twig\Template;

/* automation/preview-embed.html */
class __TwigTemplate_c3a9d4112b913723fcd7e6cca0c582249cb37e80a8c8ea4fa446ee3bf23cb352 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 1
        yield "<!DOCTYPE html>
<html lang=\"";
        // line 2
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["locale"] ?? null), "html", null, true);
        yield "\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>Automation Preview</title>
  <style>
    html, body {
      margin: 20px;
      padding: 0;
      background: #fbfbfb;
      font-size: 12px;
    }
    #mailpoet_automation_preview {
      zoom: 0.7;
      background: #fbfbfb;
      text-align: center;
    }
  </style>
  <script type=\"text/javascript\">
    // Global config needed by admin bundle
    var mailpoet_tracking_config = ";
        // line 22
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["tracking_config"] ?? null));
        yield ";
    // Premium-related variables needed for step type registration
    var mailpoet_has_valid_premium_key = ";
        // line 24
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["has_valid_premium_key"] ?? null));
        yield ";
    var mailpoet_subscribers_limit_reached = ";
        // line 25
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["subscribers_limit_reached"] ?? null));
        yield ";
    var mailpoet_premium_active = ";
        // line 26
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["premium_active"] ?? null));
        yield ";
    var mailpoet_capabilities = ";
        // line 27
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["capabilities"] ?? null));
        yield ";
    // WooCommerce-related variables needed for WooCommerce step types
    var mailpoet_woocommerce_active = ";
        // line 29
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["woocommerce_active"] ?? null));
        yield ";
    var mailpoet_woocommerce_subscriptions_active = ";
        // line 30
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["woocommerce_subscriptions_active"] ?? null));
        yield ";
    var mailpoet_woocommerce_bookings_active = ";
        // line 31
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["woocommerce_bookings_active"] ?? null));
        yield ";
    // Preview-specific variables
    var mailpoet_template_slug = ";
        // line 33
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["template_slug"] ?? null));
        yield ";
    var mailpoet_automation_api = ";
        // line 34
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["api"] ?? null));
        yield ";
    var mailpoet_automation_registry = ";
        // line 35
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["registry"] ?? null));
        yield ";
    var mailpoet_automation_context = ";
        // line 36
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["context"] ?? null));
        yield ";
  </script>
  ";
        // line 38
        yield ($context["head_content"] ?? null);
        yield "
</head>
<body>
  <div id=\"mailpoet_automation_preview\"></div>
  ";
        // line 42
        yield ($context["footer_content"] ?? null);
        yield "
</body>
</html>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "automation/preview-embed.html";
    }

    /**
     * @codeCoverageIgnore
     */
    public function isTraitable()
    {
        return false;
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo()
    {
        return array (  123 => 42,  116 => 38,  111 => 36,  107 => 35,  103 => 34,  99 => 33,  94 => 31,  90 => 30,  86 => 29,  81 => 27,  77 => 26,  73 => 25,  69 => 24,  64 => 22,  41 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "automation/preview-embed.html", "/home/circleci/mailpoet/mailpoet/views/automation/preview-embed.html");
    }
}
