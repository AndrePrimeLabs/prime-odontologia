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

/* emails/subscriberLimitThresholdNotification.txt */
class __TwigTemplate_0a0464bc24c6a5361dc783179cf979fb047f07bd9a3c1073790aa4402d2ffd3b extends Template
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
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Howdy,");
        yield "

";
        // line 3
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Your site currently has %1\$s subscribers out of a %2\$s subscriber limit."), ["%1\$s" =>         // line 4
($context["count"] ?? null), "%2\$s" => ($context["limit"] ?? null)]), "html", null, true);
        // line 5
        yield "

";
        // line 7
        if (($context["hasValidApiKey"] ?? null)) {
            // line 8
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("You have reached %s% of your MailPoet plan’s subscriber limit."), ["%s" =>             // line 9
($context["threshold"] ?? null)]), "html", null, true);
            // line 10
            yield "

";
            // line 12
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Upgrade your MailPoet plan to keep growing your audience: manage your MailPoet plan.");
            yield "
";
            // line 13
            yield ($context["link_upgrade"] ?? null);
            yield "
";
        } else {
            // line 15
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("You have reached %s% of the free version’s subscriber limit."), ["%s" =>             // line 16
($context["threshold"] ?? null)]), "html", null, true);
            // line 17
            yield "

";
            // line 19
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Upgrade to a MailPoet plan to keep growing your audience: view MailPoet plans.");
            yield "
";
            // line 20
            yield ($context["link_upgrade"] ?? null);
            yield "
";
        }
        // line 22
        yield "
";
        // line 23
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Cheers,");
        yield "
";
        // line 24
        yield $this->extensions['MailPoet\Twig\I18n']->translate("The MailPoet Plugin");
        yield "
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/subscriberLimitThresholdNotification.txt";
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
        return array (  91 => 24,  87 => 23,  84 => 22,  79 => 20,  75 => 19,  71 => 17,  69 => 16,  68 => 15,  63 => 13,  59 => 12,  55 => 10,  53 => 9,  52 => 8,  50 => 7,  46 => 5,  44 => 4,  43 => 3,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/subscriberLimitThresholdNotification.txt", "/home/circleci/mailpoet/mailpoet/views/emails/subscriberLimitThresholdNotification.txt");
    }
}
