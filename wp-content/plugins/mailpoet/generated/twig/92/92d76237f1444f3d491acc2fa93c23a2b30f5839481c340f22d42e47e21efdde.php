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

/* form/front_end_form.html */
class __TwigTemplate_53b89d2127c3e3553aef87a0684de61c60938709506258cd8a7cd55ed9684156 extends Template
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
        yield "  ";
        if (($context["before_widget"] ?? null)) {
            // line 3
            yield "    ";
            yield ($context["before_widget"] ?? null);
            yield "
  ";
        }
        // line 5
        yield "
  ";
        // line 6
        if (($context["title"] ?? null)) {
            // line 7
            yield "    ";
            yield ($context["before_title"] ?? null);
            yield ($context["title"] ?? null);
            yield ($context["after_title"] ?? null);
            yield "
  ";
        }
        // line 9
        yield "
  <div class=\"
    mailpoet_form_popup_overlay
    ";
        // line 12
        if ((($context["animation"] ?? null) != "")) {
            // line 13
            yield "      mailpoet_form_overlay_animation_";
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["animation"] ?? null), "html", null, true);
            yield "
      mailpoet_form_overlay_animation
    ";
        }
        // line 16
        yield "  \"></div>
  <div
    id=\"";
        // line 18
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["form_html_id"] ?? null), "html", null, true);
        yield "\"
    class=\"
      mailpoet_form
      mailpoet_form_";
        // line 21
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["form_type"] ?? null), "html", null, true);
        yield "
      mailpoet_form_position_";
        // line 22
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["position"] ?? null), "html", null, true);
        yield "
      mailpoet_form_animation_";
        // line 23
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["animation"] ?? null), "html", null, true);
        yield "
    \"
    ";
        // line 25
        if (($context["is_preview"] ?? null)) {
            // line 26
            yield "      data-is-preview=\"1\"
      data-editor-url=\"";
            // line 27
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["editor_url"] ?? null), "html", null, true);
            yield "\"
    ";
        }
        // line 29
        yield "  >

    <style type=\"text/css\">
     ";
        // line 32
        yield ($context["styles"] ?? null);
        yield "
    </style>

    <form
      target=\"_self\"
      method=\"post\"
      action=\"";
        // line 38
        yield admin_url("admin-post.php?action=mailpoet_subscription_form");
        yield "\"
      class=\"mailpoet_form mailpoet_form_form mailpoet_form_";
        // line 39
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["form_type"] ?? null), "html", null, true);
        yield "\"
      novalidate
      data-delay=\"";
        // line 41
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["delay"] ?? null), "html", null, true);
        yield "\"
      data-exit-intent-enabled=\"";
        // line 42
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["enableExitIntent"] ?? null), "html", null, true);
        yield "\"
      data-trigger-mode=\"";
        // line 43
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["triggerMode"] ?? null), "html", null, true);
        yield "\"
      data-click-trigger-selector=\"";
        // line 44
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["clickTriggerSelector"] ?? null), "html", null, true);
        yield "\"
      data-font-family=\"";
        // line 45
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["fontFamily"] ?? null), "html", null, true);
        yield "\"
      data-cookie-expiration-time=\"";
        // line 46
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["cookieFormExpirationTime"] ?? null), "html", null, true);
        yield "\"
    >
      <input type=\"hidden\" name=\"data[form_id]\" value=\"";
        // line 48
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["form_id"] ?? null), "html", null, true);
        yield "\" />
      <input type=\"hidden\" name=\"token\" value=\"";
        // line 49
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["token"] ?? null), "html", null, true);
        yield "\" />
      <input type=\"hidden\" name=\"api_version\" value=\"";
        // line 50
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["api_version"] ?? null), "html", null, true);
        yield "\" />
      <input type=\"hidden\" name=\"endpoint\" value=\"subscribers\" />
      <input type=\"hidden\" name=\"mailpoet_method\" value=\"subscribe\" />

      ";
        // line 54
        yield ($context["html"] ?? null);
        yield "
      <div class=\"mailpoet_message\">
        <p class=\"mailpoet_validate_success\"
        ";
        // line 57
        if ( !($context["success"] ?? null)) {
            // line 58
            yield "        style=\"display:none;\"
        ";
        }
        // line 60
        yield "        >";
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["form_success_message"] ?? null), "html", null, true);
        yield "
        </p>
        <p class=\"mailpoet_validate_error\"
        ";
        // line 63
        if ( !($context["error"] ?? null)) {
            // line 64
            yield "        style=\"display:none;\"
        ";
        }
        // line 66
        yield "        >";
        if (($context["error"] ?? null)) {
            // line 67
            yield "        ";
            yield $this->extensions['MailPoet\Twig\I18n']->translate("An error occurred, make sure you have filled all the required fields.");
            yield "
        ";
        }
        // line 69
        yield "        </p>
      </div>
    </form>

    ";
        // line 73
        if ((((($context["form_type"] ?? null) == "popup") || (($context["form_type"] ?? null) == "fixed_bar")) || (($context["form_type"] ?? null) == "slide_in"))) {
            // line 74
            yield "      <input type=\"image\"
        class=\"mailpoet_form_close_icon\"
        alt=\"";
            // line 76
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Close");
            yield "\"
        src='";
            // line 77
            yield $this->extensions['MailPoet\Twig\Assets']->generateImageUrl((("form_close_icon/" . ($context["close_button_icon"] ?? null)) . ".svg"));
            yield "'
      />
    ";
        }
        // line 80
        yield "  </div>

  ";
        // line 82
        if (($context["after_widget"] ?? null)) {
            // line 83
            yield "    ";
            yield ($context["after_widget"] ?? null);
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
        return "form/front_end_form.html";
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo()
    {
        return array (  241 => 83,  239 => 82,  235 => 80,  229 => 77,  225 => 76,  221 => 74,  219 => 73,  213 => 69,  207 => 67,  204 => 66,  200 => 64,  198 => 63,  191 => 60,  187 => 58,  185 => 57,  179 => 54,  172 => 50,  168 => 49,  164 => 48,  159 => 46,  155 => 45,  151 => 44,  147 => 43,  143 => 42,  139 => 41,  134 => 39,  130 => 38,  121 => 32,  116 => 29,  111 => 27,  108 => 26,  106 => 25,  101 => 23,  97 => 22,  93 => 21,  87 => 18,  83 => 16,  76 => 13,  74 => 12,  69 => 9,  61 => 7,  59 => 6,  56 => 5,  50 => 3,  47 => 2,  39 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "form/front_end_form.html", "/home/circleci/mailpoet/mailpoet/views/form/front_end_form.html");
    }
}
