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

/* subscription/unsubscribe_reason.html */
class __TwigTemplate_9d7d54bedf6441cbe953e9a6b449b96ffb6a0f20629323115059cbdd6822fcef extends Template
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
        yield "<form class=\"mailpoet-unsubscribe-reason\" action=\"";
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["actionUrl"] ?? null));
        yield "\" method=\"post\">
  <input type=\"hidden\" name=\"_wpnonce\" value=\"";
        // line 3
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["nonce"] ?? null), "html_attr");
        yield "\">
  <fieldset>
    <legend>";
        // line 5
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Please let us know why you unsubscribed:", "mailpoet");
        yield "</legend>
    ";
        // line 6
        $context['_parent'] = $context;
        $context['_seq'] = CoreExtension::ensureTraversable(($context["reasons"] ?? null));
        foreach ($context['_seq'] as $context["reason"] => $context["label"]) {
            // line 7
            yield "      <p>
        <label>
          <input type=\"radio\" name=\"reason\" value=\"";
            // line 9
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape($context["reason"], "html_attr");
            yield "\" required>
          ";
            // line 10
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape($context["label"]);
            yield "
        </label>
      </p>
      ";
            // line 13
            if ((($context["allowOtherText"] ?? null) && ($context["reason"] == ($context["otherReason"] ?? null)))) {
                // line 14
                yield "        <p class=\"mailpoet-unsubscribe-reason-text\" hidden>
          <label>
            ";
                // line 16
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Tell us more", "mailpoet");
                yield "<br>
            <textarea name=\"reason_text\" maxlength=\"500\" rows=\"4\"></textarea>
          </label>
        </p>
      ";
            }
            // line 21
            yield "    ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['reason'], $context['label'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 22
        yield "  </fieldset>
  <p>
    <button type=\"submit\">";
        // line 24
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Submit", "mailpoet");
        yield "</button>
  </p>
  ";
        // line 26
        if (($context["allowOtherText"] ?? null)) {
            // line 27
            yield "    <script>
      (function() {
        var form = document.currentScript.closest('form');
        if (!form) return;
        var textField = form.querySelector('.mailpoet-unsubscribe-reason-text');
        if (!textField) return;
        var update = function() {
          var selected = form.querySelector('input[name=\"reason\"]:checked');
          textField.hidden = !selected || selected.value !== '";
            // line 35
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape($this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["otherReason"] ?? null), "js"), "html", null, true);
            yield "';
        };
        form.addEventListener('change', update);
        update();
      }());
    </script>
  ";
        }
        // line 42
        yield "</form>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "subscription/unsubscribe_reason.html";
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo()
    {
        return array (  130 => 42,  120 => 35,  110 => 27,  108 => 26,  103 => 24,  99 => 22,  93 => 21,  85 => 16,  81 => 14,  79 => 13,  73 => 10,  69 => 9,  65 => 7,  61 => 6,  57 => 5,  52 => 3,  47 => 2,  39 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "subscription/unsubscribe_reason.html", "/home/circleci/mailpoet/mailpoet/views/subscription/unsubscribe_reason.html");
    }
}
