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

/* emails/statsNotificationAutomatedEmailsGarden.html */
class __TwigTemplate_68703d45e463b6257ea13a45bad72fb4415130f87744504021e23211ad9a1ef8 extends Template
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
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Your monthly automation stats");
        yield "
                </h1>
              </td>
            </tr>
            <tr>
              <td class=\"mailpoet_spacer\" height=\"48\" valign=\"top\" style=\"border-collapse:collapse\"></td>
            </tr>
            ";
        // line 32
        if (($context["recipientFirstName"] ?? null)) {
            // line 33
            yield "            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px;padding-bottom:24px;\">
                <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                  ";
            // line 36
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Hi %s,"), ["%s" => ($context["recipientFirstName"] ?? null)]), "html", null, true);
            yield "
                </p>
              </td>
            </tr>
            ";
        }
        // line 41
        yield "            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                  ";
        // line 44
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Here's a summary of how your active automations performed this month.");
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

";
        // line 60
        $context['_parent'] = $context;
        $context['_seq'] = CoreExtension::ensureTraversable(($context["newsletters"] ?? null));
        foreach ($context['_seq'] as $context["_key"] => $context["newsletter"]) {
            // line 61
            yield "<tr>
  <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td style=\"padding-left:0;padding-right:0;border-collapse:collapse\">
          <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mailpoet_cols-one\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
            <tbody>
            <tr>
              <td class=\"mailpoet_divider\" valign=\"top\" style=\"border-collapse:collapse;padding:0 48px 24px 48px\">
                <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                  <tr>
                    <td class=\"mailpoet_divider-cell\" style=\"border-collapse:collapse;border-top-width:1px;border-top-style:solid;border-top-color:#e8e8e8\"></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                <h2 style=\"text-align:left;padding:0;font-style:normal;font-weight:bold;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:22px;line-height:28px\">
                  ";
            // line 81
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "subject", [], "any", false, false, false, 81), "html", null, true);
            yield "
                </h2>
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
            // line 107
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
            // line 120
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "clicked", [], "any", false, false, false, 120));
            yield "%
                      </span>
                    </td>
                    <td valign=\"middle\" style=\"border-collapse:collapse\">
                      <span style=\"display:inline-block;background-color:";
            // line 124
            yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsBadgeColor(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "clicked", [], "any", false, false, false, 124));
            yield ";border-radius:4px;padding:2px 10px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:13px;line-height:20px;color:#1e1e1e\">
                        ";
            // line 125
            yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsTextGarden(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "clicked", [], "any", false, false, false, 125));
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
              <td width=\"330\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:330px; vertical-align:top; width:100%;\">
            <table width=\"330\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:330px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
            // line 161
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Opened");
            yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
            // line 171
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "opened", [], "any", false, false, false, 171));
            yield "%
                  </p>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso]>
          </td>
          <td width=\"330\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:330px; vertical-align:top; width:100%;\">
            <table width=\"330\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:330px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
            // line 188
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Machine-opened");
            yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
            // line 198
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "machineOpened", [], "any", false, false, false, 198));
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
              <td width=\"330\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:330px; vertical-align:top; width:100%;\">
            <table width=\"330\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:330px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
            // line 238
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Unsubscribed");
            yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
            // line 248
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "unsubscribed", [], "any", false, false, false, 248));
            yield "%
                  </p>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso]>
          </td>
          <td width=\"330\" valign=\"top\">
          <![endif]-->
          <div style=\"display:inline-block; max-width:330px; vertical-align:top; width:100%;\">
            <table width=\"330\" class=\"mailpoet_cols-two\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"left\" style=\"width:100%;max-width:330px;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#666666;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:24px\">
                    ";
            // line 265
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Bounced");
            yield "
                  </p>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"8\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;border-collapse:collapse;padding-left:48px;padding-right:48px\">
                  <p style=\"text-align:left;padding:0;margin:0;color:#1e1e1e;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:bold;line-height:32px\">
                    ";
            // line 275
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "bounced", [], "any", false, false, false, 275));
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
            // line 294
            if ((CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 294) > 0)) {
                // line 295
                yield "<tr>
  <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
      <tbody>
      <tr>
        <td class=\"mailpoet_paragraph mailpoet_padded_side\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#7f7f7f;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:13px;line-height:20px;padding-left:20px;padding-right:20px;padding-bottom:10px\">
          ";
                // line 301
                if ((CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "trackedSent", [], "any", false, false, false, 301) > 0)) {
                    // line 302
                    yield "            ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("%1\$s of your recipients is not tracked, so open and click rates are based on the other %2\$s.", "%1\$s of your recipients are not tracked, so open and click rates are based on the other %2\$s.", CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 302)), ["%1\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 302), "%2\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "trackedSent", [], "any", false, false, false, 302)]), "html", null, true);
                    yield "
          ";
                } else {
                    // line 304
                    yield "            ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("Your %1\$s recipient is not tracked, so open and click rates cannot be measured.", "None of your %1\$s recipients are tracked, so open and click rates cannot be measured.", CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 304)), ["%1\$s" => CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "notTracked", [], "any", false, false, false, 304)]), "html", null, true);
                    yield "
          ";
                }
                // line 306
                yield "        </td>
      </tr>
      </tbody>
    </table>
  </td>
</tr>
";
            }
            // line 313
            yield "<tr>
  <td class=\"mailpoet_spacer\" height=\"48\" valign=\"top\" style=\"border-collapse:collapse\"></td>
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
              <td class=\"mailpoet_padded_side\" valign=\"top\" style=\"border-collapse:collapse;padding-bottom:20px;padding-left:48px;padding-right:48px\">
                <div>
                  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                    <tr>
                      <td class=\"mailpoet_button-container\" style=\"text-align:center;border-collapse:collapse\">
                        <a class=\"mailpoet_button\" href=\"";
            // line 330
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(CoreExtension::getAttribute($this->env, $this->source, $context["newsletter"], "linkStats", [], "any", false, false, false, 330), "html", null, true);
            yield "\" style=\"display:inline-block;-webkit-text-size-adjust:none;mso-hide:all;text-decoration:none;text-align:center;background-color:#1e1e1e;border-width:0px;border-radius:4px;border-style:solid;width:100%;max-width:564px;line-height:42px;color:#ffffff;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:16px;font-weight:normal;box-sizing:border-box\">
                          ";
            // line 331
            yield $this->extensions['MailPoet\Twig\I18n']->translate("View automation report");
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
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['newsletter'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 351
        yield "
<tr>
  <td class=\"mailpoet_spacer\" height=\"20\" valign=\"top\" style=\"border-collapse:collapse\"></td>
</tr>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/statsNotificationAutomatedEmailsGarden.html";
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
        return array (  476 => 351,  450 => 331,  446 => 330,  427 => 313,  418 => 306,  412 => 304,  406 => 302,  404 => 301,  396 => 295,  394 => 294,  372 => 275,  359 => 265,  339 => 248,  326 => 238,  283 => 198,  270 => 188,  250 => 171,  237 => 161,  198 => 125,  194 => 124,  187 => 120,  171 => 107,  142 => 81,  120 => 61,  116 => 60,  97 => 44,  92 => 41,  84 => 36,  79 => 33,  77 => 32,  67 => 25,  54 => 15,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/statsNotificationAutomatedEmailsGarden.html", "/home/circleci/mailpoet/mailpoet/views/emails/statsNotificationAutomatedEmailsGarden.html");
    }
}
