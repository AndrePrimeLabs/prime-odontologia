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

/* subscribers/custom_fields.html */
class __TwigTemplate_da42454b8f529dd67656623f0f763c454a6d16d8f4457a7fb4876b121da471b1 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->blocks = [
            'content' => [$this, 'block_content'],
        ];
    }

    protected function doGetParent(array $context)
    {
        // line 1
        return "layout.html";
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        $this->parent = $this->loadTemplate("layout.html", "subscribers/custom_fields.html", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
    }

    // line 3
    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 4
        yield "<div id=\"mailpoet_custom_fields_container\"></div>

<script type=\"text/javascript\">
  var mailpoet_custom_fields_api = ";
        // line 7
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["api"] ?? null));
        yield ";
  var mailpoet_custom_fields_subscribers_listing_url = ";
        // line 8
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["subscribers_listing_url"] ?? null));
        yield ";
  var mailpoet_custom_fields_date_types = ";
        // line 9
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["date_types"] ?? null));
        yield ";
  var mailpoet_custom_fields_date_formats = ";
        // line 10
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["date_formats"] ?? null));
        yield ";
</script>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "subscribers/custom_fields.html";
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
        return array (  68 => 10,  64 => 9,  60 => 8,  56 => 7,  51 => 4,  47 => 3,  36 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "subscribers/custom_fields.html", "/home/circleci/mailpoet/mailpoet/views/subscribers/custom_fields.html");
    }
}
