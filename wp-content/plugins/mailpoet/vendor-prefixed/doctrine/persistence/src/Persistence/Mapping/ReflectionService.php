<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping;
if (!defined('ABSPATH')) exit;
use ReflectionClass;
use ReflectionProperty;
interface ReflectionService
{
 public function getParentClasses(string $class);
 public function getClassShortName(string $class);
 public function getClassNamespace(string $class);
 public function getClass(string $class);
 public function getAccessibleProperty(string $class, string $property);
 public function hasPublicMethod(string $class, string $method);
}
