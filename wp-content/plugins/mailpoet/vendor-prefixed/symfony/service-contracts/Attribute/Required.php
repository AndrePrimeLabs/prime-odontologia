<?php
namespace MailPoetVendor\Symfony\Contracts\Service\Attribute;
if (!defined('ABSPATH')) exit;
#[\Attribute(\Attribute::TARGET_METHOD | \Attribute::TARGET_PROPERTY)]
final class Required
{
}
