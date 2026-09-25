<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium\Templates;

if (!defined('ABSPATH')) exit;


use MailPoet\Automation\Engine\Data\Automation;
use MailPoet\Automation\Engine\Data\AutomationTemplate;
use MailPoet\Automation\Engine\Data\NextStep;
use MailPoet\Automation\Engine\Data\Step;
use MailPoet\Automation\Engine\Templates\AutomationBuilder;
use MailPoet\Automation\Integrations\WooCommerce\WooCommerce;
use MailPoet\Tags\TagRepository;
use MailPoet\WooCommerce\Helper as WooCommerceHelper;
use MailPoet\WooCommerce\WooCommerceBookings\Helper as WooCommerceBookingsHelper;
use MailPoet\WP\Functions as WPFunctions;

class PremiumTemplatesFactory {
  private const MIN_WOOCOMMERCE_VERSION_FOR_GENERATED_COUPON_BLOCK = '10.8.0';

  /** @var AutomationBuilder */
  private $builder;

  /** @var WooCommerce */
  private $woocommerce;

  /** @var PremiumEmailFactory */
  private $emailFactory;

  /** @var WooCommerceBookingsHelper */
  private $woocommerceBookingsHelper;

  /** @var WooCommerceHelper */
  private $woocommerceHelper;

  /** @var TagRepository */
  private $tagRepository;

  /** @var WPFunctions */
  private $wp;

  public function __construct(
    AutomationBuilder $builder,
    WooCommerce $woocommerce,
    PremiumEmailFactory $emailFactory,
    WooCommerceBookingsHelper $woocommerceBookingsHelper,
    WooCommerceHelper $woocommerceHelper,
    TagRepository $tagRepository,
    WPFunctions $wp
  ) {
    $this->builder = $builder;
    $this->woocommerce = $woocommerce;
    $this->emailFactory = $emailFactory;
    $this->woocommerceBookingsHelper = $woocommerceBookingsHelper;
    $this->woocommerceHelper = $woocommerceHelper;
    $this->tagRepository = $tagRepository;
    $this->wp = $wp;
  }

  /** @return AutomationTemplate[] */
  public function createTemplates(): array {
    $templates = [
      $this->createSubscriberWelcomeSeriesTemplate(),
      $this->createUserWelcomeSeriesTemplate(),
    ];

    if ($this->woocommerce->isWooCommerceActive()) {
      $templates[] = $this->createThankLoyalCustomersTemplate();
      $templates[] = $this->createWinBackInactiveCustomersTemplate();
      $templates[] = $this->createAbandonedCartCampaignTemplate();
      if ($this->woocommerceHelper->wcSupportsOrderReviewUrl()) {
        $templates[] = $this->createAskForReviewTemplate();
      }
      $templates[] = $this->createFollowUpPositiveReviewTemplate();
      $templates[] = $this->createFollowUpNegativeReviewTemplate();
      $templates[] = $this->createRewardPositiveReviewersTemplate();
      $templates[] = $this->createAlertOnNegativeReviewsTemplate();
      $templates[] = $this->createCancelUnpaidOrdersTemplate();
      $templates[] = $this->createFollowUpAfterSubscriptionPurchaseTemplate();
      $templates[] = $this->createFollowUpAfterSubscriptionRenewalTemplate();
      $templates[] = $this->createFollowUpAfterFailedRenewalTemplate();
      $templates[] = $this->createFollowUpOnChurnedSubscriptionTemplate();
      $templates[] = $this->createFollowUpWhenTrialEndsTemplate();
      $templates[] = $this->createWinBackChurnedSubscribersTemplate();
      if ($this->woocommerceBookingsHelper->isWooCommerceBookingsActive()) {
        $templates[] = $this->createWcBookingAbandonedSpotTemplate();
        $templates[] = $this->createWcBookingNewBookingFollowUpTemplate();
        $templates[] = $this->createWcBookingPreVisitReminderTemplate();
        $templates[] = $this->createWcBookingPreVisitDripTemplate();
        $templates[] = $this->createWcBookingPostVisitReviewTemplate();
        $templates[] = $this->createWcBookingNextBookingNudgeTemplate();
      }
    }

    $templates[] = $this->createBirthdayEmailTemplate();

    return $templates;
  }

  private function createBirthdayEmailTemplate(): AutomationTemplate {
    $usesDiscountPattern = $this->woocommerce->isWooCommerceActive() && $this->supportsGeneratedCouponBlock();

    return new AutomationTemplate(
      'birthday-email',
      'celebrations',
      __('Birthday email', 'mailpoet-premium'),
      __('Send a birthday email to your subscribers on their special day.', 'mailpoet-premium'),
      function (bool $preview = false) use ($usesDiscountPattern): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          $usesDiscountPattern ? 'birthday-email-with-discount' : 'birthday-email-content',
          $usesDiscountPattern ? __('A birthday treat from us', 'mailpoet-premium') : __('Happy birthday!', 'mailpoet-premium'),
          $usesDiscountPattern ? __('A birthday treat from us', 'mailpoet-premium') : __('Happy birthday!', 'mailpoet-premium'),
          $usesDiscountPattern ? __('Enjoy 10% off your next order', 'mailpoet-premium') : __('Wishing you a wonderful day', 'mailpoet-premium'),
          'birthday-email'
        );

        return $this->builder->createFromSequence(
          __('Birthday email', 'mailpoet-premium'),
          [
            ['key' => 'mailpoet:annual-date'],
            ['key' => 'mailpoet:send-email', 'args' => $emailArgs],
          ]
        );
      },
      [
        'automationSteps' => 1,
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createSubscriberWelcomeSeriesTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'subscriber-welcome-series',
      'welcome',
      __('Welcome series for new subscribers', 'mailpoet-premium'),
      __(
        'Welcome new subscribers and start building a relationship with them. Send an email immediately after someone subscribes to your list to introduce your brand and a follow-up two days later to keep the conversation going.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $welcomeEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'welcome-email-content',
          __('Welcome email', 'mailpoet-premium'),
          __('Welcome to our community!', 'mailpoet-premium'),
          __('Thanks for subscribing', 'mailpoet-premium'),
          'subscriber-welcome-series'
        );
        $followUpEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'educational-campaign',
          __('Follow-up email', 'mailpoet-premium'),
          __('Here’s what to expect', 'mailpoet-premium'),
          __('Learn more about us', 'mailpoet-premium'),
          'subscriber-welcome-series'
        );
        return $this->builder->createFromSequence(
          __('Welcome series for new subscribers', 'mailpoet-premium'),
          [
            ['key' => 'mailpoet:someone-subscribes'],
            ['key' => 'mailpoet:send-email', 'args' => $welcomeEmailArgs],
            ['key' => 'core:delay', 'args' => ['delay' => 2, 'delay_type' => 'DAYS']],
            ['key' => 'mailpoet:send-email', 'args' => $followUpEmailArgs],
          ],
          [
            'mailpoet:run-once-per-subscriber' => true,
          ]
        );
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  /**
   * This is a sample automation template which uses email templates.
   * It should be removed when we have real email templates.
   * It is not a real automation template and is not available in the UI.
   */
  public function createSampleEmailTemplateSeriesTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'sample-email-series',
      'welcome',
      __('Sample email series', 'mailpoet-premium'),
      __(
        'A sample automation template with email templates.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailId1 = $preview ? null : $this->emailFactory->createEmail([
          'subject' => __('Welcome to our newsletter!', 'mailpoet-premium'),
          'preheader' => __('Thanks for subscribing', 'mailpoet-premium'),
          'template' => 'premium-sample-1',
        ]);

        $emailId2 = $preview ? null : $this->emailFactory->createEmail([
          'subject' => __('Here’s what to expect', 'mailpoet-premium'),
          'preheader' => __('Learn more about us', 'mailpoet-premium'),
          'template' => 'premium-sample-2',
        ]);

        $emailId3 = $preview ? null : $this->emailFactory->createEmail([
          'subject' => __('A special offer just for you', 'mailpoet-premium'),
          'preheader' => __('Enjoy this discount', 'mailpoet-premium'),
          'template' => 'premium-sample-3',
        ]);

        return $this->builder->createFromSequence(
          __('Sample email series', 'mailpoet-premium'),
          [
            ['key' => 'mailpoet:someone-subscribes'],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'HOURS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => [
                'name' => __('Welcome email', 'mailpoet-premium'),
                'email_id' => $emailId1,
              ],
            ],
            ['key' => 'core:delay', 'args' => ['delay' => 2, 'delay_type' => 'DAYS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => [
                'name' => __('Introduction email', 'mailpoet-premium'),
                'email_id' => $emailId2,
              ],
            ],
            ['key' => 'core:delay', 'args' => ['delay' => 5, 'delay_type' => 'DAYS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => [
                'name' => __('Special offer email', 'mailpoet-premium'),
                'email_id' => $emailId3,
              ],
            ],
          ],
          [
            'mailpoet:run-once-per-subscriber' => true,
          ]
        );
      },
      [
        'automationSteps' => 3, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_PREMIUM
    );
  }

  private function createUserWelcomeSeriesTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'user-welcome-series',
      'welcome',
      __('Welcome series for new WordPress users', 'mailpoet-premium'),
      __(
        'Welcome new WordPress users to your site. Send an email immediately after a WordPress user registers. Send a follow-up email two days later with more in-depth information.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $welcomeEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'welcome-email-content',
          __('Welcome email', 'mailpoet-premium'),
          __('Welcome to our community!', 'mailpoet-premium'),
          __('Thanks for joining us', 'mailpoet-premium'),
          'user-welcome-series'
        );
        $followUpEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'educational-campaign',
          __('Follow-up email', 'mailpoet-premium'),
          __('Here’s what to expect', 'mailpoet-premium'),
          __('Learn more about us', 'mailpoet-premium'),
          'user-welcome-series'
        );
        return $this->builder->createFromSequence(
          __('Welcome series for new WordPress users', 'mailpoet-premium'),
          [
            ['key' => 'mailpoet:wp-user-registered'],
            ['key' => 'mailpoet:send-email', 'args' => $welcomeEmailArgs],
            ['key' => 'core:delay', 'args' => ['delay' => 2, 'delay_type' => 'DAYS']],
            ['key' => 'mailpoet:send-email', 'args' => $followUpEmailArgs],
          ],
          [
            'mailpoet:run-once-per-subscriber' => true,
          ]
        );
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createThankLoyalCustomersTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'thank-loyal-customers',
      'purchase',
      __('Thank loyal customers', 'mailpoet-premium'),
      __(
        'These are your most important customers. Make them feel special by sending a thank you note for supporting your brand.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'post-purchase-thank-you',
          __('Thank you for your loyalty', 'mailpoet-premium'),
          __('Thank you for your loyalty', 'mailpoet-premium'),
          __('We appreciate your continued support', 'mailpoet-premium'),
          'thank-loyal-customers'
        );

        return $this->builder->createFromSequence(
          __('Thank loyal customers', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce:order-completed',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:customer:order-count',
                        'condition' => 'greater-than',
                        'value' => 5,
                        'params' => ['in_the_last' => ['number' => 365, 'unit' => 'days']],
                      ],
                    ],
                  ],
                ],
              ],
            ],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'DAYS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ],
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      // This template is available from the Basic plan, although judged solely by capabilities,
      // it would've been eligible for the Free plan. Keeping TYPE_PREMIUM allows us to exclude
      // it from the Free plan (= if tier is 0 and it's a premium template, it will be excluded).
      AutomationTemplate::TYPE_PREMIUM
    );
  }

  private function createWinBackInactiveCustomersTemplate(): AutomationTemplate {
    $supportsGeneratedCouponBlock = $this->supportsGeneratedCouponBlock();

    return new AutomationTemplate(
      'win-back-inactive-customers',
      'purchase',
      __('Win back inactive customers', 'mailpoet-premium'),
      $supportsGeneratedCouponBlock
        ? __(
          'Re-engage customers who haven’t purchased in 30 days. Sends a reminder, waits 14 days, then offers a discount if they still haven’t returned.',
          'mailpoet-premium'
        )
        : __(
          'Re-engage customers who haven’t purchased in 30 days. Sends a reminder, waits 14 days, then follows up with recommended products if they still haven’t returned.',
          'mailpoet-premium'
        ),
      function (bool $preview = false) use ($supportsGeneratedCouponBlock): Automation {
        $reminderEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'win-back-customer-reminder',
          __('We miss you', 'mailpoet-premium'),
          __('We miss you', 'mailpoet-premium'),
          __('Fresh picks are waiting for you', 'mailpoet-premium'),
          'win-back-inactive-customers'
        );
        $followUpEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          $supportsGeneratedCouponBlock ? 'win-back-customer' : 'win-back-customer-final-nudge',
          $supportsGeneratedCouponBlock
            ? __('Here’s 15% off to welcome you back', 'mailpoet-premium')
            : __('Still thinking it over?', 'mailpoet-premium'),
          $supportsGeneratedCouponBlock
            ? __('Here’s 15% off to welcome you back', 'mailpoet-premium')
            : __('Still thinking it over?', 'mailpoet-premium'),
          $supportsGeneratedCouponBlock
            ? __('Your limited-time welcome-back offer', 'mailpoet-premium')
            : __('Fresh picks are waiting', 'mailpoet-premium'),
          'win-back-inactive-customers'
        );
        $tagIds = $this->getTemplateTagIds($preview, ['re-engaged']);
        $automation = $this->builder->createFromSequence(
          __('Win back inactive customers', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce:customer-win-back', 'args' => ['days_since_last_purchase' => 30]],
            ['key' => 'mailpoet:send-email', 'args' => $reminderEmailArgs],
            ['key' => 'core:delay', 'args' => ['delay' => 14, 'delay_type' => 'DAYS']],
            [
              'key' => 'core:if-else',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:customer:order-count',
                        'condition' => 'greater-than',
                        'value' => 0,
                        'params' => ['in_the_last' => ['number' => 14, 'unit' => 'days']],
                      ],
                    ],
                  ],
                ],
              ],
            ],
            ['key' => 'mailpoet:add-tag', 'args' => ['tag_ids' => $tagIds, 'skip_triggers' => false]],
            ['key' => 'mailpoet:send-email', 'args' => $followUpEmailArgs],
          ],
          [
            'mailpoet:run-once-per-subscriber' => true,
          ]
        );

        $this->setBranchingSteps($automation, 3, 4, 5);
        return $automation;
      },
      [
        'automationSteps' => 5, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT,
      'people'
    );
  }

  private function createAbandonedCartCampaignTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'abandoned-cart-campaign',
      'abandoned-cart',
      __('Abandoned cart campaign', 'mailpoet-premium'),
      __(
        'Encourage your potential customers to finalize their purchase when they have added items to their cart but haven’t finished the order yet. Offer a coupon code as a last resort to convert them to customers.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $firstReminderEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'abandoned-cart-content',
          __('It looks like you left something behind…', 'mailpoet-premium'),
          __('It looks like you left something behind…', 'mailpoet-premium'),
          __('Complete your purchase today', 'mailpoet-premium'),
          'abandoned-cart-campaign'
        );
        $secondReminderEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'abandoned-cart-reminder-content',
          __('Your cart is waiting', 'mailpoet-premium'),
          __('Your cart is waiting', 'mailpoet-premium'),
          __('Your items are still waiting', 'mailpoet-premium'),
          'abandoned-cart-campaign'
        );
        $supportsGeneratedCouponBlock = $this->supportsGeneratedCouponBlock();
        $discountEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          $supportsGeneratedCouponBlock ? 'abandoned-cart-with-discount-content' : 'abandoned-cart-content',
          $supportsGeneratedCouponBlock
            ? __('Your cart is waiting, and so is your 10% off!', 'mailpoet-premium')
            : __('Your cart is still waiting', 'mailpoet-premium'),
          $supportsGeneratedCouponBlock
            ? __('Your cart is waiting, and so is your 10% off!', 'mailpoet-premium')
            : __('Your cart is still waiting', 'mailpoet-premium'),
          $supportsGeneratedCouponBlock
            ? __('A special discount awaits you', 'mailpoet-premium')
            : __('Your items are still waiting', 'mailpoet-premium'),
          'abandoned-cart-campaign'
        );

        $automation = $this->builder->createFromSequence(
          __('Abandoned cart campaign', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce:abandoned-cart', 'args' => ['wait' => 60]],
            [
              'key' => 'mailpoet:send-email',
              'args' => $firstReminderEmailArgs,
            ],
            ['key' => 'core:delay', 'args' => ['delay' => 23, 'delay_type' => 'HOURS']],
            [
              'key' => 'core:if-else',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:customer:order-count',
                        'condition' => 'equals',
                        'value' => 0,
                        'params' => ['in_the_last' => ['number' => 1 , 'unit' => 'days']],
                      ],
                    ],
                  ],
                ],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $secondReminderEmailArgs,
            ],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'DAYS']],
            [
              'key' => 'core:if-else',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:customer:order-count',
                        'condition' => 'equals',
                        'value' => 0,
                        'params' => ['in_the_last' => ['number' => 1, 'unit' => 'days']],
                      ],
                      [
                        'field' => 'woocommerce:cart:cart-total',
                        'condition' => 'greater-than',
                        'value' => 100,
                      ],
                    ],
                  ],
                ],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $discountEmailArgs,
            ],
          ]
        );

        foreach ($automation->getSteps() as $step) {
          if ($step->getKey() === 'core:if-else') {
            $step->setNextSteps(array_merge($step->getNextSteps(), [new NextStep(null)]));
          }
        }
        return $automation;
      },
      [
        'automationSteps' => 5, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createAskForReviewTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'ask-for-review',
      'review',
      __('Ask to leave a review post-purchase', 'mailpoet-premium'),
      __(
        'Encourage your customers to leave a review a few days after their purchase. Show them their opinion matters.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = [
          'name' => __('How was your experience?', 'mailpoet-premium'),
          'subject' => __('How was your experience?', 'mailpoet-premium'),
          'preheader' => __('We’d love your feedback', 'mailpoet-premium'),
        ];

        if ($preview) {
          $emailArgs['pattern'] = 'ask-for-review-post-purchase';
        }

        if (!$preview) {
          $emailIds = $this->emailFactory->createBlockEditorEmail([
            'pattern' => 'ask-for-review-post-purchase',
            'subject' => $emailArgs['subject'],
            'preheader' => $emailArgs['preheader'],
          ]);
          if (
            !is_array($emailIds)
            || !is_int($emailIds['email_id'] ?? null)
            || !is_int($emailIds['email_wp_post_id'] ?? null)
          ) {
            throw new \RuntimeException('Could not create the ask-for-review block editor email.');
          }
          $emailArgs = array_merge($emailArgs, $emailIds);
        }

        $automation = $this->builder->createFromSequence(
          __('Ask to leave a review post-purchase', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce:order-completed',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:customer:review-count',
                        'condition' => 'equals',
                        'value' => 0,
                      ],
                    ],
                  ],
                ],
              ],
            ],
            ['key' => 'core:delay', 'args' => ['delay' => 14, 'delay_type' => 'DAYS']],
            [
              'key' => 'core:if-else',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:customer:review-count',
                        'condition' => 'equals',
                        'value' => 0,
                      ],
                    ],
                  ],
                ],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );

        foreach ($automation->getSteps() as $step) {
          if ($step->getKey() === 'core:if-else') {
            $step->setNextSteps(array_merge($step->getNextSteps(), [new NextStep(null)]));
          }
        }
        return $automation;
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createFollowUpPositiveReviewTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'follow-up-positive-review',
      'review',
      __('Follow up on a positive review (4-5 stars)', 'mailpoet-premium'),
      __(
        'Thank your happy customers for their feedback and let them know you appreciate their support.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'positive-review-follow-up',
          __('Thanks for your review!', 'mailpoet-premium'),
          __('Thanks for your review!', 'mailpoet-premium'),
          __('We’re thrilled you had a good experience', 'mailpoet-premium'),
          'follow-up-positive-review'
        );

        return $this->builder->createFromSequence(
          __('Follow up on a positive review (4-5 stars)', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce:made-a-review',
              'args' => [
                'rating' => [
                  'is_active' => true,
                  'from' => 4,
                  'to' => 5,
                ],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createFollowUpNegativeReviewTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'follow-up-negative-review',
      'review',
      __('Follow up on a negative review (1-2 stars)', 'mailpoet-premium'),
      __(
        'Reach out to unhappy customers and show you care. Offer help or gather more feedback to improve.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'negative-review-follow-up',
          __('Sorry to hear that – can we help?', 'mailpoet-premium'),
          __('Sorry to hear that – can we help?', 'mailpoet-premium'),
          __('Let’s make things right', 'mailpoet-premium'),
          'follow-up-negative-review'
        );

        return $this->builder->createFromSequence(
          __('Follow up on a negative review (1-2 stars)', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce:made-a-review',
              'args' => [
                'rating' => [
                  'is_active' => true,
                  'from' => 1,
                  'to' => 2,
                ],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createRewardPositiveReviewersTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'reward-positive-reviewers',
      'review',
      __('Reward positive reviewers', 'mailpoet-premium'),
      __('Thank customers who leave a 4 or 5-star review and offer a discount on their next order.', 'mailpoet-premium'),
      function (bool $preview = false): Automation {
        $supportsGeneratedCouponBlock = $this->supportsGeneratedCouponBlock();
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          $supportsGeneratedCouponBlock ? 'reward-positive-reviewer' : 'positive-review-follow-up',
          __('Thanks for your review', 'mailpoet-premium'),
          $supportsGeneratedCouponBlock
            ? __('Thanks for your review! Here’s a treat 🎁', 'mailpoet-premium')
            : __('Thanks for your review!', 'mailpoet-premium'),
          $supportsGeneratedCouponBlock
            ? __('Enjoy a discount on your next order', 'mailpoet-premium')
            : __('We’re thrilled you had a good experience', 'mailpoet-premium'),
          'reward-positive-reviewers'
        );
        $tagIds = $this->getTemplateTagIds($preview, ['left-positive-review']);

        return $this->builder->createFromSequence(
          __('Reward positive reviewers', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce:made-a-review',
              'args' => [
                'rating' => [
                  'is_active' => true,
                  'from' => 4,
                  'to' => 5,
                ],
              ],
            ],
            ['key' => 'mailpoet:send-email', 'args' => $emailArgs],
            ['key' => 'mailpoet:add-tag', 'args' => ['tag_ids' => $tagIds, 'skip_triggers' => false]],
          ]
        );
      },
      [
        'automationSteps' => 2,
      ],
      AutomationTemplate::TYPE_DEFAULT,
      'starFilled'
    );
  }

  private function createAlertOnNegativeReviewsTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'alert-on-negative-reviews',
      'review',
      __('Alert on negative reviews', 'mailpoet-premium'),
      __('Notify the store owner immediately when a customer leaves a 1 or 2-star review so they can respond quickly.', 'mailpoet-premium'),
      function (bool $preview = false): Automation {
        $adminEmail = (string)$this->wp->getOption('admin_email');
        $tagIds = $this->getTemplateTagIds($preview, ['left-negative-review']);

        return $this->builder->createFromSequence(
          __('Alert on negative reviews', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce:made-a-review',
              'args' => [
                'rating' => [
                  'is_active' => true,
                  'from' => 1,
                  'to' => 2,
                ],
              ],
            ],
            [
              'key' => 'mailpoet:notification-email',
              'args' => [
                'emails' => [$adminEmail],
                'subject' => __('Low review alert: {{ product.name }}', 'mailpoet-premium'),
                'email_text' => __(
                  "A low product review was posted.\n\nReviewer: {{ reviewer.name }}\nProduct: {{ product.name }}\nRating: {{ review.rating }}\nReview: {{ review.text }}\n\nOpen the review in WordPress admin: {{ review.admin_url }}",
                  'mailpoet-premium'
                ),
              ],
            ],
            ['key' => 'mailpoet:add-tag', 'args' => ['tag_ids' => $tagIds, 'skip_triggers' => false]],
          ]
        );
      },
      [
        'automationSteps' => 2,
      ],
      AutomationTemplate::TYPE_DEFAULT,
      'starFilled'
    );
  }

  private function createCancelUnpaidOrdersTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'cancel-unpaid-orders-after-3-days',
      'purchase',
      __('Cancel unpaid orders after 3 days', 'mailpoet-premium'),
      __('Automatically cancel orders that remain unpaid for 3 days. Adds a private note to the order explaining why it was cancelled.', 'mailpoet-premium'),
      function (): Automation {
        $automation = $this->builder->createFromSequence(
          __('Cancel unpaid orders after 3 days', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce:order-created'],
            ['key' => 'core:delay', 'args' => ['delay' => 3, 'delay_type' => 'DAYS']],
            [
              'key' => 'core:if-else',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:order:status',
                        'condition' => 'is-any-of',
                        'value' => ['pending', 'on-hold', 'failed'],
                      ],
                    ],
                  ],
                ],
              ],
            ],
            [
              'key' => 'woocommerce:change-order-status',
              'args' => [
                'target_status' => 'wc-cancelled',
              ],
            ],
            [
              'key' => 'woocommerce:add-order-note',
              'args' => [
                'note' => __('Order auto-cancelled by MailPoet after 3 days without payment.', 'mailpoet-premium'),
                'note_type' => 'private',
              ],
            ],
          ]
        );

        $this->setBranchingSteps($automation, 2, 3, null, false);
        return $automation;
      },
      [
        'automationSteps' => 4,
      ],
      AutomationTemplate::TYPE_DEFAULT,
      'store'
    );
  }

  private function createFollowUpAfterSubscriptionPurchaseTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'follow-up-after-subscription-purchase',
      'subscriptions',
      __('Follow up after a subscription purchase', 'mailpoet-premium'),
      __(
        'Thank new subscribers and let them know what to expect. A warm welcome goes a long way.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'subscription-purchase-follow-up',
          __('Welcome to your subscription', 'mailpoet-premium'),
          __('Welcome to your subscription', 'mailpoet-premium'),
          __('Here’s what happens next', 'mailpoet-premium'),
          'follow-up-after-subscription-purchase'
        );

        return $this->builder->createFromSequence(
          __('Follow up after a subscription purchase', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-subscriptions:subscription-created'],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'HOURS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createFollowUpAfterSubscriptionRenewalTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'follow-up-after-subscription-renewal',
      'subscriptions',
      __('Follow up after a subscription renewal', 'mailpoet-premium'),
      __(
        'Reinforce the value of your subscription by reminding customers what they’re getting after every renewal.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'subscription-renewal-follow-up',
          __('Your subscription renewed', 'mailpoet-premium'),
          __('Your subscription renewed successfully', 'mailpoet-premium'),
          __('Thanks for continuing with us', 'mailpoet-premium'),
          'follow-up-after-subscription-renewal'
        );

        return $this->builder->createFromSequence(
          __('Follow up after a subscription renewal', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-subscriptions:subscription-renewed'],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createFollowUpAfterFailedRenewalTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'follow-up-after-failed-renewal',
      'subscriptions',
      __('Follow up after failed renewal', 'mailpoet-premium'),
      __(
        'Help customers fix failed payments and continue their subscription without disruption.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'subscription-failed-renewal-follow-up',
          __('Subscription renewal needs attention', 'mailpoet-premium'),
          __('We couldn’t renew your subscription', 'mailpoet-premium'),
          __('Update your payment details to keep it active', 'mailpoet-premium'),
          'follow-up-after-failed-renewal'
        );

        return $this->builder->createFromSequence(
          __('Follow up after failed renewal', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-subscriptions:subscription-payment-failed'],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createFollowUpOnChurnedSubscriptionTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'follow-up-on-churned-subscription',
      'subscriptions',
      __('Follow up on churned subscription', 'mailpoet-premium'),
      __(
        'Reach out to subscribers who canceled and ask for their feedback to help improve your service.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'subscription-churned-follow-up',
          __('Subscription feedback request', 'mailpoet-premium'),
          __('Can we ask why you left?', 'mailpoet-premium'),
          __('Your feedback helps us improve', 'mailpoet-premium'),
          'follow-up-on-churned-subscription'
        );

        // Only follow up if the customer no longer has an active subscription
        // (they did not resubscribe in the meantime).
        $automation = $this->builder->createFromSequence(
          __('Follow up on churned subscription', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-subscriptions:subscription-expired'],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'DAYS']],
            $this->noActiveSubscriptionIfElse(),
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );

        $this->setBranchingSteps($automation, 2, 3, null);
        return $automation;
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createFollowUpWhenTrialEndsTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'follow-up-when-trial-ends',
      'subscriptions',
      __('Follow up when trial ends', 'mailpoet-premium'),
      __(
        'Check in with customers after their trial ends. Encourage them to keep enjoying the benefits of their subscription.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'subscription-trial-ended-follow-up',
          __('Trial follow-up', 'mailpoet-premium'),
          __('How was your trial?', 'mailpoet-premium'),
          __('Keep the benefits going', 'mailpoet-premium'),
          'follow-up-when-trial-ends'
        );

        // The trial-ended trigger fires whether or not the customer kept paying,
        // so only follow up when they have no active subscription.
        $automation = $this->builder->createFromSequence(
          __('Follow up when trial ends', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-subscriptions:trial-ended'],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'DAYS']],
            $this->noActiveSubscriptionIfElse(),
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );

        $this->setBranchingSteps($automation, 2, 3, null);
        return $automation;
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createWinBackChurnedSubscribersTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'win-back-churned-subscribers',
      'subscriptions',
      __('Win back churned subscribers', 'mailpoet-premium'),
      __(
        'Re-engage former subscribers by showing what’s new and why it’s worth coming back.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'subscription-win-back',
          __('Subscription win-back', 'mailpoet-premium'),
          __('Here’s what’s new since you left', 'mailpoet-premium'),
          __('We’d love to welcome you back', 'mailpoet-premium'),
          'win-back-churned-subscribers'
        );

        $automation = $this->builder->createFromSequence(
          __('Win back churned subscribers', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-subscriptions:subscription-expired'],
            ['key' => 'core:delay', 'args' => ['delay' => 30, 'delay_type' => 'DAYS']],
            [
              'key' => 'core:if-else',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce:customer:active-subscription-count',
                        'condition' => 'equals',
                        'value' => 0,
                      ],
                    ],
                  ],
                ],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );

        foreach ($automation->getSteps() as $step) {
          if ($step->getKey() === 'core:if-else') {
            $step->setNextSteps(array_merge($step->getNextSteps(), [new NextStep(null)]));
          }
        }
        return $automation;
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createWcBookingAbandonedSpotTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'wc-booking-abandoned-spot',
      'bookings',
      __('Abandoned booking reminder', 'mailpoet-premium'),
      __(
        'Remind customers who left a booking in their cart to complete their reservation.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'booking-abandoned-spot',
          __('Your spot is waiting', 'mailpoet-premium'),
          __('Your spot is waiting', 'mailpoet-premium'),
          __('Complete your booking', 'mailpoet-premium'),
          'wc-booking-abandoned-spot'
        );

        return $this->builder->createFromSequence(
          __('Abandoned booking reminder', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-bookings:booking-status-changed', 'args' => ['from' => 'any', 'to' => 'was-in-cart']],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'HOURS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createWcBookingNewBookingFollowUpTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'wc-booking-new-booking-follow-up',
      'bookings',
      __('Follow-up after a new booking', 'mailpoet-premium'),
      __(
        'Send a confirmation email after a new booking is created.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'booking-new-booking-follow-up',
          __('Booking confirmation', 'mailpoet-premium'),
          __('Your booking is confirmed', 'mailpoet-premium'),
          __('Your booking details are inside', 'mailpoet-premium'),
          'wc-booking-new-booking-follow-up'
        );

        // No delay: the email sends immediately on booking creation so it stays
        // transactional (a delay would turn the booking confirmation into a marketing email).
        return $this->builder->createFromSequence(
          __('Follow-up after a new booking', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-bookings:booking-created'],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createWcBookingPreVisitReminderTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'wc-booking-pre-visit-reminder',
      'bookings',
      __('Pre-visit reminder', 'mailpoet-premium'),
      __(
        'Send a reminder before a booking starts. Customize the timing in the trigger settings.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'booking-pre-visit-reminder',
          __('Pre-visit reminder', 'mailpoet-premium'),
          __('A reminder about your upcoming booking', 'mailpoet-premium'),
          __('Everything you need before your visit', 'mailpoet-premium'),
          'wc-booking-pre-visit-reminder'
        );

        return $this->builder->createFromSequence(
          __('Pre-visit reminder', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce-bookings:booking-starts',
              'args' => [
                'timing' => 'before',
                'time_value' => 1,
                'time_unit' => 'days',
                'booking_statuses' => ['confirmed', 'paid'],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createWcBookingPreVisitDripTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'wc-booking-pre-visit-drip',
      'bookings',
      __('Educational drip before booking', 'mailpoet-premium'),
      __(
        'Send a series of educational emails in the days before a booking starts to help customers prepare for their visit.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $whatToExpectEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'booking-pre-visit-what-to-expect',
          __('What to expect', 'mailpoet-premium'),
          __('What to expect at your booking', 'mailpoet-premium'),
          __('Everything you need before your visit', 'mailpoet-premium'),
          'wc-booking-pre-visit-drip'
        );
        $tipsEmailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'booking-pre-visit-tips',
          __('Booking tips', 'mailpoet-premium'),
          __('Make the most of your booking', 'mailpoet-premium'),
          __('Helpful tips before your visit', 'mailpoet-premium'),
          'wc-booking-pre-visit-drip'
        );
        // Anchored to the booking start (not its creation) so both emails always land
        // before the visit. Last-minute bookings created inside the window get nothing.
        return $this->builder->createFromSequence(
          __('Educational drip before booking', 'mailpoet-premium'),
          [
            [
              'key' => 'woocommerce-bookings:booking-starts',
              'args' => [
                'timing' => 'before',
                'time_value' => 3,
                'time_unit' => 'days',
                'booking_statuses' => ['confirmed', 'paid'],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $whatToExpectEmailArgs,
            ],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'DAYS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => $tipsEmailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createWcBookingPostVisitReviewTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'wc-booking-post-visit-review',
      'bookings',
      __('Post-booking review request', 'mailpoet-premium'),
      __(
        'Ask for feedback after a booking is completed.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'booking-post-visit-review',
          __('Booking review request', 'mailpoet-premium'),
          __('How was your booking?', 'mailpoet-premium'),
          __('We’d love your feedback', 'mailpoet-premium'),
          'wc-booking-post-visit-review'
        );

        return $this->builder->createFromSequence(
          __('Post-booking review request', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-bookings:booking-status-changed', 'args' => ['from' => 'any', 'to' => 'complete']],
            ['key' => 'core:delay', 'args' => ['delay' => 1, 'delay_type' => 'DAYS']],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );
      },
      [
        'automationSteps' => 1, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  private function createWcBookingNextBookingNudgeTemplate(): AutomationTemplate {
    return new AutomationTemplate(
      'wc-booking-next-booking-nudge',
      'bookings',
      __('Next booking nudge', 'mailpoet-premium'),
      __(
        'Encourage customers to rebook after their booking is completed.',
        'mailpoet-premium'
      ),
      function (bool $preview = false): Automation {
        $emailArgs = $this->createBlockEditorEmailArgs(
          $preview,
          'booking-next-booking-nudge',
          __('Next booking nudge', 'mailpoet-premium'),
          __('Ready for your next booking?', 'mailpoet-premium'),
          __('Book your next visit when you’re ready', 'mailpoet-premium'),
          'wc-booking-next-booking-nudge'
        );

        // Only nudge customers who have not booked again during the 30-day wait.
        $automation = $this->builder->createFromSequence(
          __('Next booking nudge', 'mailpoet-premium'),
          [
            ['key' => 'woocommerce-bookings:booking-status-changed', 'args' => ['from' => 'any', 'to' => 'complete']],
            ['key' => 'core:delay', 'args' => ['delay' => 30, 'delay_type' => 'DAYS']],
            [
              'key' => 'core:if-else',
              'filters' => [
                'operator' => 'and',
                'groups' => [
                  [
                    'operator' => 'and',
                    'filters' => [
                      [
                        'field' => 'woocommerce-bookings:customer:booking-count',
                        'condition' => 'equals',
                        'value' => 0,
                        'params' => ['in_the_last' => ['number' => 30, 'unit' => 'days']],
                      ],
                    ],
                  ],
                ],
              ],
            ],
            [
              'key' => 'mailpoet:send-email',
              'args' => $emailArgs,
            ],
          ]
        );

        $this->setBranchingSteps($automation, 2, 3, null);
        return $automation;
      },
      [
        'automationSteps' => 2, // trigger and all delay steps are excluded
      ],
      AutomationTemplate::TYPE_DEFAULT
    );
  }

  /**
   * @param string[] $tagNames
   * @return int[]
   */
  private function getTemplateTagIds(bool $preview, array $tagNames): array {
    if ($preview) {
      return [];
    }

    $tagIds = [];
    foreach ($tagNames as $tagName) {
      $tag = $this->tagRepository->createOrUpdate(['name' => $tagName]);
      $tagId = $tag->getId();
      if ($tagId !== null) {
        $tagIds[] = $tagId;
      }
    }
    return $tagIds;
  }

  /**
   * @return array<string, mixed>
   */
  private function createBlockEditorEmailArgs(
    bool $preview,
    string $pattern,
    string $name,
    string $subject,
    string $preheader,
    string $templateSlug
  ): array {
    $args = [
      'name' => $name,
      'subject' => $subject,
      'preheader' => $preheader,
    ];

    if ($preview) {
      $args['pattern'] = $pattern;
      return $args;
    }

    $emailIds = $this->emailFactory->createBlockEditorEmail([
      'pattern' => $pattern,
      'subject' => $subject,
      'preheader' => $preheader,
    ]);
    if (
      !is_array($emailIds)
      || !is_int($emailIds['email_id'] ?? null)
      || !is_int($emailIds['email_wp_post_id'] ?? null)
    ) {
      throw new \RuntimeException(sprintf('Could not create the %s block editor email.', $templateSlug));
    }
    return array_merge($args, $emailIds);
  }

  /**
   * Builds an if-else step whose "yes" branch matches customers with no active subscription.
   *
   * Reuses the existing woocommerce:customer:active-subscription-count field (also used by
   * the win-back template) so the condition stays consistent across templates.
   *
   * @return array{key: string, filters: array{operator: 'and'|'or', groups: array<array{operator: 'and'|'or', filters: array<array{field: string, condition: string, value: mixed}>}>}}
   */
  private function noActiveSubscriptionIfElse(): array {
    return [
      'key' => 'core:if-else',
      'filters' => [
        'operator' => 'and',
        'groups' => [
          [
            'operator' => 'and',
            'filters' => [
              [
                'field' => 'woocommerce:customer:active-subscription-count',
                'condition' => 'equals',
                'value' => 0,
              ],
            ],
          ],
        ],
      ],
    ];
  }

  private function setBranchingSteps(
    Automation $automation,
    int $ifElseStepIndex,
    ?int $yesStepIndex,
    ?int $noStepIndex,
    bool $endYesBranch = true,
    bool $endNoBranch = true
  ): void {
    $steps = array_values(array_filter($automation->getSteps(), function (Step $step): bool {
      return $step->getType() !== Step::TYPE_ROOT;
    }));
    $ifElseStep = $steps[$ifElseStepIndex] ?? null;
    $yesStep = $yesStepIndex === null ? null : ($steps[$yesStepIndex] ?? null);
    $noStep = $noStepIndex === null ? null : ($steps[$noStepIndex] ?? null);

    if (!$ifElseStep instanceof Step || $ifElseStep->getKey() !== 'core:if-else') {
      return;
    }

    $ifElseStep->setNextSteps([
      new NextStep($yesStep instanceof Step ? $yesStep->getId() : null),
      new NextStep($noStep instanceof Step ? $noStep->getId() : null),
    ]);

    if ($endYesBranch && $yesStep instanceof Step) {
      $yesStep->setNextSteps([]);
    }
    if ($endNoBranch && $noStep instanceof Step) {
      $noStep->setNextSteps([]);
    }
  }

  private function supportsGeneratedCouponBlock(): bool {
    $wooCommerceVersion = $this->woocommerceHelper->getWooCommerceVersion();
    if (!$wooCommerceVersion) {
      return false;
    }

    $numericVersionLength = strspn($wooCommerceVersion, '0123456789.');
    $numericVersion = substr($wooCommerceVersion, 0, $numericVersionLength);
    if ($numericVersion === '') {
      return false;
    }

    return version_compare($numericVersion, self::MIN_WOOCOMMERCE_VERSION_FOR_GENERATED_COUPON_BLOCK, '>=');
  }
}
