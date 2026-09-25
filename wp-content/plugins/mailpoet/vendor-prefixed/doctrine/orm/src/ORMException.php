<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Common\Cache\Cache as CacheDriver;
use MailPoetVendor\Doctrine\ORM\Cache\Exception\InvalidResultCacheDriver;
use MailPoetVendor\Doctrine\ORM\Cache\Exception\MetadataCacheNotConfigured;
use MailPoetVendor\Doctrine\ORM\Cache\Exception\MetadataCacheUsesNonPersistentCache;
use MailPoetVendor\Doctrine\ORM\Cache\Exception\QueryCacheNotConfigured;
use MailPoetVendor\Doctrine\ORM\Cache\Exception\QueryCacheUsesNonPersistentCache;
use MailPoetVendor\Doctrine\ORM\Exception\EntityManagerClosed;
use MailPoetVendor\Doctrine\ORM\Exception\InvalidEntityRepository;
use MailPoetVendor\Doctrine\ORM\Exception\InvalidHydrationMode;
use MailPoetVendor\Doctrine\ORM\Exception\MismatchedEventManager;
use MailPoetVendor\Doctrine\ORM\Exception\MissingIdentifierField;
use MailPoetVendor\Doctrine\ORM\Exception\MissingMappingDriverImplementation;
use MailPoetVendor\Doctrine\ORM\Exception\NamedNativeQueryNotFound;
use MailPoetVendor\Doctrine\ORM\Exception\NamedQueryNotFound;
use MailPoetVendor\Doctrine\ORM\Exception\ProxyClassesAlwaysRegenerating;
use MailPoetVendor\Doctrine\ORM\Exception\UnexpectedAssociationValue;
use MailPoetVendor\Doctrine\ORM\Exception\UnknownEntityNamespace;
use MailPoetVendor\Doctrine\ORM\Exception\UnrecognizedIdentifierFields;
use MailPoetVendor\Doctrine\ORM\Persisters\Exception\CantUseInOperatorOnCompositeKeys;
use MailPoetVendor\Doctrine\ORM\Persisters\Exception\InvalidOrientation;
use MailPoetVendor\Doctrine\ORM\Persisters\Exception\UnrecognizedField;
use MailPoetVendor\Doctrine\ORM\Repository\Exception\InvalidFindByCall;
use MailPoetVendor\Doctrine\ORM\Repository\Exception\InvalidMagicMethodCall;
use MailPoetVendor\Doctrine\ORM\Tools\Exception\NotSupported;
use Exception;
use function sprintf;
class ORMException extends Exception
{
 public static function missingMappingDriverImpl()
 {
 return MissingMappingDriverImplementation::create();
 }
 public static function namedQueryNotFound($queryName)
 {
 return NamedQueryNotFound::fromName($queryName);
 }
 public static function namedNativeQueryNotFound($nativeQueryName)
 {
 return NamedNativeQueryNotFound::fromName($nativeQueryName);
 }
 public static function unrecognizedField($field)
 {
 return new UnrecognizedField(sprintf('Unrecognized field: %s', $field));
 }
 public static function unexpectedAssociationValue($class, $association, $given, $expected)
 {
 return UnexpectedAssociationValue::create($class, $association, $given, $expected);
 }
 public static function invalidOrientation($className, $field)
 {
 return InvalidOrientation::fromClassNameAndField($className, $field);
 }
 public static function entityManagerClosed()
 {
 return EntityManagerClosed::create();
 }
 public static function invalidHydrationMode($mode)
 {
 return InvalidHydrationMode::fromMode($mode);
 }
 public static function mismatchedEventManager()
 {
 return MismatchedEventManager::create();
 }
 public static function findByRequiresParameter($methodName)
 {
 return InvalidMagicMethodCall::onMissingParameter($methodName);
 }
 public static function invalidMagicCall($entityName, $fieldName, $method)
 {
 return InvalidMagicMethodCall::becauseFieldNotFoundIn($entityName, $fieldName, $method);
 }
 public static function invalidFindByInverseAssociation($entityName, $associationFieldName)
 {
 return InvalidFindByCall::fromInverseSideUsage($entityName, $associationFieldName);
 }
 public static function invalidResultCacheDriver()
 {
 return InvalidResultCacheDriver::create();
 }
 public static function notSupported()
 {
 return NotSupported::create();
 }
 public static function queryCacheNotConfigured()
 {
 return QueryCacheNotConfigured::create();
 }
 public static function metadataCacheNotConfigured()
 {
 return MetadataCacheNotConfigured::create();
 }
 public static function queryCacheUsesNonPersistentCache(CacheDriver $cache)
 {
 return QueryCacheUsesNonPersistentCache::fromDriver($cache);
 }
 public static function metadataCacheUsesNonPersistentCache(CacheDriver $cache)
 {
 return MetadataCacheUsesNonPersistentCache::fromDriver($cache);
 }
 public static function proxyClassesAlwaysRegenerating()
 {
 return ProxyClassesAlwaysRegenerating::create();
 }
 public static function unknownEntityNamespace($entityNamespaceAlias)
 {
 return UnknownEntityNamespace::fromNamespaceAlias($entityNamespaceAlias);
 }
 public static function invalidEntityRepository($className)
 {
 return InvalidEntityRepository::fromClassName($className);
 }
 public static function missingIdentifierField($className, $fieldName)
 {
 return MissingIdentifierField::fromFieldAndClass($fieldName, $className);
 }
 public static function unrecognizedIdentifierFields($className, $fieldNames)
 {
 return UnrecognizedIdentifierFields::fromClassAndFieldNames($className, $fieldNames);
 }
 public static function cantUseInOperatorOnCompositeKeys()
 {
 return CantUseInOperatorOnCompositeKeys::create();
 }
}
