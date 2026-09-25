<?php
namespace MailPoetVendor\Doctrine\Common\Collections;
if (!defined('ABSPATH')) exit;
use Closure;
use Countable;
use IteratorAggregate;
interface ReadableCollection extends Countable, IteratorAggregate
{
 public function contains($element);
 public function isEmpty();
 public function containsKey($key);
 public function get($key);
 public function getKeys();
 public function getValues();
 public function toArray();
 public function first();
 public function last();
 public function key();
 public function current();
 public function next();
 public function slice($offset, $length = null);
 public function exists(Closure $p);
 public function filter(Closure $p);
 public function map(Closure $func);
 public function partition(Closure $p);
 public function forAll(Closure $p);
 public function indexOf($element);
}
