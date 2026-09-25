<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Reflection;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Common\Proxy\Proxy as CommonProxy;
use MailPoetVendor\Doctrine\Persistence\Proxy;
use ReflectionProperty;
use ReturnTypeWillChange;
use function ltrim;
use function method_exists;
class RuntimeReflectionProperty extends ReflectionProperty
{
 private $key;
 public function __construct(string $class, string $name)
 {
 parent::__construct($class, $name);
 $this->key = $this->isPrivate() ? "\x00" . ltrim($class, '\\') . "\x00" . $name : ($this->isProtected() ? "\x00*\x00" . $name : $name);
 }
 #[\ReturnTypeWillChange]
 public function getValue($object = null)
 {
 if ($object === null) {
 return parent::getValue($object);
 }
 return ((array) $object)[$this->key] ?? null;
 }
 #[\ReturnTypeWillChange]
 public function setValue($object, $value = null)
 {
 if (!($object instanceof Proxy && !$object->__isInitialized())) {
 parent::setValue($object, $value);
 return;
 }
 if ($object instanceof CommonProxy) {
 $originalInitializer = $object->__getInitializer();
 $object->__setInitializer(null);
 parent::setValue($object, $value);
 $object->__setInitializer($originalInitializer);
 return;
 }
 if (!method_exists($object, '__setInitialized')) {
 return;
 }
 $object->__setInitialized(\true);
 parent::setValue($object, $value);
 $object->__setInitialized(\false);
 }
}
