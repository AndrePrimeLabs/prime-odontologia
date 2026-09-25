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

/* parsley-translations.html */
class __TwigTemplate_c57fdfc1a59b00dc7129161c18976ad5ba36cdd436a8430e0c1963def69c2803 extends Template
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
        yield "
";
        // line 9
        yield "Parsley.addMessages('mailpoet', {
  defaultMessage: ";
        // line 10
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value seems to be invalid."));
        yield ",
  type: {
    email: ";
        // line 12
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be a valid email."));
        yield ",
    url: ";
        // line 13
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be a valid url."));
        yield ",
    number: ";
        // line 14
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be a valid number."));
        yield ",
    integer: ";
        // line 15
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be a valid integer."));
        yield ",
    digits: ";
        // line 16
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be digits."));
        yield ",
    alphanum: ";
        // line 17
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be alphanumeric."));
        yield "
  },
  notblank: ";
        // line 19
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should not be blank."));
        yield ",
  required: ";
        // line 20
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value is required."));
        yield ",
  pattern: ";
        // line 21
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value seems to be invalid."));
        yield ",
  min: ";
        // line 22
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be greater than or equal to %s."));
        yield ",
  max: ";
        // line 23
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be lower than or equal to %s."));
        yield ",
  range: ";
        // line 24
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be between %s and %s."));
        yield ",
  minlength: ";
        // line 25
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value is too short. It should have %s characters or more."));
        yield ",
  maxlength: ";
        // line 26
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value is too long. It should have %s characters or fewer."));
        yield ",
  length: ";
        // line 27
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value length is invalid. It should be between %s and %s characters long."));
        yield ",
  mincheck: ";
        // line 28
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("You must select at least %s choices."));
        yield ",
  maxcheck: ";
        // line 29
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("You must select %s choices or fewer."));
        yield ",
  check: ";
        // line 30
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("You must select between %s and %s choices."));
        yield ",
  equalto: ";
        // line 31
        yield $this->extensions['MailPoet\Twig\Functions']->jsonEncode($this->extensions['MailPoet\Twig\I18n']->translate("This value should be the same."));
        yield "
});

Parsley.setLocale('mailpoet');
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "parsley-translations.html";
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
        return array (  122 => 31,  118 => 30,  114 => 29,  110 => 28,  106 => 27,  102 => 26,  98 => 25,  94 => 24,  90 => 23,  86 => 22,  82 => 21,  78 => 20,  74 => 19,  69 => 17,  65 => 16,  61 => 15,  57 => 14,  53 => 13,  49 => 12,  44 => 10,  41 => 9,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "parsley-translations.html", "/home/circleci/mailpoet/mailpoet/views/parsley-translations.html");
    }
}
