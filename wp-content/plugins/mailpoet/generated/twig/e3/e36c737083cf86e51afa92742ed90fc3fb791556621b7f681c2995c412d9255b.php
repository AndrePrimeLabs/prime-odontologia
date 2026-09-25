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

/* automation/flow-embed.html */
class __TwigTemplate_6998fa3c0bba90234eb4207a8c50b91844fccd5bd64cda59dc2cef5311482d38 extends Template
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
  <title>Automation Flow</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      font-size: 13px;
    }
    #mailpoet_automation_flow_embed {
      background: #fff;
      min-height: 100vh;
    }
    .flow-embed-error {
      padding: 20px;
      text-align: center;
      color: #cc1818;
    }
    /* Disable clickable links in embed mode */
    #mailpoet_automation_flow_embed a {
      pointer-events: none;
      cursor: default;
      text-decoration: none;
      color: inherit;
    }
    /* Hide step more menu in embed mode */
    .mailpoet-automation-step-more-menu {
      display: none;
    }
  </style>
  <script type=\"text/javascript\">
    // Global config needed by admin bundle
    var mailpoet_tracking_config = ";
        // line 37
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["tracking_config"] ?? null));
        yield ";
    // Premium-related variables needed for step type registration
    var mailpoet_has_valid_premium_key = ";
        // line 39
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["has_valid_premium_key"] ?? null));
        yield ";
    var mailpoet_subscribers_limit_reached = ";
        // line 40
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["subscribers_limit_reached"] ?? null));
        yield ";
    var mailpoet_premium_active = ";
        // line 41
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["premium_active"] ?? null));
        yield ";
    var mailpoet_capabilities = ";
        // line 42
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["capabilities"] ?? null));
        yield ";
    // WooCommerce-related variables needed for WooCommerce step types
    var mailpoet_woocommerce_active = ";
        // line 44
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["woocommerce_active"] ?? null));
        yield ";
    var mailpoet_woocommerce_subscriptions_active = ";
        // line 45
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["woocommerce_subscriptions_active"] ?? null));
        yield ";
    var mailpoet_woocommerce_bookings_active = ";
        // line 46
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["woocommerce_bookings_active"] ?? null));
        yield ";
    // Flow embed-specific variables
    var mailpoet_automation_id = ";
        // line 48
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["automation_id"] ?? null));
        yield ";
    var mailpoet_automation_api = ";
        // line 49
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["api"] ?? null));
        yield ";
    var mailpoet_automation_registry = ";
        // line 50
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["registry"] ?? null));
        yield ";
    var mailpoet_automation_context = ";
        // line 51
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["context"] ?? null));
        yield ";
    var mailpoet_automation = ";
        // line 52
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["automation"] ?? null));
        yield ";
    var mailpoet_woocommerce_store_config = ";
        // line 53
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["woocommerce_store_config"] ?? null));
        yield ";
  </script>
  ";
        // line 55
        yield ($context["head_content"] ?? null);
        yield "
</head>
<body>
  <div id=\"mailpoet_automation_flow_embed\"></div>
  ";
        // line 59
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
        return "automation/flow-embed.html";
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
        return array (  146 => 59,  139 => 55,  134 => 53,  130 => 52,  126 => 51,  122 => 50,  118 => 49,  114 => 48,  109 => 46,  105 => 45,  101 => 44,  96 => 42,  92 => 41,  88 => 40,  84 => 39,  79 => 37,  41 => 2,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "automation/flow-embed.html", "/home/circleci/mailpoet/mailpoet/views/automation/flow-embed.html");
    }
}
