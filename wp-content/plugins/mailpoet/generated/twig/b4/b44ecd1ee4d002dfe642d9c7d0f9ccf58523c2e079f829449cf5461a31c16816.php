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

/* emails/statsNotification.html */
class __TwigTemplate_dca57ced6841059bfa2e8b3dbebd25c20bdcb4ab3fe1554e70cfc14ded6da7ab extends Template
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
        return "emails/statsNotificationLayout.html";
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        $this->parent = $this->loadTemplate("emails/statsNotificationLayout.html", "emails/statsNotification.html", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
    }

    // line 3
    public function block_content($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 4
        if ($this->extensions['MailPoet\Twig\Functions']->isGarden()) {
            // line 5
            yield from             $this->loadTemplate("emails/statsNotificationGarden.html", "emails/statsNotification.html", 5)->unwrap()->yield($context);
        } else {
            // line 7
            yield "  <tr>
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
                <td class=\"mailpoet_image mailpoet_padded_vertical mailpoet_padded_side\" align=\"center\" valign=\"top\" style=\"border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                  <img src=\"";
            // line 20
            yield $this->extensions['MailPoet\Twig\Assets']->generateCdnUrl("logo-orange-400x122.png");
            yield "\" width=\"80\" alt=\"new_logo_orange\" style=\"height:auto;max-width:100%;-ms-interpolation-mode:bicubic;border:0;display:block;outline:none;text-align:center\"/>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"26\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                  <h1 style=\"text-align:center;padding:0;font-style:normal;font-weight:normal;margin:0 0 12px;color:#111111;font-family:'Trebuchet MS','Lucida Grande','Lucida Sans Unicode','Lucida Sans',Tahoma,sans-serif;font-size:40px;line-height:64px\">
                    <strong>";
            // line 29
            yield $this->extensions['MailPoet\Twig\I18n']->translate("Your stats are in!");
            yield "</strong>
                  </h1>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                  <h3 class=\"title\" style=\"text-align:center;padding:0;font-style:normal;font-weight:normal;margin:0 0 6px;color:#333333;font-family:'Courier New',Courier,'Lucida Sans Typewriter','Lucida Typewriter',monospace;font-size:20px;line-height:32px\">
                    <em>";
            // line 36
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["subject"] ?? null), "html", null, true);
            yield "</em>
                  </h3>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"55\" valign=\"top\" style=\"border-collapse:collapse\"></td>
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
            // line 51
            if (($context["subscribersLimitReached"] ?? null)) {
                // line 52
                yield "    <tr>
      <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse;background-color:#fe5301!important\" bgcolor=\"#fe5301\">
        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0\">
          <tbody>
          <tr>
            <td style=\"border-collapse:collapse;padding-left:0;padding-right:0\">
              <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mailpoet_cols-one\" style=\"border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0\">
                <tbody>
                <tr>
                  <td class=\"mailpoet_spacer\" height=\"26\" valign=\"top\" style=\"border-collapse:collapse\"></td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"border-collapse:collapse;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px;word-break:break-word;word-wrap:break-word\">
                    <table style=\"border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0\" width=\"100%\" cellpadding=\"0\">
                      <tbody>
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px;word-break:break-word;word-wrap:break-word;text-align:left\">
                          <span style=\"color: #ffffff;\"><strong>";
                // line 69
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Congratulations, you now have more than [subscribersLimit] subscribers!"), ["[subscribersLimit]" => ($context["subscribersLimit"] ?? null)]), "html", null, true);
                yield "</strong></span><br><br>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                    <table style=\"border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0\" width=\"100%\" cellpadding=\"0\">
                      <tbody>
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px;word-break:break-word;word-wrap:break-word;text-align:left\">
                          <span style=\"color: #ffffff;\"><strong></strong></span>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                    <table style=\"border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0\" width=\"100%\" cellpadding=\"0\">
                      <tbody>
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px;word-break:break-word;word-wrap:break-word;text-align:left\">
                          <span style=\"color: #ffffff;\">";
                // line 87
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("Our free version is limited to [subscribersLimit] subscribers. You need to upgrade now to be able to continue using MailPoet."), ["[subscribersLimit]" => ($context["subscribersLimit"] ?? null)]), "html", null, true);
                yield "</span>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"border-collapse:collapse;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px\">
                    <div>
                      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0\">
                        <tbody>
                        <tr>
                          <td class=\"mailpoet_button-container\" style=\"border-collapse:collapse;text-align:center\">
                            <!--[if mso]>
                              <v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\"
                                           xmlns:w=\"urn:schemas-microsoft-com:office:word\"
                                           href=\"\"
                                           style=\"height:50px; width:288px; v-text-anchor:middle;\"
                                           arcsize=\"6%\"
                                           strokeweight=\"0px\"
                                           strokecolor=\"#0074a2\"
                                           fillcolor=\"#ffffff\">
                                <w:anchorlock/>
                                <center style=\"color:#fe5301;
                                  font-family:Arial;
                                  font-size:20px;
                                  font-weight:bold;\">Upgrade Now
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a class=\"mailpoet_button\" href=\"";
                // line 118
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["upgradeNowLink"] ?? null), "html", null, true);
                yield "\" style=\"color:#fe5301;text-decoration:none !important;display:inline-block;-webkit-text-size-adjust:none;mso-hide:all;text-align:center;background-color:#ffffff;border-color:#0074a2;border-width:0px;border-radius:3px;border-style:solid;width:288px;line-height:50px;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:20px;font-weight:normal\">Upgrade Now</a>
                          </td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_spacer\" height=\"26\" valign=\"top\" style=\"border-collapse:collapse\"></td>
                </tr>
                <tr>
                  <td class=\"mailpoet_spacer\" bgcolor=\"#ffffff\" height=\"26\" valign=\"top\" style=\"border-collapse:collapse\"></td>
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
            // line 141
            yield "  <tr>
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
                  <td class=\"mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\"
                      style=\"border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                    <div>
                      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                        <tr>
                          <td class=\"mailpoet_button-container\" style=\"text-align:center;border-collapse:collapse\">
                            <a class=\"mailpoet_button\" href=\"\" style=\"display:inline-block;-webkit-text-size-adjust:none;mso-hide:all;text-decoration:none;text-align:center;background-color:";
            // line 163
            yield $this->extensions['MailPoet\Twig\Functions']->statsColor(($context["clicked"] ?? null));
            yield " ;border-color:#0074a2 ;border-width:0px ;border-radius:3px ;border-style:solid ;width:100px ;line-height:20px ;color:#ffffff ;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif ;font-size:10px ;font-weight:normal \">
                              ";
            // line 164
            yield $this->extensions['MailPoet\Twig\Functions']->clickedStatsText(($context["clicked"] ?? null));
            yield "
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-left:20px;padding-right:20px\">
                    <h2 style=\"text-align:center;padding:0;font-style:normal;font-weight:normal;margin:0 0 12px;color:#222222;font-family:'Courier New',Courier,'Lucida Sans Typewriter','Lucida Typewriter',monospace;font-size:40px;line-height:64px\">
                      <span style=\"color: ";
            // line 175
            yield $this->extensions['MailPoet\Twig\Functions']->statsColor(($context["clicked"] ?? null));
            yield "\">
                        <strong>";
            // line 176
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["clicked"] ?? null));
            yield "%</strong>
                      </span>
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                    <table style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\" width=\"100%\" cellpadding=\"0\">
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px\">
                          <span style=\"color: ";
            // line 186
            yield $this->extensions['MailPoet\Twig\Functions']->statsColor(($context["clicked"] ?? null));
            yield "\">
                            ";
            // line 187
            yield $this->extensions['MailPoet\Twig\I18n']->translate("clicked");
            yield "
                          </span>
                        </td>
                      </tr>
                    </table>
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
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-left:20px;padding-right:20px\">
                    <h2 style=\"text-align:center;padding:0;font-style:normal;font-weight:normal;margin:0 0 12px;color:#222222;font-family:'Courier New',Courier,'Lucida Sans Typewriter','Lucida Typewriter',monospace;font-size:40px;line-height:64px\">
                      <span>
                        <strong>";
            // line 228
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["opened"] ?? null));
            yield "%</strong>
                      </span>
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                    <table style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\" width=\"100%\" cellpadding=\"0\">
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px\">
                          <span>
                            ";
            // line 239
            yield $this->extensions['MailPoet\Twig\I18n']->translate("opened");
            yield "
                          </span>
                        </td>
                      </tr>
                    </table>
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
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-left:20px;padding-right:20px\">
                    <h2 style=\"text-align:center;padding:0;font-style:normal;font-weight:normal;margin:0 0 12px;color:#222222;font-family:'Courier New',Courier,'Lucida Sans Typewriter','Lucida Typewriter',monospace;font-size:40px;line-height:64px\">
                      <span>
                        <strong>";
            // line 260
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["machineOpened"] ?? null));
            yield "%</strong>
                      </span>
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                    <table style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\" width=\"100%\" cellpadding=\"0\">
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px\">
                          <span>
                            ";
            // line 271
            yield $this->extensions['MailPoet\Twig\I18n']->translate("machine-opened");
            yield "
                          </span>
                        </td>
                      </tr>
                    </table>
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
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-left:20px;padding-right:20px\">
                    <h2 style=\"text-align:center;padding:0;font-style:normal;font-weight:normal;margin:0 0 12px;color:#222222;font-family:'Courier New',Courier,'Lucida Sans Typewriter','Lucida Typewriter',monospace;font-size:40px;line-height:64px\">
                        <span>
                          <strong>";
            // line 312
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["unsubscribed"] ?? null));
            yield "%</strong>
                        </span>
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                    <table style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\" width=\"100%\" cellpadding=\"0\">
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px\">
                            <span>
                              ";
            // line 323
            yield $this->extensions['MailPoet\Twig\I18n']->translate("unsubscribed");
            yield "
                            </span>
                        </td>
                      </tr>
                    </table>
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
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-left:20px;padding-right:20px\">
                    <h2 style=\"text-align:center;padding:0;font-style:normal;font-weight:normal;margin:0 0 12px;color:#222222;font-family:'Courier New',Courier,'Lucida Sans Typewriter','Lucida Typewriter',monospace;font-size:40px;line-height:64px\">
                        <span>
                          <strong>";
            // line 344
            yield $this->extensions['MailPoet\Twig\Functions']->statsNumberFormatI18n(($context["bounced"] ?? null));
            yield "%</strong>
                        </span>
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                    <table style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\" width=\"100%\" cellpadding=\"0\">
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px\">
                            <span>
                              ";
            // line 355
            yield $this->extensions['MailPoet\Twig\I18n']->translate("bounced");
            yield "
                            </span>
                        </td>
                      </tr>
                    </table>
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
            // line 377
            if ((($context["notTracked"] ?? null) > 0)) {
                // line 378
                yield "    <tr>
      <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
          <tbody>
          <tr>
            <td class=\"mailpoet_paragraph mailpoet_padded_side\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#7f7f7f;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:13px;line-height:20px;padding-left:20px;padding-right:20px;padding-bottom:10px\">
              ";
                // line 384
                if ((($context["trackedSent"] ?? null) > 0)) {
                    // line 385
                    yield "                ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("%1\$s of your recipients is not tracked, so open and click rates are based on the other %2\$s.", "%1\$s of your recipients are not tracked, so open and click rates are based on the other %2\$s.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null), "%2\$s" => ($context["trackedSent"] ?? null)]), "html", null, true);
                    yield "
              ";
                } else {
                    // line 387
                    yield "                ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->pluralize("Your %1\$s recipient is not tracked, so open and click rates cannot be measured.", "None of your %1\$s recipients are tracked, so open and click rates cannot be measured.", ($context["notTracked"] ?? null)), ["%1\$s" => ($context["notTracked"] ?? null)]), "html", null, true);
                    yield "
              ";
                }
                // line 389
                yield "            </td>
          </tr>
          </tbody>
        </table>
      </td>
    </tr>
  ";
            }
            // line 396
            yield "  ";
            if ((($context["topLinkClicks"] ?? null) > 0)) {
                // line 397
                yield "    <tr>
      <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
          <tbody>
          <tr>
            <td style=\"padding-left:0;padding-right:0;border-collapse:collapse\">
              <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mailpoet_cols-one\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
                <tbody>
                <tr>
                  <td class=\"mailpoet_divider\" valign=\"top\" style=\"padding:26.5px 20px 26.5px 20px;border-collapse:collapse\">
                    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                      <tr>
                        <td class=\"mailpoet_divider-cell\" style=\"border-top-width:1px;border-top-style:solid;border-top-color:#e8e8e8;border-collapse:collapse\"></td>
                      </tr>
                    </table>
                  </td>
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
                  <td class=\"mailpoet_header_footer_padded mailpoet_header\" style=\"line-height:38.4px;text-align:center ;color:#222222 ;font-family:'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif ;font-size:24px ;border-collapse:collapse;padding:10px 20px\">
                    <span style=\"font-weight: 600;\">
                      ";
                // line 433
                yield $this->extensions['MailPoet\Twig\I18n']->translate("Most clicked link");
                yield "
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class=\"mailpoet_text mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"word-break:break-word;word-wrap:break-word;padding-top:0;border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                    <table style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\" width=\"100%\" cellpadding=\"0\">
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px\">
                          ";
                // line 442
                if ((is_string($__internal_compile_0 = ($context["topLink"] ?? null)) && is_string($__internal_compile_1 = "http") && str_starts_with($__internal_compile_0, $__internal_compile_1))) {
                    // line 443
                    yield "                            <a href=\"";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["topLink"] ?? null), "html", null, true);
                    yield "\" target=\"_blank\" rel=\"noopener noreferrer\"
                               style=\"color:#008282;text-decoration:underline\">
                              ";
                    // line 445
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["topLink"] ?? null), "html", null, true);
                    yield "
                            </a>
                          ";
                } else {
                    // line 448
                    yield "                            ";
                    yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["topLink"] ?? null), "html", null, true);
                    yield "
                          ";
                }
                // line 450
                yield "                        </td>
                      </tr>
                    </table>
                    <table style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\" width=\"100%\" cellpadding=\"0\">
                      <tr>
                        <td class=\"mailpoet_paragraph\" style=\"word-break:break-word;word-wrap:break-word;text-align:center;border-collapse:collapse;color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:16px;line-height:25.6px\">
                          <span style=\"color: #000000;\">
                            ";
                // line 457
                yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(MailPoetVendor\Twig\Extension\CoreExtension::replace($this->extensions['MailPoet\Twig\I18n']->translate("%s unique clicks"), ["%s" => ($context["topLinkClicks"] ?? null)]), "html", null, true);
                yield "
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
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
            // line 473
            yield "  <tr>
    <td class=\"mailpoet_content\" align=\"center\" style=\"border-collapse:collapse\">
      <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
        <tbody>
        <tr>
          <td style=\"padding-left:0;padding-right:0;border-collapse:collapse\">
            <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"mailpoet_cols-one\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;table-layout:fixed;margin-left:auto;margin-right:auto;padding-left:0;padding-right:0;border-collapse:collapse\">
              <tbody>
              <tr>
                <td class=\"mailpoet_divider\" valign=\"top\" style=\"padding:6.5px 20px 6.5px 20px;border-collapse:collapse\">
                  <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                    <tr>
                      <td class=\"mailpoet_divider-cell\" style=\"border-top-width:1px;border-top-style:solid;border-top-color:#e8e8e8;border-collapse:collapse\"></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"30\" valign=\"top\" style=\"border-collapse:collapse\"></td>
              </tr>
              <tr>
                <td class=\"mailpoet_padded_vertical mailpoet_padded_side\" valign=\"top\" style=\"border-collapse:collapse;padding-bottom:20px;padding-left:20px;padding-right:20px\">
                  <div>
                    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse\">
                      <tr>
                        <td class=\"mailpoet_button-container\" style=\"text-align:center;border-collapse:collapse\">
                          <a class=\"mailpoet_button\" href=\"";
            // line 499
            yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["linkStats"] ?? null), "html", null, true);
            yield "\" style=\"display:inline-block;-webkit-text-size-adjust:none;mso-hide:all;text-decoration:none;text-align:center;background-color:#fe5301 ;border-color:#0074a2 ;border-width:0px ;border-radius:3px ;border-style:solid ;width:288px ;line-height:50px ;color:#ffffff ;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif ;font-size:20px ;font-weight:normal \">
                            ";
            // line 500
            yield $this->extensions['MailPoet\Twig\I18n']->translate("View all stats");
            yield "
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              <tr>
                <td class=\"mailpoet_spacer\" height=\"20\" valign=\"top\" style=\"border-collapse:collapse\"></td>
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
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "emails/statsNotification.html";
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
        return array (  659 => 500,  655 => 499,  627 => 473,  608 => 457,  599 => 450,  593 => 448,  587 => 445,  581 => 443,  579 => 442,  567 => 433,  529 => 397,  526 => 396,  517 => 389,  511 => 387,  505 => 385,  503 => 384,  495 => 378,  493 => 377,  468 => 355,  454 => 344,  430 => 323,  416 => 312,  372 => 271,  358 => 260,  334 => 239,  320 => 228,  276 => 187,  272 => 186,  259 => 176,  255 => 175,  241 => 164,  237 => 163,  213 => 141,  187 => 118,  153 => 87,  132 => 69,  113 => 52,  111 => 51,  93 => 36,  83 => 29,  71 => 20,  56 => 7,  53 => 5,  51 => 4,  47 => 3,  36 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "emails/statsNotification.html", "/home/circleci/mailpoet/mailpoet/views/emails/statsNotification.html");
    }
}
