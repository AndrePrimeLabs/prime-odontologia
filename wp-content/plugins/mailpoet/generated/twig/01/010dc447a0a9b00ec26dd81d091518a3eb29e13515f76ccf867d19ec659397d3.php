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

/* newsletter/templates/blocks/dynamicProducts/settings.hbs */
class __TwigTemplate_9955ae09589f4be81c495470322b15a2517bda533435058dd6c28ae1f562234b extends Template
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
        yield "<h3>";
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Product selection");
        yield "</h3>

<div class=\"mailpoet_form_field\">
    <div class=\"mailpoet_form_field_title mailpoet_form_field_title_inline\">";
        // line 4
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Show max:");
        yield "</div>
    <div class=\"mailpoet_form_field_input_option\">
        <input type=\"text\" class=\"mailpoet_input mailpoet_input_small mailpoet_dynamic_products_show_amount\" value=\"{{ model.amount }}\" maxlength=\"2\" size=\"2\" data-automation-id=\"show_max_posts\" />
        <select class=\"mailpoet_select mailpoet_select_large mailpoet_dynamic_products_content_type\">
            <option value=\"product\" {{#ifCond model.contentType '==' 'product'}}SELECTED{{/ifCond}}>";
        // line 8
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Products");
        yield "</option>
        </select>
    </div>
</div>


<div class=\"mailpoet_form_field\">
    <div class=\"mailpoet_form_field_radio_option mailpoet_form_field_block\">
        <label>
            <input type=\"radio\" name=\"mailpoet_dynamic_products_dynamic_products_type\" class=\"mailpoet_dynamic_products_dynamic_products_type\" value=\"order\" {{#ifCond model.dynamicProductsType '==' 'order'}}CHECKED{{/ifCond}}/>
            ";
        // line 18
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Order products");
        yield "
        </label>
    </div>
    <div class=\"mailpoet_form_field_radio_option mailpoet_form_field_block\">
        <label>
            <input type=\"radio\" name=\"mailpoet_dynamic_products_dynamic_products_type\" class=\"mailpoet_dynamic_products_dynamic_products_type\" value=\"cross-sell\" {{#ifCond model.dynamicProductsType '==' 'cross-sell'}}CHECKED{{/ifCond}}/>
            ";
        // line 24
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Cross-sell products");
        yield "
        </label>
    </div>
    <div class=\"mailpoet_form_field_radio_option mailpoet_form_field_block\">
        <label>
            <input type=\"radio\" name=\"mailpoet_dynamic_products_dynamic_products_type\" class=\"mailpoet_dynamic_products_dynamic_products_type\" value=\"cart\" {{#ifCond model.dynamicProductsType '==' 'cart'}}CHECKED{{/ifCond}}/>
            ";
        // line 30
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Abandoned cart products");
        yield "
        </label>
    </div>
    <div class=\"mailpoet_form_field_radio_option mailpoet_form_field_block\">
        <label>
            <input type=\"radio\" name=\"mailpoet_dynamic_products_dynamic_products_type\" class=\"mailpoet_dynamic_products_dynamic_products_type\" value=\"selected\" {{#ifCond model.dynamicProductsType '==' 'selected'}}CHECKED{{/ifCond}}/>
            ";
        // line 36
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Selected products");
        yield "
        </label>
    </div>
</div>

<div class=\"mailpoet_dynamic_products_selected_products {{#ifCond model.dynamicProductsType '!=' 'selected'}}mailpoet_hidden{{/ifCond}}\">
    <div class=\"mailpoet_form_field\">
        <div class=\"mailpoet_form_field_select_option\">
            <select class=\"mailpoet_select mailpoet_dynamic_products_categories_and_tags\" multiple=\"multiple\">
            {{#each model.terms}}
                <option value=\"{{ id }}\" selected=\"selected\">{{ text }}</option>
            {{/each}}
            </select>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_include_or_exclude\" class=\"mailpoet_dynamic_products_include_or_exclude\" value=\"include\" {{#ifCond model.inclusionType '==' 'include'}}CHECKED{{/ifCond}}/>
                ";
        // line 53
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Include");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_include_or_exclude\" class=\"mailpoet_dynamic_products_include_or_exclude\" value=\"exclude\" {{#ifCond model.inclusionType '==' 'exclude'}}CHECKED{{/ifCond}} />
                ";
        // line 59
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Exclude");
        yield "
            </label>
        </div>
    </div>
</div>

<div class=\"mailpoet_form_field\">
    <div class=\"mailpoet_form_field_checkbox_option\">
        <label>
            <input type=\"checkbox\" name=\"mailpoet_dynamic_products_exclude_out_of_stock\" class=\"mailpoet_dynamic_products_exclude_out_of_stock\" value=\"true\" {{#if model.excludeOutOfStock}}CHECKED{{/if}}/>
            ";
        // line 69
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Exclude out-of-stock products");
        yield "
        </label>
    </div>
</div>

<hr class=\"mailpoet_separator\" />


<div class=\"mailpoet_form_field\">
    <a href=\"javascript:;\" class=\"mailpoet_dynamic_products_show_display_options\" data-automation-id=\"display_options\">
      {{#if _displayOptionsHidden}}
        ";
        // line 80
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Display options");
        yield "
      {{else}}
        ";
        // line 82
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Hide display options");
        yield "
      {{/if}}
    </a>
</div>
<div class=\"mailpoet_dynamic_products_display_options {{#if _displayOptionsHidden}}mailpoet_closed{{/if}}\">
    <div class=\"mailpoet_form_field\">
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_display_type\" class=\"mailpoet_dynamic_products_display_type\" value=\"titleOnly\" {{#ifCond model.displayType '==' 'titleOnly'}}CHECKED{{/ifCond}}/>
                ";
        // line 91
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Title only");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_display_type\" class=\"mailpoet_dynamic_products_display_type\" value=\"excerpt\" {{#ifCond model.displayType '==' 'excerpt'}}CHECKED{{/ifCond}}/>
                ";
        // line 97
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Title and a short description");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_display_type\" class=\"mailpoet_dynamic_products_display_type\" value=\"full\" {{#ifCond model.displayType '==' 'full'}}CHECKED{{/ifCond}} />
                ";
        // line 103
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Title and description");
        yield "
            </label>
        </div>
    </div>

    <hr class=\"mailpoet_separator\" />

    <div class=\"mailpoet_form_field\">
        <div class=\"mailpoet_form_field_title\">";
        // line 111
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Title Format");
        yield "</div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_format\" class=\"mailpoet_dynamic_products_title_format\" value=\"h1\" {{#ifCond model.titleFormat '==' 'h1'}}CHECKED{{/ifCond}}/>
                ";
        // line 115
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Heading 1");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_format\" class=\"mailpoet_dynamic_products_title_format\" value=\"h2\" {{#ifCond model.titleFormat '==' 'h2'}}CHECKED{{/ifCond}}/>
                ";
        // line 121
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Heading 2");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_format\" class=\"mailpoet_dynamic_products_title_format\" value=\"h3\" {{#ifCond model.titleFormat '==' 'h3'}}CHECKED{{/ifCond}}/>
                ";
        // line 127
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Heading 3");
        yield "
            </label>
        </div>
    </div>

    <div class=\"mailpoet_form_field\">
        <div class=\"mailpoet_form_field_title\">";
        // line 133
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Title Alignment");
        yield "</div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_alignment\" class=\"mailpoet_dynamic_products_title_alignment\" value=\"left\" {{#ifCond model.titleAlignment '==' 'left'}}CHECKED{{/ifCond}} />
                ";
        // line 137
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Left");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_alignment\" class=\"mailpoet_dynamic_products_title_alignment\" value=\"center\" {{#ifCond model.titleAlignment '==' 'center'}}CHECKED{{/ifCond}} />
                ";
        // line 143
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Center");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_alignment\" class=\"mailpoet_dynamic_products_title_alignment\" value=\"right\" {{#ifCond model.titleAlignment '==' 'right'}}CHECKED{{/ifCond}} />
                ";
        // line 149
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Right");
        yield "
            </label>
        </div>
    </div>

    <div class=\"mailpoet_form_field\">
        <div class=\"mailpoet_form_field_title\">";
        // line 155
        yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Make the product title into a link", "Display the product title into a link");
        yield "</div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_as_links\" class=\"mailpoet_dynamic_products_title_as_links\" value=\"true\" {{#if model.titleIsLink}}CHECKED{{/if}}/>
                ";
        // line 159
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Yes");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_as_links\" class=\"mailpoet_dynamic_products_title_as_links\" value=\"false\" {{#unless model.titleIsLink}}CHECKED{{/unless}}/>
                ";
        // line 165
        yield $this->extensions['MailPoet\Twig\I18n']->translate("No");
        yield "
            </label>
        </div>
    </div>

    <hr class=\"mailpoet_separator\" />

    <div class=\"mailpoet_form_field mailpoet_dynamic_products_title_position {{#ifCond model.displayType '===' 'titleOnly'}}mailpoet_hidden{{/ifCond}}\">
        <div class=\"mailpoet_form_field_title\">";
        // line 173
        yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Product title position", "Setting in the email designer to position an ecommerce product title");
        yield "</div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_position\" class=\"mailpoet_dynamic_products_title_position\" value=\"abovePost\" {{#ifCond model.titlePosition '!=' 'aboveExcerpt'}}CHECKED{{/ifCond}}/>
                ";
        // line 177
        yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Above the product", "Display the product title above the product block");
        yield "
            </label>
        </div>
        <div class=\"mailpoet_form_field_radio_option\">
            <label>
                <input type=\"radio\" name=\"mailpoet_dynamic_products_title_position\" class=\"mailpoet_dynamic_products_title_position\" value=\"aboveExcerpt\" {{#ifCond model.titlePosition '==' 'aboveExcerpt'}}CHECKED{{/ifCond}}/>
                ";
        // line 183
        yield $this->extensions['MailPoet\Twig\I18n']->translateWithContext("Above the product description", "Display the product title above the product description");
        yield "
            </label>
        </div>
    </div>

    <hr class=\"mailpoet_separator mailpoet_dynamic_products_title_position_separator {{#ifCond model.displayType '===' 'titleOnly'}}mailpoet_hidden{{/ifCond}}\" />

    <div> <!-- empty div for better git diff -->
        <div class=\"mailpoet_form_field mailpoet_dynamic_products_featured_image_position_container\">
            <div class=\"mailpoet_form_field_title\">";
        // line 192
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Product image position");
        yield "</div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_featured_image_position\" class=\"mailpoet_dynamic_products_featured_image_position\" value=\"centered\" {{#ifCond model.featuredImagePosition '==' 'centered' }}CHECKED{{/ifCond}}/>
                    ";
        // line 196
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Centered");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_featured_image_position\" class=\"mailpoet_dynamic_products_featured_image_position\" value=\"left\" {{#ifCond model.featuredImagePosition '==' 'left' }}CHECKED{{/ifCond}}/>
                    ";
        // line 202
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Left");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_featured_image_position\" class=\"mailpoet_dynamic_products_featured_image_position\" value=\"right\" {{#ifCond model.featuredImagePosition '==' 'right' }}CHECKED{{/ifCond}}/>
                    ";
        // line 208
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Right");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_featured_image_position\" class=\"mailpoet_dynamic_products_featured_image_position\" value=\"alternate\" {{#ifCond model.featuredImagePosition '==' 'alternate' }}CHECKED{{/ifCond}}/>
                    ";
        // line 214
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Alternate");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_featured_image_position\" class=\"mailpoet_dynamic_products_featured_image_position\" value=\"none\" {{#ifCond model.featuredImagePosition '==' 'none' }}CHECKED{{/ifCond}}/>
                    ";
        // line 220
        yield $this->extensions['MailPoet\Twig\I18n']->translate("None");
        yield "
                </label>
            </div>
        </div>

        <div class=\"mailpoet_form_field mailpoet_dynamic_products_image_full_width_option {{#ifCond model.displayType '==' 'titleOnly'}}mailpoet_hidden{{/ifCond}}\">
            <div class=\"mailpoet_form_field_title\">";
        // line 226
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Image width");
        yield "</div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"imageFullWidth\" class=\"mailpoet_dynamic_products_image_full_width\" value=\"true\" {{#if model.imageFullWidth}}CHECKED{{/if}}/>
                    ";
        // line 230
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Full width");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"imageFullWidth\" class=\"mailpoet_dynamic_products_image_full_width\" value=\"false\" {{#unless model.imageFullWidth}}CHECKED{{/unless}}/>
                    ";
        // line 236
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Padded");
        yield "
                </label>
            </div>
        </div>

        <hr class=\"mailpoet_separator\" />

        <div class=\"mailpoet_form_field\">
            <div class=\"mailpoet_form_field_title\">";
        // line 244
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Price");
        yield "</div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_price_position\" class=\"mailpoet_dynamic_products_price_position\" value=\"below\" {{#ifCond model.pricePosition '==' 'below'}}CHECKED{{/ifCond}} />
                    ";
        // line 248
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Below text");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_price_position\" class=\"mailpoet_dynamic_products_price_position\" value=\"above\" {{#ifCond model.pricePosition '==' 'above'}}CHECKED{{/ifCond}} />
                    ";
        // line 254
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Above text");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_price_position\" class=\"mailpoet_dynamic_products_price_position\" value=\"hidden\" {{#ifCond model.pricePosition '==' 'hidden'}}CHECKED{{/ifCond}} />
                    ";
        // line 260
        yield $this->extensions['MailPoet\Twig\I18n']->translate("No");
        yield "
                </label>
            </div>
        </div>

        <hr class=\"mailpoet_separator\" />

        <div class=\"mailpoet_form_field\">
            <div class=\"mailpoet_form_field_title\">";
        // line 268
        yield $this->extensions['MailPoet\Twig\I18n']->translate("\"Buy now\" text");
        yield "</div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_read_more_type\" class=\"mailpoet_dynamic_products_read_more_type\" value=\"link\" {{#ifCond model.readMoreType '==' 'link'}}CHECKED{{/ifCond}}/>
                    ";
        // line 272
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Link");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_read_more_type\" class=\"mailpoet_dynamic_products_read_more_type\" value=\"button\" {{#ifCond model.readMoreType '==' 'button'}}CHECKED{{/ifCond}}/>
                    ";
        // line 278
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Button");
        yield "
                </label>
            </div>

            <div class=\"mailpoet_form_field_input_option mailpoet_form_field_block\">
                <input type=\"text\" class=\"mailpoet_input mailpoet_input_full mailpoet_dynamic_products_read_more_text {{#ifCond model.readMoreType '!=' 'link'}}mailpoet_hidden{{/ifCond}}\" value=\"{{ model.readMoreText }}\" />
            </div>

            <div class=\"mailpoet_form_field_input_option mailpoet_form_field_block\">
                <a href=\"javascript:;\" class=\"mailpoet_dynamic_products_select_button {{#ifCond model.readMoreType '!=' 'button'}}mailpoet_hidden{{/ifCond}}\">";
        // line 287
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Design a button");
        yield "</a>
            </div>
        </div>

        <hr class=\"mailpoet_separator\" />

        <div class=\"mailpoet_form_field\">
            <div class=\"mailpoet_form_field_title\">";
        // line 294
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Show divider between products");
        yield "</div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_show_divider\" class=\"mailpoet_dynamic_products_show_divider\" value=\"true\" {{#if model.showDivider}}CHECKED{{/if}}/>
                    ";
        // line 298
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Yes");
        yield "
                </label>
            </div>
            <div class=\"mailpoet_form_field_radio_option\">
                <label>
                    <input type=\"radio\" name=\"mailpoet_dynamic_products_show_divider\" class=\"mailpoet_dynamic_products_show_divider\" value=\"false\" {{#unless model.showDivider}}CHECKED{{/unless}}/>
                    ";
        // line 304
        yield $this->extensions['MailPoet\Twig\I18n']->translate("No");
        yield "
                </label>
            </div>
            <div>
                <a href=\"javascript:;\" class=\"mailpoet_dynamic_products_select_divider\">";
        // line 308
        yield $this->extensions['MailPoet\Twig\I18n']->translate("Select divider");
        yield "</a>
            </div>
        </div>
    </div>
</div>

<div class=\"mailpoet_form_field\">
    <input type=\"button\" data-automation-id=\"dp_settings_done\" class=\"button button-primary mailpoet_done_editing\" value=\"";
        // line 315
        yield $this->env->getRuntime('MailPoetVendor\Twig\Runtime\EscaperRuntime')->escape($this->extensions['MailPoet\Twig\I18n']->translate("Done"), "html_attr");
        yield "\" />
</div>
";
        return; yield '';
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTemplateName()
    {
        return "newsletter/templates/blocks/dynamicProducts/settings.hbs";
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
        return array (  503 => 315,  493 => 308,  486 => 304,  477 => 298,  470 => 294,  460 => 287,  448 => 278,  439 => 272,  432 => 268,  421 => 260,  412 => 254,  403 => 248,  396 => 244,  385 => 236,  376 => 230,  369 => 226,  360 => 220,  351 => 214,  342 => 208,  333 => 202,  324 => 196,  317 => 192,  305 => 183,  296 => 177,  289 => 173,  278 => 165,  269 => 159,  262 => 155,  253 => 149,  244 => 143,  235 => 137,  228 => 133,  219 => 127,  210 => 121,  201 => 115,  194 => 111,  183 => 103,  174 => 97,  165 => 91,  153 => 82,  148 => 80,  134 => 69,  121 => 59,  112 => 53,  92 => 36,  83 => 30,  74 => 24,  65 => 18,  52 => 8,  45 => 4,  38 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "newsletter/templates/blocks/dynamicProducts/settings.hbs", "/home/circleci/mailpoet/mailpoet/views/newsletter/templates/blocks/dynamicProducts/settings.hbs");
    }
}
