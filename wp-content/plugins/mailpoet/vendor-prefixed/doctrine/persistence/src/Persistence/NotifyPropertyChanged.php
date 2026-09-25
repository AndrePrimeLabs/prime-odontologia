<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
interface NotifyPropertyChanged
{
 public function addPropertyChangedListener(PropertyChangedListener $listener);
}
