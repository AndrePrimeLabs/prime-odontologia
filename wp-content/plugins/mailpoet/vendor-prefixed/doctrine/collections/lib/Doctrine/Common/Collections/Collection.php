<?php
namespace MailPoetVendor\Doctrine\Common\Collections;
if (!defined('ABSPATH')) exit;
use ArrayAccess;
use Closure;
interface Collection extends ReadableCollection, ArrayAccess
{
 public function add($element);
 public function clear();
 public function remove($key);
 public function removeElement($element);
 public function set($key, $value);
 public function filter(Closure $p);
 public function partition(Closure $p);
}
