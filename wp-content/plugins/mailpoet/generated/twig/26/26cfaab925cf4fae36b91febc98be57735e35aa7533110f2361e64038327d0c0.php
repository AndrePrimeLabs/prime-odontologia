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

/* segments/static.html */
class __TwigTemplate_0caa1806b4e6bad50c4bb59fbbdec799771fc97376dbc0dd12d0fe0df7e756ad extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->blocks = [
            'content' => [$this, 'block_content'],
            'after_translations' => [$this, 'block_after_translations'],
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
        $this->parent = $this->loadTemplate("layout.html", "segments/static.html", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
    }

    // line 3
    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 4
        yield "  <div id=\"static_segments_container\"></div>

  <script type=\"text/javascript\">
    var mailpoet_listing_per_page = ";
        // line 7
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["items_per_page"] ?? null), "html", null, true);
        yield ";
    var mailpoet_segments_api = ";
        // line 8
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["api"] ?? null));
        yield ";
    var mailpoet_confirmation_emails = ";
        // line 9
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["confirmation_emails"] ?? null));
        yield ";
    var mailpoet_default_confirmation_email_id = ";
        // line 10
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["default_confirmation_email_id"] ?? null), "html", null, true);
        yield ";
    var mailpoet_pages = ";
        // line 11
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode(($context["pages"] ?? null));
        yield ";
  </script>

  ";
        // line 14
        yield from         $this->loadTemplate("segments/translations.html", "segments/static.html", 14)->unwrap()->yield($context);
        return; yield '';
    }

    // line 18
    public function block_after_translations($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 19
        yield "  ";
        yield do_action("mailpoet_segments_translations_after");
        yield "
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "segments/static.html";
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
        return array (  88 => 19,  84 => 18,  79 => 14,  73 => 11,  69 => 10,  65 => 9,  61 => 8,  57 => 7,  52 => 4,  48 => 3,  37 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "segments/static.html", "/home/circleci/mailpoet/mailpoet/views/segments/static.html");
    }
}
