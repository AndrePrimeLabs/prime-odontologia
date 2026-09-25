<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Reflection;
if (!defined('ABSPATH')) exit;
use BackedEnum;
use ReflectionClass;
use ReflectionProperty;
use ReflectionType;
use ReturnTypeWillChange;
use function array_map;
use function is_array;
use function reset;
class EnumReflectionProperty extends ReflectionProperty
{
 private $originalReflectionProperty;
 private $enumType;
 public function __construct(ReflectionProperty $originalReflectionProperty, string $enumType)
 {
 $this->originalReflectionProperty = $originalReflectionProperty;
 $this->enumType = $enumType;
 }
 public function getDeclaringClass() : ReflectionClass
 {
 return $this->originalReflectionProperty->getDeclaringClass();
 }
 public function getName() : string
 {
 return $this->originalReflectionProperty->getName();
 }
 public function getType() : ?ReflectionType
 {
 return $this->originalReflectionProperty->getType();
 }
 public function getAttributes(?string $name = null, int $flags = 0) : array
 {
 return $this->originalReflectionProperty->getAttributes($name, $flags);
 }
 #[\ReturnTypeWillChange]
 public function getValue($object = null)
 {
 if ($object === null) {
 return null;
 }
 $enum = $this->originalReflectionProperty->getValue($object);
 if ($enum === null) {
 return null;
 }
 return $this->fromEnum($enum);
 }
 public function setValue($object, $value = null) : void
 {
 if ($value !== null) {
 $value = $this->toEnum($value);
 }
 $this->originalReflectionProperty->setValue($object, $value);
 }
 private function fromEnum($enum)
 {
 if (is_array($enum)) {
 return array_map(static function (BackedEnum $enum) {
 return $enum->value;
 }, $enum);
 }
 return $enum->value;
 }
 private function toEnum($value)
 {
 if ($value instanceof BackedEnum) {
 return $value;
 }
 if (is_array($value)) {
 $v = reset($value);
 if ($v instanceof BackedEnum) {
 return $value;
 }
 return array_map([$this->enumType, 'from'], $value);
 }
 return $this->enumType::from($value);
 }
 public function getModifiers() : int
 {
 return $this->originalReflectionProperty->getModifiers();
 }
 public function getDocComment() : string|false
 {
 return $this->originalReflectionProperty->getDocComment();
 }
 public function isPrivate() : bool
 {
 return $this->originalReflectionProperty->isPrivate();
 }
}
