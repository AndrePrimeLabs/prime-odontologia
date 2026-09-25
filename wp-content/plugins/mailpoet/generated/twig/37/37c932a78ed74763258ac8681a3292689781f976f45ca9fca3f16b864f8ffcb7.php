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

/* subscription/manage_subscription.html */
class __TwigTemplate_8af1b0123e44e0dbc01ef4376ab3d01514a0306b6a607ad264d10a53f473fb22 extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
            'content' => [$this, 'block_content'],
        ];
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 1
        yield from $this->unwrap()->yieldBlock('content', $context, $blocks);
        return; yield '';
    }

    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 2
        yield "<form class=\"mailpoet-manage-subscription";
        if (($context["isModernStyle"] ?? null)) {
            yield " mailpoet-manage-subscription--modern";
        }
        if ((($context["isModernStyle"] ?? null) && ($context["isGloballyUnsubscribed"] ?? null))) {
            yield " mailpoet-manage-subscription--global-unsubscribed";
        }
        yield "\" method=\"post\" action=\"";
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["actionUrl"] ?? null));
        yield "\" novalidate>
  <input type=\"hidden\" name=\"action\" value=\"mailpoet_subscription_update\" />
  <input type=\"hidden\" name=\"data[segments]\" value=\"\" />
  <input type=\"hidden\" name=\"mailpoet_redirect\" value=\"";
        // line 5
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["redirectUrl"] ?? null));
        yield "\"/>
  <input type=\"hidden\" name=\"data[email]\" value=\"";
        // line 6
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["email"] ?? null));
        yield "\" />
  <input type=\"hidden\" name=\"token\" value=\"";
        // line 7
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["token"] ?? null), "html", null, true);
        yield "\" />
  ";
        // line 8
        if (($context["isModernStyle"] ?? null)) {
            // line 9
            yield "  ";
            if ((($context["formState"] ?? null) == "success")) {
                // line 10
                yield "  <p class=\"mailpoet-submit-success\" role=\"status\" aria-live=\"polite\">
    ";
                // line 11
                yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Your subscription settings have been saved.", "success message after saving subscription settings");
                yield "
  </p>
  ";
            } elseif ((            // line 13
($context["formState"] ?? null) == "error")) {
                // line 14
                yield "  <p class=\"mailpoet-submit-error\" role=\"alert\" aria-live=\"assertive\" tabindex=\"-1\">
    ";
                // line 15
                yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("We could not save your subscription settings. Please review the form and try again.", "error message after failing to save subscription settings");
                yield "
  </p>
  ";
            }
            // line 18
            yield "  <section class=\"mailpoet-manage-subscription-section mailpoet-manage-subscription-settings\">
    <h2>";
            // line 19
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Your email settings", "mailpoet");
            yield "</h2>
    <p class=\"mailpoet-manage-subscription-section-description\">
      ";
            // line 21
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Review your email address and choose whether you can receive emails from this site.", "mailpoet");
            yield "
    </p>
    <p class=\"mailpoet_paragraph mailpoet-manage-subscription-email\">
      <span class=\"mailpoet_text_label\">";
            // line 24
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Email address", "mailpoet");
            yield "</span>
      <strong>";
            // line 25
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["email"] ?? null));
            yield "</strong>
      <span class=\"mailpoet-change-email-info\">
        ";
            // line 27
            $context["allowedHtml"] = ["a" => ["href" => [], "target" => [], "rel" => []]];
            // line 28
            yield "        ";
            yield $this->extensions['MailPoet\Twig\Filters']->wpKses(($context["editEmailInfo"] ?? null), ($context["allowedHtml"] ?? null));
            yield "
      </span>
    </p>
    ";
            // line 31
            yield ($context["identityFieldsHtml"] ?? null);
            yield "
    ";
            // line 32
            if ( !($context["hasVisibleLists"] ?? null)) {
                // line 33
                yield "    <p class=\"mailpoet-manage-subscription-no-lists\">
      ";
                // line 34
                yield $this->extensions['MailPoet\Twig\I18n']->translate("There are no individual list preferences to manage for this email address.", "mailpoet");
                yield "
    </p>
    ";
            }
            // line 37
            yield "    ";
            yield ($context["additionalIdentityFieldsHtml"] ?? null);
            yield "
  </section>
  ";
            // line 39
            yield ($context["listFieldsHtml"] ?? null);
            yield "
  <div class=\"mailpoet-manage-subscription-actions\">
    ";
            // line 41
            yield ($context["submitHtml"] ?? null);
            yield "
  </div>
  ";
        } else {
            // line 44
            yield "  <p class=\"mailpoet_paragraph\">
    <label> ";
            // line 45
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Email", "mailpoet");
            yield "<br /><strong>";
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["email"] ?? null));
            yield "</strong></label>
    <br />
    <span class=\"mailpoet-change-email-info\">
      ";
            // line 48
            $context["allowedHtml"] = ["a" => ["href" => [], "target" => [], "rel" => []]];
            // line 49
            yield "      ";
            yield $this->extensions['MailPoet\Twig\Filters']->wpKses(($context["editEmailInfo"] ?? null), ($context["allowedHtml"] ?? null));
            yield "
    </span>
  </p>
  ";
            // line 52
            yield ($context["formHtml"] ?? null);
            yield "
  ";
            // line 53
            if ((($context["formState"] ?? null) == "success")) {
                // line 54
                yield "  <p class=\"mailpoet-submit-success\">
    ";
                // line 55
                yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Your preferences have been saved.", "success message after saving subscription settings");
                yield "
  </p>
  ";
            } elseif ((            // line 57
($context["formState"] ?? null) == "error")) {
                // line 58
                yield "  <p class=\"mailpoet-submit-error\" role=\"alert\" aria-live=\"assertive\" tabindex=\"-1\">
    ";
                // line 59
                yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("We could not save your subscription settings. Please review the form and try again.", "error message after failing to save subscription settings");
                yield "
  </p>
  ";
            }
            // line 62
            yield "  ";
        }
        // line 63
        yield "</form>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "subscription/manage_subscription.html";
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo()
    {
        return array (  209 => 63,  206 => 62,  200 => 59,  197 => 58,  195 => 57,  190 => 55,  187 => 54,  185 => 53,  181 => 52,  174 => 49,  172 => 48,  164 => 45,  161 => 44,  155 => 41,  150 => 39,  144 => 37,  138 => 34,  135 => 33,  133 => 32,  129 => 31,  122 => 28,  120 => 27,  115 => 25,  111 => 24,  105 => 21,  100 => 19,  97 => 18,  91 => 15,  88 => 14,  86 => 13,  81 => 11,  78 => 10,  75 => 9,  73 => 8,  69 => 7,  65 => 6,  61 => 5,  47 => 2,  39 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "subscription/manage_subscription.html", "/home/circleci/mailpoet/mailpoet/views/subscription/manage_subscription.html");
    }
}
