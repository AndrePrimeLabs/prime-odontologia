<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
interface PropertyChangedListener
{
 public function propertyChanged(object $sender, string $propertyName, $oldValue, $newValue);
}
