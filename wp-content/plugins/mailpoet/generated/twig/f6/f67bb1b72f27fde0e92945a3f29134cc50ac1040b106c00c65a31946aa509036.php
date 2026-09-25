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

/* emails/statsNotification.txt */
class __TwigTemplate_73223e600e7d98691234a281f9573e6bebabbe006922fa4a10de4b25ee450391 extends Template
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
        return "emails/statsNotificationLayout.txt";
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        $this->parent = $this->loadTemplate("emails/statsNotificationLayout.txt", "emails/statsNotification.txt", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
    }

    // line 3
    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 4
        if ($this->extensions['MailPoet\Twig\Functions']->isGarden()) {
            // line 5
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["blogName"] ?? null), "html", null, true);
            yield "

";
            // line 7
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Your campaign stats");
            yield "

";
            // line 9
            if (($context["recipientFirstName"] ?? null)) {
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Hi %s,"), ["%s" => ($context["recipientFirstName"] ?? null)]), "html", null, true);
                yield "

";
            }
            // line 12
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Here's how your campaign \"%s\" performed in the first 24 hours."), ["%s" => ($context["subject"] ?? null)]), "html", null, true);
            yield "

";
            // line 14
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Clicked");
            yield ": ";
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["clicked"] ?? null));
            yield "% (";
            yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsTextGarden(($context["clicked"] ?? null));
            yield ")
";
            // line 15
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Opened");
            yield ": ";
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["opened"] ?? null));
            yield "%
";
            // line 16
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Machine-opened");
            yield ": ";
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["machineOpened"] ?? null));
            yield "%
";
            // line 17
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Unsubscribed");
            yield ": ";
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["unsubscribed"] ?? null));
            yield "%
";
            // line 18
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Bounced");
            yield ": ";
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["bounced"] ?? null));
            yield "%
";
            // line 19
            if ((($context["notTracked"] ?? null) > 0)) {
                // line 20
                if ((($context["trackedSent"] ?? null) > 0)) {
                    // line 21
                    yield "  ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("%1\$s of your recipients is not tracked, so open and click rates are based on the other %2\$s.", "%1\$s of your recipients are not tracked, so open and click rates are based on the other %2\$s.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null), "%2\$s" => ($context["trackedSent"] ?? null)]), "html", null, true);
                    yield "
";
                } else {
                    // line 23
                    yield "  ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("Your %1\$s recipient is not tracked, so open and click rates cannot be measured.", "None of your %1\$s recipients are tracked, so open and click rates cannot be measured.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null)]), "html", null, true);
                    yield "
";
                }
            }
            // line 26
            yield "
";
            // line 27
            yield $this->extensions['MailPoet\Twig\I18n']->translate("View full campaign report");
            yield "
  ";
            // line 28
            yield ($context["linkStats"] ?? null);
            yield "
";
        } else {
            // line 30
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Your stats are in!");
            yield "

";
            // line 32
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["subject"] ?? null), "html", null, true);
            yield "

";
            // line 34
            if (($context["subscribersLimitReached"] ?? null)) {
                // line 35
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Congratulations, you now have more than [subscribersLimit] subscribers!"), ["[subscribersLimit]" => ($context["subscribersLimit"] ?? null)]), "html", null, true);
                yield "

";
                // line 37
                if (($context["hasValidApiKey"] ?? null)) {
                    // line 38
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Your plan is limited to [subscribersLimit] subscribers."), ["[subscribersLimit]" => ($context["subscribersLimit"] ?? null)]), "html", null, true);
                    yield "
";
                } else {
                    // line 40
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Our free version is limited to [subscribersLimit] subscribers."), ["[subscribersLimit]" => ($context["subscribersLimit"] ?? null)]), "html", null, true);
                    yield "
";
                }
                // line 42
                yield $this->extensions['MailPoet\Twig\I18n']->translate("You need to upgrade now to be able to continue using MailPoet.");
                yield "

";
                // line 44
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Upgrade Now");
                yield "
  ";
                // line 45
                yield ($context["upgradeNowLink"] ?? null);
                yield "
";
            }
            // line 47
            yield "
";
            // line 48
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["clicked"] ?? null));
            yield "% ";
            yield $this->extensions['MailPoet\Twig\I18n']->translate("clicked");
            yield "
  ";
            // line 49
            yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsText(($context["clicked"] ?? null));
            yield "

";
            // line 51
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["opened"] ?? null));
            yield "% ";
            yield $this->extensions['MailPoet\Twig\I18n']->translate("opened");
            yield "

";
            // line 53
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["machineOpened"] ?? null));
            yield "% ";
            yield $this->extensions['MailPoet\Twig\I18n']->translate("machine-opened");
            yield "

";
            // line 55
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["unsubscribed"] ?? null));
            yield "% ";
            yield $this->extensions['MailPoet\Twig\I18n']->translate("unsubscribed");
            yield "

";
            // line 57
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["bounced"] ?? null));
            yield "% ";
            yield $this->extensions['MailPoet\Twig\I18n']->translate("bounced");
            yield "

";
            // line 59
            if ((($context["notTracked"] ?? null) > 0)) {
                // line 60
                if ((($context["trackedSent"] ?? null) > 0)) {
                    // line 61
                    yield "  ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("%1\$s of your recipients is not tracked, so open and click rates are based on the other %2\$s.", "%1\$s of your recipients are not tracked, so open and click rates are based on the other %2\$s.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null), "%2\$s" => ($context["trackedSent"] ?? null)]), "html", null, true);
                    yield "
";
                } else {
                    // line 63
                    yield "  ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("Your %1\$s recipient is not tracked, so open and click rates cannot be measured.", "None of your %1\$s recipients are tracked, so open and click rates cannot be measured.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null)]), "html", null, true);
                    yield "
";
                }
            }
            // line 66
            yield "
";
            // line 67
            if ((($context["topLinkClicks"] ?? null) > 0)) {
                // line 68
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Most clicked link");
                yield "
  ";
                // line 69
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["topLink"] ?? null), "html", null, true);
                yield "

  ";
                // line 71
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("%s unique clicks"), ["%s" => ($context["topLinkClicks"] ?? null)]), "html", null, true);
                yield "
";
            }
            // line 73
            yield "
";
            // line 74
            yield $this->extensions['MailPoet\Twig\I18n']->translate("View all stats");
            yield "
  ";
            // line 75
            yield ($context["linkStats"] ?? null);
            yield "
";
        }
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/statsNotification.txt";
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
        return array (  264 => 75,  260 => 74,  257 => 73,  252 => 71,  247 => 69,  243 => 68,  241 => 67,  238 => 66,  231 => 63,  225 => 61,  223 => 60,  221 => 59,  214 => 57,  207 => 55,  200 => 53,  193 => 51,  188 => 49,  182 => 48,  179 => 47,  174 => 45,  170 => 44,  165 => 42,  160 => 40,  155 => 38,  153 => 37,  148 => 35,  146 => 34,  141 => 32,  136 => 30,  131 => 28,  127 => 27,  124 => 26,  117 => 23,  111 => 21,  109 => 20,  107 => 19,  101 => 18,  95 => 17,  89 => 16,  83 => 15,  75 => 14,  70 => 12,  63 => 9,  58 => 7,  53 => 5,  51 => 4,  47 => 3,  36 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/statsNotification.txt", "/home/circleci/mailpoet/mailpoet/views/emails/statsNotification.txt");
    }
}
