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

/* emails/statsNotificationAutomatedEmails.txt */
class __TwigTemplate_cbe6b7731003366ad97ca691fe5f4c1bccaf16b35087954ed358e9e446555e6f extends Template
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
        $this->parent = $this->loadTemplate("emails/statsNotificationLayout.txt", "emails/statsNotificationAutomatedEmails.txt", 1);
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
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Your monthly automation stats");
            yield "

";
            // line 9
            if (($context["recipientFirstName"] ?? null)) {
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Hi %s,"), ["%s" => ($context["recipientFirstName"] ?? null)]), "html", null, true);
                yield "

";
            }
            // line 12
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Here's a summary of how your active automations performed this month.");
            yield "

";
            // line 14
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(($context["newsletters"] ?? null));
            foreach ($context['_seq'] as $context["_key"] => $context["newsletter"]) {
                // line 15
                yield "------------------------------------------
";
                // line 16
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "subject", [], "any", false, false, false, 16), "html", null, true);
                yield "

";
                // line 18
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Clicked");
                yield ": ";
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "clicked", [], "any", false, false, false, 18));
                yield "% (";
                yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsTextGarden(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "clicked", [], "any", false, false, false, 18));
                yield ")
";
                // line 19
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Opened");
                yield ": ";
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "opened", [], "any", false, false, false, 19));
                yield "%
";
                // line 20
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Machine-opened");
                yield ": ";
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "machineOpened", [], "any", false, false, false, 20));
                yield "%
";
                // line 21
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Unsubscribed");
                yield ": ";
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "unsubscribed", [], "any", false, false, false, 21));
                yield "%
";
                // line 22
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Bounced");
                yield ": ";
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "bounced", [], "any", false, false, false, 22));
                yield "%
";
                // line 23
                if ((CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 23) > 0)) {
                    // line 24
                    if ((CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "trackedSent", [], "any", false, false, false, 24) > 0)) {
                        // line 25
                        yield "  ";
                        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("%1\$s of your recipients is not tracked, so open and click rates are based on the other %2\$s.", "%1\$s of your recipients are not tracked, so open and click rates are based on the other %2\$s.", CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 25)), ["%1\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 25), "%2\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "trackedSent", [], "any", false, false, false, 25)]), "html", null, true);
                        yield "
";
                    } else {
                        // line 27
                        yield "  ";
                        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("Your %1\$s recipient is not tracked, so open and click rates cannot be measured.", "None of your %1\$s recipients are tracked, so open and click rates cannot be measured.", CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 27)), ["%1\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 27)]), "html", null, true);
                        yield "
";
                    }
                }
                // line 30
                yield "
";
                // line 31
                yield $this->extensions['MailPoet\Twig\I18n']->translate("View automation report");
                yield "
  ";
                // line 32
                yield CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "linkStats", [], "any", false, false, false, 32);
                yield "
";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['newsletter'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 34
            yield "------------------------------------------
";
        } else {
            // line 36
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Your monthly stats are in!");
            yield "

";
            // line 38
            $context['_parent'] = $context;
            $context['_seq'] = CoreExtension::ensureTraversable(($context["newsletters"] ?? null));
            foreach ($context['_seq'] as $context["_key"] => $context["newsletter"]) {
                // line 39
                yield "------------------------------------------
  ";
                // line 40
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "subject", [], "any", false, false, false, 40), "html", null, true);
                yield "
  ";
                // line 41
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "clicked", [], "any", false, false, false, 41));
                yield "% ";
                yield $this->extensions['MailPoet\Twig\I18n']->translate("clicked");
                yield " (";
                yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsText(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "clicked", [], "any", false, false, false, 41));
                yield ")
  ";
                // line 42
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "opened", [], "any", false, false, false, 42));
                yield "% ";
                yield $this->extensions['MailPoet\Twig\I18n']->translate("opened");
                yield "
  ";
                // line 43
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "machineOpened", [], "any", false, false, false, 43));
                yield "% ";
                yield $this->extensions['MailPoet\Twig\I18n']->translate("machine-opened");
                yield "
  ";
                // line 44
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "unsubscribed", [], "any", false, false, false, 44));
                yield "% ";
                yield $this->extensions['MailPoet\Twig\I18n']->translate("unsubscribed");
                yield "
  ";
                // line 45
                yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "bounced", [], "any", false, false, false, 45));
                yield "% ";
                yield $this->extensions['MailPoet\Twig\I18n']->translate("bounced");
                yield "
";
                // line 46
                if ((CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 46) > 0)) {
                    // line 47
                    yield "  ";
                    if ((CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "trackedSent", [], "any", false, false, false, 47) > 0)) {
                        // line 48
                        yield "    ";
                        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("%1\$s of your recipients is not tracked, so open and click rates are based on the other %2\$s.", "%1\$s of your recipients are not tracked, so open and click rates are based on the other %2\$s.", CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 48)), ["%1\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 48), "%2\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "trackedSent", [], "any", false, false, false, 48)]), "html", null, true);
                        yield "
  ";
                    } else {
                        // line 50
                        yield "    ";
                        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("Your %1\$s recipient is not tracked, so open and click rates cannot be measured.", "None of your %1\$s recipients are tracked, so open and click rates cannot be measured.", CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 50)), ["%1\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 50)]), "html", null, true);
                        yield "
  ";
                    }
                }
                // line 53
                yield "  ";
                yield $this->extensions['MailPoet\Twig\I18n']->translate("View all stats");
                yield "
    ";
                // line 54
                yield CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "linkStats", [], "any", false, false, false, 54);
                yield "
";
            }
            $_parent = $context['_parent'];
            unset($context['_seq'], $context['_iterated'], $context['_key'], $context['newsletter'], $context['_parent'], $context['loop']);
            $context = array_intersect_key($context, $_parent) + $_parent;
            // line 56
            yield "------------------------------------------
";
        }
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/statsNotificationAutomatedEmails.txt";
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
        return array (  234 => 56,  226 => 54,  221 => 53,  214 => 50,  208 => 48,  205 => 47,  203 => 46,  197 => 45,  191 => 44,  185 => 43,  179 => 42,  171 => 41,  167 => 40,  164 => 39,  160 => 38,  155 => 36,  151 => 34,  143 => 32,  139 => 31,  136 => 30,  129 => 27,  123 => 25,  121 => 24,  119 => 23,  113 => 22,  107 => 21,  101 => 20,  95 => 19,  87 => 18,  82 => 16,  79 => 15,  75 => 14,  70 => 12,  63 => 9,  58 => 7,  53 => 5,  51 => 4,  47 => 3,  36 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/statsNotificationAutomatedEmails.txt", "/home/circleci/mailpoet/mailpoet/views/emails/statsNotificationAutomatedEmails.txt");
    }
}
