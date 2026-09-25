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

/* emails/subscriberLimitThresholdNotification.html */
class __TwigTemplate_c033fba0b7cbf706f8bf8b2c6a274eeaad1e8f18e136694adafd658b11ce3260 extends Template
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
        yield "</p>

<p>";
        // line 3
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Your site currently has %1\$s subscribers out of a %2\$s subscriber limit."), ["%1\$s" =>         // line 4
($context["count"] ?? null), "%2\$s" => ($context["limit"] ?? null)]), "html", null, true);
        // line 5
        yield "</p>

";
        // line 7
        if (($context["hasValidApiKey"] ?? null)) {
            // line 8
            yield "<p>";
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("You have reached %s% of your MailPoet plan’s subscriber limit."), ["%s" =>             // line 9
($context["threshold"] ?? null)]), "html", null, true);
            // line 10
            yield "</p>

<p>";
            // line 12
            yield $this->extensions['MailPoet\Twig\I18n']->translate(MailPoet\Util\Helpers::replaceLinkTags("Upgrade your MailPoet plan to keep growing your audience: [link]manage your MailPoet plan[/link].",             // line 13
($context["link_upgrade"] ?? null)));
            // line 15
            yield "</p>
";
        } else {
            // line 17
            yield "<p>";
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("You have reached %s% of the free version’s subscriber limit."), ["%s" =>             // line 18
($context["threshold"] ?? null)]), "html", null, true);
            // line 19
            yield "</p>

<p>";
            // line 21
            yield $this->extensions['MailPoet\Twig\I18n']->translate(MailPoet\Util\Helpers::replaceLinkTags("Upgrade to a MailPoet plan to keep growing your audience: [link]view MailPoet plans[/link].",             // line 22
($context["link_upgrade"] ?? null)));
            // line 24
            yield "</p>
";
        }
        // line 26
        yield "
<p>";
        // line 27
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Cheers,");
        yield "</p>
<p>";
        // line 28
        yield $this->extensions['MailPoet\Twig\I18n']->translate("The MailPoet Plugin");
        yield "</p>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/subscriberLimitThresholdNotification.html";
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
        return array (  90 => 28,  86 => 27,  83 => 26,  79 => 24,  77 => 22,  76 => 21,  72 => 19,  70 => 18,  68 => 17,  64 => 15,  62 => 13,  61 => 12,  57 => 10,  55 => 9,  53 => 8,  51 => 7,  47 => 5,  45 => 4,  44 => 3,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/subscriberLimitThresholdNotification.html", "/home/circleci/mailpoet/mailpoet/views/emails/subscriberLimitThresholdNotification.html");
    }
}
