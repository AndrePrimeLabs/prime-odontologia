<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Mapping\Driver;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Mapping\ClassMetadata;
use ReflectionProperty;
trait ReflectionBasedDriver
{
 private $reportFieldsWhereDeclared = \false;
 private function isRepeatedPropertyDeclaration(ReflectionProperty $property, ClassMetadata $metadata) : bool
 {
 if (!$this->reportFieldsWhereDeclared) {
 return $metadata->isMappedSuperclass && !$property->isPrivate() || $metadata->isInheritedField($property->name) || $metadata->isInheritedAssociation($property->name) || $metadata->isInheritedEmbeddedClass($property->name);
 }
 $declaringClass = $property->class;
 if (isset($metadata->fieldMappings[$property->name]['declared']) && $metadata->fieldMappings[$property->name]['declared'] === $declaringClass) {
 return \true;
 }
 if (isset($metadata->associationMappings[$property->name]['declared']) && $metadata->associationMappings[$property->name]['declared'] === $declaringClass) {
 return \true;
 }
 return isset($metadata->embeddedClasses[$property->name]['declared']) && $metadata->embeddedClasses[$property->name]['declared'] === $declaringClass;
 }
}
