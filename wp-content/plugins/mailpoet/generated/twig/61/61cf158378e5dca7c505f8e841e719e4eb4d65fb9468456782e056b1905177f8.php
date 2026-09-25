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

/* form/editor.html */
class __TwigTemplate_7b59605c39916c71a648c889aa253010605f62b41e4c92a7c75e0e0e6a5fc0fe extends Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->blocks = [
            'container' => [$this, 'block_container'],
        ];
    }

    protected function doGetParent(array $context)
    {
        // line 1
        return "layout.html";
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        $this->parent = $this->loadTemplate("layout.html", "form/editor.html", 1);
        yield from $this->parent->unwrap()->yield($context, array_merge($this->blocks, $blocks));
    }

    // line 3
    public function block_container($context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 4
        yield "
<div class=\"block-editor\">
    <div id=\"mailpoet_form_edit\" class=\"block-editor__container\">
    </div>
</div>

<script>
  ";
        // line 12
        yield "  // Disable Gutenberg's opt-in VIPS upload path before the form editor bundle runs.
  window.__clientSideMediaProcessing = false;
  var mailpoet_form_data = ";
        // line 14
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["form"] ?? null));
        yield ";
  var mailpoet_form_exports = ";
        // line 15
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["form_exports"] ?? null));
        yield ";
  var mailpoet_form_segments = ";
        // line 16
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["segments"] ?? null));
        yield ";
  var mailpoet_custom_fields = ";
        // line 17
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["custom_fields"] ?? null));
        yield ";
  var mailpoet_date_types = ";
        // line 18
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["date_types"] ?? null));
        yield ";
  var mailpoet_date_formats = ";
        // line 19
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["date_formats"] ?? null));
        yield ";
  var mailpoet_month_names = ";
        // line 20
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["month_names"] ?? null));
        yield ";
  var mailpoet_form_preview_page = ";
        // line 21
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["preview_page_url"] ?? null));
        yield ";
  var mailpoet_custom_fonts = ";
        // line 22
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["custom_fonts"] ?? null));
        yield ";
  var mailpoet_form_editor_color_palette = ";
        // line 23
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["editor_color_palette"] ?? null));
        yield ";
  var mailpoet_translations = ";
        // line 24
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["translations"] ?? null));
        yield ";
  var mailpoet_all_wp_posts = ";
        // line 25
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["posts"] ?? null));
        yield ";
  var mailpoet_all_wp_pages = ";
        // line 26
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["pages"] ?? null));
        yield ";
  var mailpoet_all_wp_categories = ";
        // line 27
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["categories"] ?? null));
        yield ";
  var mailpoet_all_wp_tags = ";
        // line 28
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["tags"] ?? null));
        yield ";
  var mailpoet_woocommerce_products = ";
        // line 29
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["products"] ?? null));
        yield ";
  var mailpoet_woocommerce_categories = ";
        // line 30
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["product_categories"] ?? null));
        yield ";
  var mailpoet_woocommerce_tags = ";
        // line 31
        yield $this->extensions['MailPoet\Twig\Filters']->wpJsonEncode(($context["product_tags"] ?? null));
        yield ";
  var mailpoet_close_icons_url = '";
        // line 32
        yield $this->extensions['MailPoet\Twig\Assets']->generateImageUrl("form_close_icon");
        yield "';
  var mailpoet_tutorial_seen = '";
        // line 33
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape(($context["editor_tutorial_seen"] ?? null), "js", null, true);
        yield "';
  var mailpoet_tutorial_url = '";
        // line 34
        yield $this->extensions['MailPoet\Twig\Assets']->generateCdnUrl("form-editor/tutorial.mp4");
        yield "';
  var mailpoet_is_administrator = ";
        // line 35
        yield ((($context["is_administrator"] ?? null)) ? ("true") : ("false"));
        yield ";
  var mailpoet_tracking_consent_capture_enabled = ";
        // line 36
        yield ((($context["tracking_consent_capture_enabled"] ?? null)) ? ("true") : ("false"));
        yield ";
  var mailpoet_form_edit_url = \"";
        // line 37
        yield admin_url("admin.php?page=mailpoet-form-editor&id=");
        yield "\";
  var mailpoet_theme_support_widgets = ";
        // line 38
        yield ((($context["theme_support_widgets"] ?? null)) ? ("true") : ("false"));
        yield ";
  var mailpoet_theme_support_fse = ";
        // line 39
        yield ((($context["theme_support_fse"] ?? null)) ? ("true") : ("false"));
        yield ";
  ";
        // line 41
        yield "</script>

<style id=\"mailpoet-form-editor-form-styles\"></style>

";
        // line 45
        yield $this->extensions['MailPoet\Twig\I18n']->localize(["displayForm" => $this->extensions['MailPoet\Twig\I18n']->translate("Display the form"), "enable" => $this->extensions['MailPoet\Twig\I18n']->translate("Enable"), "addFormName" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Add form name", "A placeholder for form name input"), "back" => $this->extensions['MailPoet\Twig\I18n']->translate("Back"), "form" => $this->extensions['MailPoet\Twig\I18n']->translate("Form"), "formSettings" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Settings", "A settings section heading"), "formSettingsStyles" => $this->extensions['MailPoet\Twig\I18n']->translate("Styles"), "formSettingsColor" => $this->extensions['MailPoet\Twig\I18n']->translate("Color"), "formSettingsStylesBackground" => $this->extensions['MailPoet\Twig\I18n']->translate("Background"), "formSettingsStylesBackgroundImage" => $this->extensions['MailPoet\Twig\I18n']->translate("Background Image"), "formSettingsStylesSelectImage" => $this->extensions['MailPoet\Twig\I18n']->translate("Select Image…"), "formSettingsStylesFontSize" => $this->extensions['MailPoet\Twig\I18n']->translate("Font Size"), "formSettingsStylesFont" => $this->extensions['MailPoet\Twig\I18n']->translate("Font"), "formSettingsStylesFontColorInherit" => $this->extensions['MailPoet\Twig\I18n']->translate("Inherit from theme"), "formSettingsInheritStyleFromTheme" => $this->extensions['MailPoet\Twig\I18n']->translate("Inherit style from theme"), "formSettingsDisplayFullWidth" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Display Fullwidth", "A label for checkbox in form style settings"), "formSettingsBold" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Bold", "A label for checkbox in form style settings"), "formSettingsBorderSize" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Border Size", "A label for checkbox in form style settings"), "formSettingsBorderRadius" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Border Radius", "A label for checkbox in form style settings"), "formSettingsInputPadding" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Input Padding", "A label for form style settings"), "formSettingsFormPadding" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Form Padding", "A label for form style settings"), "formSettingsAlignment" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Alignment", "A label for form style settings"), "formSettingsAlignmentLeft" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("left", "An alignment value for form editor"), "formSettingsAlignmentCenter" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("center", "An alignment value for form editor"), "formSettingsAlignmentRight" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("right", "An alignment value for form editor"), "formSettingsBorder" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Border", "A label for checkbox in form style settings"), "formSettingsApplyToAll" => $this->extensions['MailPoet\Twig\I18n']->translate("Apply styles to all inputs"), "formSettingsWidth" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Form width", "A label for form width settings"), "customFieldSettings" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Custom field settings", "A settings section heading"), "customFieldsFormSettings" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Form settings", "A settings section heading"), "formPlacement" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Form Placement", "A settings section heading"), "formPlacementLabel" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Form placement", "A label for a select box"), "customCss" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Custom CSS", "A settings section heading"), "formSaved" => $this->extensions['MailPoet\Twig\I18n']->translate("Form saved."), "formSavedAppendix" => $this->extensions['MailPoet\Twig\I18n']->translate("Cookies reset — you will see all your dismissed popup forms again."), "customFieldSaved" => $this->extensions['MailPoet\Twig\I18n']->translate("Custom field saved."), "placeFixedBarFormOnPagesDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Display your form in a fixed horizontal bar at the top or bottom of posts or pages."), "placeSlideInFormOnPagesDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Display your form in a slide–in form on top of your page content."), "placePopupFormOnPagesDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Display your form in a pop-up window."), "popupTriggerModeLabel" => $this->extensions['MailPoet\Twig\I18n']->translate("How should this popup open?"), "popupTriggerModeAuto" => $this->extensions['MailPoet\Twig\I18n']->translate("On page load"), "popupTriggerModeOnClick" => $this->extensions['MailPoet\Twig\I18n']->translate("On click"), "popupClickTriggerSelectorLabel" => $this->extensions['MailPoet\Twig\I18n']->translate("Click trigger selector"), "popupClickTriggerSelectorHelp" => $this->extensions['MailPoet\Twig\I18n']->translate("Examples: #signup-button, .open-newsletter-popup, a[href=\"#newsletter\"]"), "popupOnClickDisablesOtherTriggersNotice" => $this->extensions['MailPoet\Twig\I18n']->translate("Delay and Exit-intent display are disabled in \"On click\" mode."), "exitIntentTitle" => $this->extensions['MailPoet\Twig\I18n']->translate("Display on exit-intent"), "exitIntentDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Show the form immediately if the visitor attempts to leave the site."), "exitIntentSwitch" => $this->extensions['MailPoet\Twig\I18n']->translate("Exit-intent display"), "placeFormBellowPagesDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("This form placement allows you to add this form at the end of all the pages or posts, below the content."), "placeFormOnAllPages" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Display on all pages", "This is a text on a switch if a form should be displayed bellow all pages"), "placeFormOnAllPosts" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Display on all posts/products", "This is a text on a switch if a form should be displayed bellow all posts"), "placeFormOnHomepage" => $this->extensions['MailPoet\Twig\I18n']->translate("Display on the homepage"), "formPlacementDelay" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Display with a delay of", "Label on a selection of different times"), "formPlacementPlacementPosition" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Position", "Placement of a fixed bar form, on top of the page or on the bottom"), "formPlacementPlacementPositionTop" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("top", "Placement of a fixed bar form, on top of the page or on the bottom"), "formPlacementPlacementPositionBottom" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("bottom", "Placement of a fixed bar form, on top of the page or on the bottom"), "formPlacementPlacementPositionLeft" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("left", "Placement of a slide in form, on the left or right side of the page"), "formPlacementPlacementPositionRight" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("right", "Placement of a slide in  form, on the left or right side of the page"), "formPlacementDelaySeconds" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("%1s sec", "times selection should be in the end \"30 sec\""), "formPlacementCookieExpiration" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Show form every", "Label on a selection of different times"), "formPlacementCookieExpirationAlways" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Always", "times selection"), "formPlacementCookieExpirationDay" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("1 day", "times selection should be in the end \"1 day\""), "formPlacementCookieExpirationDays" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("%1s days", "times selection should be in the end \"7 days\""), "formPlacementSave" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Close", "Text on a button to save and close a form"), "formPlacementOtherLabel" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Shortcode & other", "Label in the form placement section (Other form placements)"), "animationHeader" => $this->extensions['MailPoet\Twig\I18n']->translate("Show animation on display"), "animationNone" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("No Animation", "Value in a selectbox with a list of animations"), "addFormWidgetHint" => $this->extensions['MailPoet\Twig\I18n']->translate("You can add this form to a [link]widget area of your theme[/link] (new tab)."), "addFormFSEHint" => $this->extensions['MailPoet\Twig\I18n']->translate("You can add this form to your site using the [link]site editor[/link] (new tab)."), "addFormShortcodeHint" => $this->extensions['MailPoet\Twig\I18n']->translate("You can also use a block on any page or post, or this shortcode if you prefer [shortcode]."), "addFormPhpIframeHint" => $this->extensions['MailPoet\Twig\I18n']->translate("When needed, use [link]PHP[/link] or an [link]iFrame[/link] HTML element."), "settingsListLabel" => $this->extensions['MailPoet\Twig\I18n']->translate("This form adds the subscribers to these lists"), "settingsAfterSubmit" => $this->extensions['MailPoet\Twig\I18n']->translate("After submit…"), "settingsShowMessage" => $this->extensions['MailPoet\Twig\I18n']->translate("Show message"), "settingsGoToPage" => $this->extensions['MailPoet\Twig\I18n']->translate("Go to Page"), "settingsPleaseSelectList" => $this->extensions['MailPoet\Twig\I18n']->translate("Please select a list"), "fieldsBlocksCategory" => $this->extensions['MailPoet\Twig\I18n']->translate("Fields"), "customFieldsBlocksCategory" => $this->extensions['MailPoet\Twig\I18n']->translate("Custom Fields"), "layoutBlocksCategory" => $this->extensions['MailPoet\Twig\I18n']->translate("Layout"), "customFieldNumberOfLines" => $this->extensions['MailPoet\Twig\I18n']->translate("Number of lines"), "customFieldSaveCTA" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Update custom field", "Text on the save button"), "customFieldDeleteCTA" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Delete this custom field", "Text on the delete button"), "customFieldDeleteConfirm" => $this->extensions['MailPoet\Twig\I18n']->translate("This field will be deleted for all your subscribers. Are you sure?"), "customFieldTypeText" => $this->extensions['MailPoet\Twig\I18n']->translate("Text Input"), "customFieldTypeTextarea" => $this->extensions['MailPoet\Twig\I18n']->translate("Text Area"), "customFieldTypeRadio" => $this->extensions['MailPoet\Twig\I18n']->translate("Radio buttons"), "customFieldTypeCheckbox" => $this->extensions['MailPoet\Twig\I18n']->translate("Checkbox"), "customFieldTypeSelect" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Select", "Form input type"), "selectPage" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Select", "It is a placeholder in the select box - verb"), "displayOnCategories" => $this->extensions['MailPoet\Twig\I18n']->translate("Display on posts with these categories"), "displayOnAllCategoryArchives" => $this->extensions['MailPoet\Twig\I18n']->translate("Display on all post/product category archives"), "displayOnTags" => $this->extensions['MailPoet\Twig\I18n']->translate("Display on posts with these tags"), "displayOnAllTagArchives" => $this->extensions['MailPoet\Twig\I18n']->translate("Display on all post/product tag archives"), "selectSpecificArchiveTags" => $this->extensions['MailPoet\Twig\I18n']->translate("Select specific tags"), "selectSpecificArchiveCategories" => $this->extensions['MailPoet\Twig\I18n']->translate("Select specific categories"), "customFieldTypeDate" => $this->extensions['MailPoet\Twig\I18n']->translate("Date"), "customFieldDateType" => $this->extensions['MailPoet\Twig\I18n']->translate("Type of date"), "customFieldDateFormat" => $this->extensions['MailPoet\Twig\I18n']->translate("Order"), "customFieldDefaultToday" => $this->extensions['MailPoet\Twig\I18n']->translate("Preselect today’s date"), "customFieldDay" => $this->extensions['MailPoet\Twig\I18n']->translate("Day"), "customFieldMonth" => $this->extensions['MailPoet\Twig\I18n']->translate("Month"), "customFieldYear" => $this->extensions['MailPoet\Twig\I18n']->translate("Year"), "customField1Line" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("1 line", "Number of rows in textarea"), "customField2Lines" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("2 lines", "Number of rows in textarea"), "customField3Lines" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("3 lines", "Number of rows in textarea"), "customField4Lines" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("4 lines", "Number of rows in textarea"), "customField5Lines" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("5 lines", "Number of rows in textarea"), "customFieldValidateFor" => $this->extensions['MailPoet\Twig\I18n']->translate("Validate for"), "customFieldValidateNothing" => $this->extensions['MailPoet\Twig\I18n']->translate("Nothing"), "customFieldValidateNumbersOnly" => $this->extensions['MailPoet\Twig\I18n']->translate("Numbers only"), "customFieldValidateAlphanumerical" => $this->extensions['MailPoet\Twig\I18n']->translate("Alphanumerical"), "customFieldValidatePhoneNumber" => $this->extensions['MailPoet\Twig\I18n']->translate("Phone number, (+,-,#,(,) and spaces allowed)"), "customFieldAddItem" => $this->extensions['MailPoet\Twig\I18n']->translate("Add item"), "blockMandatory" => $this->extensions['MailPoet\Twig\I18n']->translate("Mandatory field"), "blockFirstName" => $this->extensions['MailPoet\Twig\I18n']->translate("First name"), "blockFirstNameDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Input field used to catch subscribers’ first names."), "blockLastName" => $this->extensions['MailPoet\Twig\I18n']->translate("Last name"), "blockLastNameDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Input field used to catch subscribers’ last names."), "blockTrackingConsent" => $this->extensions['MailPoet\Twig\I18n']->translate("Email activity tracking"), "blockTrackingConsentDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Ask subscribers to allow tracking of email opens and link clicks. This is separate from the subscription opt-in and is always shown unchecked."), "blockTrackingConsentDefaultText" => $this->extensions['MailPoet\Twig\I18n']->translate("Allow tracking of email opens and link clicks"), "blockTrackingConsentCheckboxLabel" => $this->extensions['MailPoet\Twig\I18n']->translate("Checkbox text"), "blockTrackingConsentCopyHelp" => $this->extensions['MailPoet\Twig\I18n']->translate("This exact wording is stored with each subscriber as the record of what they agreed to."), "blockSegmentSelect" => $this->extensions['MailPoet\Twig\I18n']->translate("List selection"), "blockLastNameDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Allow your subscribers to select which list(s) they want to subscribe to."), "blockSegmentSelectLabel" => $this->extensions['MailPoet\Twig\I18n']->translate("Select list(s):"), "blockSegmentSelectNoLists" => $this->extensions['MailPoet\Twig\I18n']->translate("Please select at least one list"), "blockSegmentSelectListLabel" => $this->extensions['MailPoet\Twig\I18n']->translate("Select the list that you want to add"), "blockEmail" => $this->extensions['MailPoet\Twig\I18n']->translate("Email"), "blockEmailDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Input field used to catch subscribers’ email addresses."), "blockSubmit" => $this->extensions['MailPoet\Twig\I18n']->translate("Submit button"), "blockSubmitDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Button used to submit the form."), "blockSubmitLabel" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Subscribe!", "a default value for a subscription form button"), "blockClose" => $this->extensions['MailPoet\Twig\I18n']->translate("Close button"), "blockCloseDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Link or button used to dismiss a pop-up, slide-in or fixed bar form."), "blockCloseLabel" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("No thanks", "a default value for a form close link"), "missingObligatoryBlock" => $this->extensions['MailPoet\Twig\I18n']->translate("Email input or submit is missing. Try reloading the form editor."), "missingTrackingConsentBlock" => $this->extensions['MailPoet\Twig\I18n']->translate("Your tracking settings ask every subscriber for consent, so this form needs to include the \"Email activity tracking\" checkbox."), "addTrackingConsentBlock" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Add the checkbox", "Button that inserts the tracking consent checkbox into the form"), "label" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Label", "settings for a label of an input"), "displayLabelWithinInput" => $this->extensions['MailPoet\Twig\I18n']->translate("Display label within input"), "displayLabel" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Display label", "Settings - if label should be displayed"), "blockDivider" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Divider / Spacer", "The name of the block in the editor"), "blockCustomHtml" => $this->extensions['MailPoet\Twig\I18n']->translate("Custom HTML"), "blockCustomHtmlDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Display custom text or HTML code in your form."), "blockCustomHtmlDefault" => $this->extensions['MailPoet\Twig\I18n']->translate("Subscribe to our newsletter and join [mailpoet_subscribers_count] other subscribers."), "blockCustomHtmlContentLabel" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Custom text", "Textarea label"), "blockCustomHtmlNl2br" => $this->extensions['MailPoet\Twig\I18n']->translate("Automatically add paragraphs"), "blockAddCustomField" => $this->extensions['MailPoet\Twig\I18n']->translate("Create Custom Field"), "blockAddCustomFieldDescription" => $this->extensions['MailPoet\Twig\I18n']->translate("Create a new custom field for your subscribers."), "blockAddCustomFieldFormHeading" => $this->extensions['MailPoet\Twig\I18n']->translate("New Custom Field."), "blockCreateButton" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Create", "Label on form submit button."), "customFieldName" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Field name", "Label for form field for custom input name"), "selectCustomFieldType" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Select a field type", "Label for form field for custom input type"), "customFieldWithNameExists" => $this->extensions['MailPoet\Twig\I18n']->translate("The custom field [name] already exists. Please choose another name."), "successMessage" => $this->extensions['MailPoet\Twig\I18n']->translate("This is what the success message looks like."), "errorMessage" => $this->extensions['MailPoet\Twig\I18n']->translate("This is what the error message looks like."), "formPreview" => $this->extensions['MailPoet\Twig\I18n']->translate("Form Preview"), "formSettingsStylesFontFamily" => $this->extensions['MailPoet\Twig\I18n']->translate("Font Family"), "formFontsDefaultTheme" => $this->extensions['MailPoet\Twig\I18n']->translate("Theme’s default fonts"), "formFontsStandard" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Standard fonts", "Heading in the font selection list: Arial, Times, ..."), "formFontsCustom" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Custom fonts", "Heading in the font selection list for a list of custom fonts"), "blockSpacerHeight" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Height", "Settings in the spacer block"), "blockSpacerEnableDivider" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Enable Divider", "Settings in the spacer block"), "imagePlacementScale" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Scale", "How a background image will be rendered: scale, fit or tile"), "imagePlacementFit" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Fit", "How a background image will be rendered: scale, fit or tile"), "imagePlacementTile" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Tile", "How a background image will be rendered: scale, fit or tile"), "blockDividerStyle" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Divider Style", "Settings in the divider block (solid, dotted, …)"), "blockDividerStyleSolid" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Solid", "Setting in the divider block"), "blockDividerStyleDashed" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Dashed", "Setting in the divider block"), "blockDividerStyleDotted" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Dotted", "Setting in the divider block"), "blockDividerDividerHeight" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Divider Height", "Settings in the divider block"), "blockDividerDividerWidth" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Divider Width", "Settings in the divider block"), "blockDividerBackground" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Background", "Settings in the divider block"), "validationMessageColor" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Message Color", "heading above the settings"), "successValidationColorTitle" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Success", "A label for the success message color"), "errorValidationColorTitle" => $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Error", "A label for the error message color"), "formPreviewOthersDisclaimer" => $this->extensions['MailPoet\Twig\I18n']->translate("Psssst. We try our best to show you what the widget might look like, but better check the final result on your website."), "closeButtonHeading" => $this->extensions['MailPoet\Twig\I18n']->translate("Close Button Style"), "tutorialHeading" => $this->extensions['MailPoet\Twig\I18n']->translate("A video tour of the form editor"), "saveFormFirst" => $this->extensions['MailPoet\Twig\I18n']->translate("Please save the form first!"), "addNewTag" => $this->extensions['MailPoet\Twig\I18n']->translate("Add new tag")]);
        // line 228
        yield "
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "form/editor.html";
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
        return array (  176 => 228,  174 => 45,  168 => 41,  164 => 39,  160 => 38,  156 => 37,  152 => 36,  148 => 35,  144 => 34,  140 => 33,  136 => 32,  132 => 31,  128 => 30,  124 => 29,  120 => 28,  116 => 27,  112 => 26,  108 => 25,  104 => 24,  100 => 23,  96 => 22,  92 => 21,  88 => 20,  84 => 19,  80 => 18,  76 => 17,  72 => 16,  68 => 15,  64 => 14,  60 => 12,  51 => 4,  47 => 3,  36 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "form/editor.html", "/home/circleci/mailpoet/mailpoet/views/form/editor.html");
    }
}
