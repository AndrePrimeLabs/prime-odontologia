<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping;
if (!defined('ABSPATH')) exit;
use function strpos;
use function strrev;
use function strrpos;
use function substr;
class StaticReflectionService implements ReflectionService
{
 public function getParentClasses(string $class)
 {
 return [];
 }
 public function getClassShortName(string $class)
 {
 $nsSeparatorLastPosition = strrpos($class, '\\');
 if ($nsSeparatorLastPosition !== \false) {
 $class = substr($class, $nsSeparatorLastPosition + 1);
 }
 return $class;
 }
 public function getClassNamespace(string $class)
 {
 $namespace = '';
 if (strpos($class, '\\') !== \false) {
 $namespace = strrev(substr(strrev($class), (int) strpos(strrev($class), '\\') + 1));
 }
 return $namespace;
 }
 public function getClass(string $class)
 {
 return null;
 }
 public function getAccessibleProperty(string $class, string $property)
 {
 return null;
 }
 public function hasPublicMethod(string $class, string $method)
 {
 return \true;
 }
}
