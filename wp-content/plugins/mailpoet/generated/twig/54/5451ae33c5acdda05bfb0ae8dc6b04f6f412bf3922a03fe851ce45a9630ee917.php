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

/* emails/newSubscriberNotification.html */
class __TwigTemplate_1a503b1b477150cebe094ddd70d8a9f0f9df76c4d7e651ce72ce81dad2c9bd66 extends Template
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
        yield "<p>";
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Howdy,");
        yield "

<p>";
        // line 3
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("The subscriber %1\$s has just subscribed to your list %2\$s!"), ["%1\$s" =>         // line 4
($context["subscriber_email"] ?? null), "%2\$s" => ($context["segments_names"] ?? null)]), "html", null, true);
        // line 5
        yield "

<p>";
        // line 7
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Cheers,");
        yield "

";
        // line 9
        if ($this->extensions['MailPoet\Twig\Functions']->isGarden()) {
            // line 10
            yield "<p>";
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(get_option("blogname"), "html");
            yield "
";
        } else {
            // line 12
            yield "<p>";
            yield $this->extensions['MailPoet\Twig\I18n']->translate("The MailPoet Plugin");
            yield "
";
        }
        // line 14
        yield "
";
        // line 15
        if ($this->extensions['MailPoet\Twig\Functions']->isGarden()) {
            // line 16
            yield "<p><small>";
            yield $this->extensions['MailPoet\Twig\I18n']->translate(MailPoet\Util\Helpers::replaceLinkTags("You can disable these emails in your [link]email settings.[/link]",             // line 17
($context["link_settings"] ?? null)));
            // line 18
            yield "</small>
";
        } else {
            // line 20
            yield "<p><small>";
            yield $this->extensions['MailPoet\Twig\I18n']->translate(MailPoet\Util\Helpers::replaceLinkTags("You can disable these emails in your [link]MailPoet Settings.[/link]",             // line 21
($context["link_settings"] ?? null)));
            // line 22
            yield "</small>
";
        }
        // line 24
        yield "
";
        // line 25
        if (($this->extensions['MailPoetVendor\Twig\Extension\CoreExtension']->formatDate("now", "Y-m-d") < $this->extensions['MailPoetVendor\Twig\Extension\CoreExtension']->formatDate("2018-11-30", "Y-m-d"))) {
            // line 26
            yield "  <p>
    <small>
      ";
            // line 28
            yield $this->extensions['MailPoet\Twig\I18n']->translate(MailPoet\Util\Helpers::replaceLinkTags("PS. MailPoet annual plans are nearly half price for a limited time.
      [link]Find out more in the Premium page in your admin.[/link]",             // line 30
($context["link_premium"] ?? null)));
            // line 31
            yield "
  </small>
";
        }
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/newSubscriberNotification.html";
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
        return array (  104 => 31,  102 => 30,  100 => 28,  96 => 26,  94 => 25,  91 => 24,  87 => 22,  85 => 21,  83 => 20,  79 => 18,  77 => 17,  75 => 16,  73 => 15,  70 => 14,  64 => 12,  58 => 10,  56 => 9,  51 => 7,  47 => 5,  45 => 4,  44 => 3,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/newSubscriberNotification.html", "/home/circleci/mailpoet/mailpoet/views/emails/newSubscriberNotification.html");
    }
}
