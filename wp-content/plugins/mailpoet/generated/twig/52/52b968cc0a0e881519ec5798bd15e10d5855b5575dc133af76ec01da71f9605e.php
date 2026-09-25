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

/* emails/statsNotificationGarden.html */
class __TwigTemplate_ee764fa4d8ebf4837f28ad1bc7923b526ff12411aa2afe038ac321b03cb573cd extends Template
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
        yield "<tr>
  <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td style=\"padding-left:0;padding-right:0;border-collapse:collapse\">
          <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mailpoet_cols-one\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
            <tbody>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"36\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;line-height:16px;text-transform:uppercase;letter-spacing:0.5px\">
                  ";
        // line 15
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["blogName"] ?? null), "html", null, true);
        yield "
                </p>
              </td>
            </tr>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"36\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                <h1 style=\"text-align:left;padding:0;font-style:normal;font-weight:bold;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:28px;line-height:36px\">
                  ";
        // line 25
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Your campaign stats");
        yield "
                </h1>
              </td>
            </tr>

            ";
        // line 30
        if (($context["recipientFirstName"] ?? null)) {
            // line 31
            yield "            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px;padding-bottom:24px;padding-top:12px;\">
                <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                  ";
            // line 34
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Hi %s,"), ["%s" => ($context["recipientFirstName"] ?? null)]), "html", null, true);
            yield "
                </p>
              </td>
            </tr>
            ";
        }
        // line 39
        yield "            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px;\">
                <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                  ";
        // line 42
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Here's how your campaign \"%s\" performed in the first 24 hours."), ["%s" => ($context["subject"] ?? null)]), "html", null, true);
        yield "
                </p>
              </td>
            </tr>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"32\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            </tbody>
          </table>
        </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>
<tr>
  <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td style=\"padding-left:0;padding-right:0;border-collapse:collapse\">
          <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mailpoet_cols-one\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
            <tbody>
            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                  ";
        // line 68
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Clicked");
        yield "
                </p>
              </td>
            </tr>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                <table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                  <tr>
                    <td valign=\"middle\" style=\"border-collapse:collapse;padding-right:8px\">
                      <span style=\"font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#1e1e1e;line-height:32px\">
                        ";
        // line 81
        yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["clicked"] ?? null));
        yield "%
                      </span>
                    </td>
                    <td valign=\"middle\" style=\"border-collapse:collapse\">
                      <span style=\"display:inline-block;background-color:";
        // line 85
        yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsBadgeColor(($context["clicked"] ?? null));
        yield ";border-radius:4px;padding:2px 10px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:13px;line-height:20px;color:#1e1e1e\">
                        ";
        // line 86
        yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsTextGarden(($context["clicked"] ?? null));
        yield "
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"48\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            </tbody>
          </table>
        </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>
<tr>
  <td class=\"mailpoet_content-cols-two\" align=\"left\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td align=\"center\" style=\"font-size:0;border-collapse:collapse\">
          <!--[if mso]>
          <table border=\"0\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
            <tbody>
            <tr>
              <td width=\"282\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:282px; vertical-align:top; width:100%;\">
            <table width=\"282\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:282px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
        // line 122
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Opened");
        yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
        // line 132
        yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["opened"] ?? null));
        yield "%
                  </p>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso]>
          </td>
          <td width=\"282\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:282px; vertical-align:top; width:100%;\">
            <table width=\"282\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:282px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
        // line 149
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Machine-opened");
        yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
        // line 159
        yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["machineOpened"] ?? null));
        yield "%
                  </p>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso]>
          </td>
          </tr>
          </tbody>
          </table>
          <![endif]-->
        </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>
<tr>
  <td class=\"mailpoet_spacer\" height=\"48\" valign=\"top\" style=\"border-collapse:collapse\"></td>
</tr>
<tr>
  <td class=\"mailpoet_content-cols-two\" align=\"left\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td align=\"center\" style=\"font-size:0;border-collapse:collapse\">
          <!--[if mso]>
          <table border=\"0\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
            <tbody>
            <tr>
              <td width=\"282\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:282px; vertical-align:top; width:100%;\">
            <table width=\"282\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:282px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
        // line 199
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Unsubscribed");
        yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
        // line 209
        yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["unsubscribed"] ?? null));
        yield "%
                  </p>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso]>
          </td>
          <td width=\"282\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:282px; vertical-align:top; width:100%;\">
            <table width=\"282\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:282px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
        // line 226
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Bounced");
        yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
        // line 236
        yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["bounced"] ?? null));
        yield "%
                  </p>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso]>
          </td>
          </tr>
          </tbody>
          </table>
          <![endif]-->
        </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>
";
        // line 255
        if ((($context["notTracked"] ?? null) > 0)) {
            // line 256
            yield "<tr>
  <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td class=\"mailpoet_paragraph mailpoet_padded_side\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#7f7f7f;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:13px;line-height:20px;padding-left:20px;padding-right:20px;padding-bottom:10px\">
          ";
            // line 262
            if ((($context["trackedSent"] ?? null) > 0)) {
                // line 263
                yield "            ";
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("%1\$s of your recipients is not tracked, so open and click rates are based on the other %2\$s.", "%1\$s of your recipients are not tracked, so open and click rates are based on the other %2\$s.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null), "%2\$s" => ($context["trackedSent"] ?? null)]), "html", null, true);
                yield "
          ";
            } else {
                // line 265
                yield "            ";
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("Your %1\$s recipient is not tracked, so open and click rates cannot be measured.", "None of your %1\$s recipients are tracked, so open and click rates cannot be measured.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null)]), "html", null, true);
                yield "
          ";
            }
            // line 267
            yield "        </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>
";
        }
        // line 274
        yield "<tr>
  <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td style=\"padding-left:0;padding-right:0;border-collapse:collapse\">
          <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mailpoet_cols-one\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
            <tbody>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"48\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            <tr>
              <td class=\"mailpoet_padded_side\" valign=\"top\" style=\"border-collapse:collapse;padding-bottom:20px;padding-left:48px;padding-right:48px\">
                <div>
                  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                    <tr>
                      <td class=\"mailpoet_button-container\" style=\"text-align:center;border-collapse:collapse\">
                        <a class=\"mailpoet_button\" href=\"";
        // line 291
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["linkStats"] ?? null), "html", null, true);
        yield "\" style=\"display:inline-block;-webkit-text-size-adjust:none;mso-hide:all;text-decoration:none;text-align:center;background-color:#1e1e1e;border-width:0px;border-radius:4px;border-style:solid;width:100%;max-width:564px;line-height:42px;color:#ffffff;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:16px;font-weight:normal;box-sizing:border-box\">
                          ";
        // line 292
        yield $this->extensions['MailPoet\Twig\I18n']->translate("View full campaign report");
        yield "
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"10\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            </tbody>
          </table>
        </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/statsNotificationGarden.html";
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
        return array (  403 => 292,  399 => 291,  380 => 274,  371 => 267,  365 => 265,  359 => 263,  357 => 262,  349 => 256,  347 => 255,  325 => 236,  312 => 226,  292 => 209,  279 => 199,  236 => 159,  223 => 149,  203 => 132,  190 => 122,  151 => 86,  147 => 85,  140 => 81,  124 => 68,  95 => 42,  90 => 39,  82 => 34,  77 => 31,  75 => 30,  67 => 25,  54 => 15,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/statsNotificationGarden.html", "/home/circleci/mailpoet/mailpoet/views/emails/statsNotificationGarden.html");
    }
}
