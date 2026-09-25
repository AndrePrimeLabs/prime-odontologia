<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Internal\Hydration;
if (!defined('ABSPATH')) exit;
use Iterator;
use ReturnTypeWillChange;
class IterableResult implements Iterator
{
 private $hydrator;
 private $rewinded = \false;
 private $key = -1;
 private $current = null;
 public function __construct($hydrator)
 {
 $this->hydrator = $hydrator;
 }
 #[\ReturnTypeWillChange]
 public function rewind()
 {
 if ($this->rewinded === \true) {
 throw new HydrationException('Can only iterate a Result once.');
 }
 $this->current = $this->next();
 $this->rewinded = \true;
 }
 #[\ReturnTypeWillChange]
 public function next()
 {
 $this->current = $this->hydrator->hydrateRow();
 $this->key++;
 return $this->current;
 }
 #[\ReturnTypeWillChange]
 public function current()
 {
 return $this->current;
 }
 #[\ReturnTypeWillChange]
 public function key()
 {
 return $this->key;
 }
 #[\ReturnTypeWillChange]
 public function valid()
 {
 return $this->current !== \false;
 }
}
