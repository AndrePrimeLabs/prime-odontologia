<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping;
if (!defined('ABSPATH')) exit;
use ReflectionClass;
interface ClassMetadata
{
 public function getName();
 public function getIdentifier();
 public function getReflectionClass();
 public function isIdentifier(string $fieldName);
 public function hasField(string $fieldName);
 public function hasAssociation(string $fieldName);
 public function isSingleValuedAssociation(string $fieldName);
 public function isCollectionValuedAssociation(string $fieldName);
 public function getFieldNames();
 public function getIdentifierFieldNames();
 public function getAssociationNames();
 public function getTypeOfField(string $fieldName);
 public function getAssociationTargetClass(string $assocName);
 public function isAssociationInverseSide(string $assocName);
 public function getAssociationMappedByTargetField(string $assocName);
 public function getIdentifierValues(object $object);
}
