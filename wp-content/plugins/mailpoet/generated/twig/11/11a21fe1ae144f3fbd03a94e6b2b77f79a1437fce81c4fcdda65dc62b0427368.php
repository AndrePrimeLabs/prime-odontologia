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

/* subscription/confirm_unsubscribe.html */
class __TwigTemplate_b2e90aa663ee76ef09938814932102214bf0368922c2c205f621d8de92729c0a extends Template
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
        yield "<form action=\"";
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["unsubscribeUrl"] ?? null), "html", null, true);
        yield "\" method=\"post\">
<!--  if updating this hidden field form value, remember to update the corresponding logic in mailpoet/lib/Router/Endpoints/Subscription.php::addTypeParamToUnsubscribeUrl -->
  <input type=\"hidden\" name=\"type\" value=\"confirmation\">
  ";
        // line 5
        if (($context["subscriberEmail"] ?? null)) {
            // line 6
            yield "    <p class=\"mailpoet_confirm_unsubscribe_email\">
      ";
            // line 7
            yield $this->extensions['MailPoet\Twig\I18n']->translate("You are about to unsubscribe this email address:", "mailpoet");
            yield "
      <br>
      <strong>";
            // line 9
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["subscriberEmail"] ?? null));
            yield "</strong>
    </p>
  ";
        }
        // line 12
        yield "  <p class=\"mailpoet_confirm_unsubscribe\">
    ";
        // line 13
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Simply click on this link to stop receiving emails from us.");
        yield "
    <br>
    <a href=\"#\" onclick=\"this.closest('form').submit(); return false;\" rel=\"nofollow\">";
        // line 15
        yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Yes, unsubscribe me", "Text in unsubscribe link");
        yield "</a>
</p>
</form>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "subscription/confirm_unsubscribe.html";
    }

    /**
     * @codeCoverageIgnore
     */
    public function getDebugInfo()
    {
        return array (  78 => 15,  73 => 13,  70 => 12,  64 => 9,  59 => 7,  56 => 6,  54 => 5,  47 => 2,  39 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "subscription/confirm_unsubscribe.html", "/home/circleci/mailpoet/mailpoet/views/subscription/confirm_unsubscribe.html");
    }
}
