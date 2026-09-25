<?php
namespace MailPoetVendor\Symfony\Contracts\Service\Attribute;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Symfony\Contracts\Service\ServiceSubscriberTrait;
#[\Attribute(\Attribute::TARGET_METHOD)]
final class SubscribedService
{
 public function __construct(public ?string $key = null)
 {
 }
}
