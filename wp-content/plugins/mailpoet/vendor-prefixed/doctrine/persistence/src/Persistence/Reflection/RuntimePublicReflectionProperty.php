<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Reflection;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Common\Proxy\Proxy;
use ReflectionProperty;
use ReturnTypeWillChange;
class RuntimePublicReflectionProperty extends ReflectionProperty
{
 #[\ReturnTypeWillChange]
 public function getValue($object = null)
 {
 return $object !== null ? ((array) $object)[$this->getName()] ?? null : parent::getValue();
 }
 #[\ReturnTypeWillChange]
 public function setValue($object, $value = null)
 {
 if (!($object instanceof Proxy && !$object->__isInitialized())) {
 parent::setValue($object, $value);
 return;
 }
 $originalInitializer = $object->__getInitializer();
 $object->__setInitializer(null);
 parent::setValue($object, $value);
 $object->__setInitializer($originalInitializer);
 }
}
