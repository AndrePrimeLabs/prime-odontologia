<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Utility;
if (!defined('ABSPATH')) exit;
use BackedEnum;
use MailPoetVendor\Doctrine\DBAL\Connection;
use MailPoetVendor\Doctrine\DBAL\Types\Type;
use MailPoetVendor\Doctrine\ORM\EntityManagerInterface;
use MailPoetVendor\Doctrine\ORM\Mapping\ClassMetadata;
use MailPoetVendor\Doctrine\ORM\Proxy\DefaultProxyClassNameResolver;
use MailPoetVendor\Doctrine\ORM\Query\QueryException;
use RuntimeException;
use function array_map;
use function array_merge;
use function is_array;
use function is_object;
use function sprintf;
class PersisterHelper
{
 public static function getTypeOfField($fieldName, ClassMetadata $class, EntityManagerInterface $em)
 {
 if (isset($class->fieldMappings[$fieldName])) {
 return [$class->fieldMappings[$fieldName]['type']];
 }
 if (!isset($class->associationMappings[$fieldName])) {
 return [];
 }
 $assoc = $class->associationMappings[$fieldName];
 if (!$assoc['isOwningSide']) {
 return self::getTypeOfField($assoc['mappedBy'], $em->getClassMetadata($assoc['targetEntity']), $em);
 }
 if ($assoc['type'] & ClassMetadata::MANY_TO_MANY) {
 $joinData = $assoc['joinTable'];
 } else {
 $joinData = $assoc;
 }
 $types = [];
 $targetClass = $em->getClassMetadata($assoc['targetEntity']);
 foreach ($joinData['joinColumns'] as $joinColumn) {
 $types[] = self::getTypeOfColumn($joinColumn['referencedColumnName'], $targetClass, $em);
 }
 return $types;
 }
 public static function getTypeOfColumn($columnName, ClassMetadata $class, EntityManagerInterface $em)
 {
 if (isset($class->fieldNames[$columnName])) {
 $fieldName = $class->fieldNames[$columnName];
 if (isset($class->fieldMappings[$fieldName])) {
 return $class->fieldMappings[$fieldName]['type'];
 }
 }
 // iterate over to-one association mappings
 foreach ($class->associationMappings as $assoc) {
 if (!isset($assoc['joinColumns'])) {
 continue;
 }
 foreach ($assoc['joinColumns'] as $joinColumn) {
 if ($joinColumn['name'] === $columnName) {
 $targetColumnName = $joinColumn['referencedColumnName'];
 $targetClass = $em->getClassMetadata($assoc['targetEntity']);
 return self::getTypeOfColumn($targetColumnName, $targetClass, $em);
 }
 }
 }
 // iterate over to-many association mappings
 foreach ($class->associationMappings as $assoc) {
 if (!(isset($assoc['joinTable']) && isset($assoc['joinTable']['joinColumns']))) {
 continue;
 }
 foreach ($assoc['joinTable']['joinColumns'] as $joinColumn) {
 if ($joinColumn['name'] === $columnName) {
 $targetColumnName = $joinColumn['referencedColumnName'];
 $targetClass = $em->getClassMetadata($assoc['targetEntity']);
 return self::getTypeOfColumn($targetColumnName, $targetClass, $em);
 }
 }
 }
 throw new RuntimeException(sprintf('Could not resolve type of column "%s" of class "%s"', $columnName, $class->getName()));
 }
 public static function inferParameterTypes(string $field, $value, ClassMetadata $class, EntityManagerInterface $em) : array
 {
 $types = [];
 switch (\true) {
 case isset($class->fieldMappings[$field]):
 $types = array_merge($types, [$class->fieldMappings[$field]['type']]);
 break;
 case isset($class->associationMappings[$field]):
 $assoc = $class->associationMappings[$field];
 $class = $em->getClassMetadata($assoc['targetEntity']);
 if (!$assoc['isOwningSide']) {
 $assoc = $class->associationMappings[$assoc['mappedBy']];
 $class = $em->getClassMetadata($assoc['targetEntity']);
 }
 $columns = $assoc['type'] === ClassMetadata::MANY_TO_MANY ? $assoc['relationToTargetKeyColumns'] : $assoc['sourceToTargetKeyColumns'];
 foreach ($columns as $column) {
 $types[] = self::getTypeOfColumn($column, $class, $em);
 }
 break;
 default:
 $types[] = null;
 break;
 }
 if (is_array($value)) {
 return array_map(static function ($type) {
 $type = Type::getType($type);
 return $type->getBindingType() + Connection::ARRAY_PARAM_OFFSET;
 }, $types);
 }
 return $types;
 }
 public static function convertToParameterValue($value, EntityManagerInterface $em) : array
 {
 if (is_array($value)) {
 $newValue = [];
 foreach ($value as $itemValue) {
 $newValue = array_merge($newValue, self::convertToParameterValue($itemValue, $em));
 }
 return [$newValue];
 }
 return self::convertIndividualValue($value, $em);
 }
 private static function convertIndividualValue($value, EntityManagerInterface $em) : array
 {
 if (!is_object($value)) {
 return [$value];
 }
 if ($value instanceof BackedEnum) {
 return [$value->value];
 }
 $valueClass = DefaultProxyClassNameResolver::getClass($value);
 if ($em->getMetadataFactory()->isTransient($valueClass)) {
 return [$value];
 }
 $class = $em->getClassMetadata($valueClass);
 if ($class->isIdentifierComposite) {
 $newValue = [];
 foreach ($class->getIdentifierValues($value) as $innerValue) {
 $newValue = array_merge($newValue, self::convertToParameterValue($innerValue, $em));
 }
 return $newValue;
 }
 return [$em->getUnitOfWork()->getSingleIdentifierValue($value)];
 }
}
