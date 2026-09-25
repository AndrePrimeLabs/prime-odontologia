<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Persistence\Mapping\Driver\MappingDriver;
use MailPoetVendor\Doctrine\Persistence\Proxy;
use MailPoetVendor\Psr\Cache\CacheItemPoolInterface;
use ReflectionClass;
use ReflectionException;
use function array_combine;
use function array_keys;
use function array_map;
use function array_reverse;
use function array_unshift;
use function assert;
use function class_exists;
use function ltrim;
use function str_replace;
use function strpos;
use function strrpos;
use function substr;
abstract class AbstractClassMetadataFactory implements ClassMetadataFactory
{
 protected $cacheSalt = '__CLASSMETADATA__';
 private $cache;
 private $loadedMetadata = [];
 protected $initialized = \false;
 private $reflectionService = null;
 private $proxyClassNameResolver = null;
 public function setCache(CacheItemPoolInterface $cache) : void
 {
 $this->cache = $cache;
 }
 protected final function getCache() : ?CacheItemPoolInterface
 {
 return $this->cache;
 }
 public function getLoadedMetadata()
 {
 return $this->loadedMetadata;
 }
 public function getAllMetadata()
 {
 if (!$this->initialized) {
 $this->initialize();
 }
 $driver = $this->getDriver();
 $metadata = [];
 foreach ($driver->getAllClassNames() as $className) {
 $metadata[] = $this->getMetadataFor($className);
 }
 return $metadata;
 }
 public function setProxyClassNameResolver(ProxyClassNameResolver $resolver) : void
 {
 $this->proxyClassNameResolver = $resolver;
 }
 protected abstract function initialize();
 protected abstract function getDriver();
 protected abstract function wakeupReflection(ClassMetadata $class, ReflectionService $reflService);
 protected abstract function initializeReflection(ClassMetadata $class, ReflectionService $reflService);
 protected abstract function isEntity(ClassMetadata $class);
 private function normalizeClassName(string $className) : string
 {
 return ltrim($className, '\\');
 }
 public function getMetadataFor(string $className)
 {
 $className = $this->normalizeClassName($className);
 if (isset($this->loadedMetadata[$className])) {
 return $this->loadedMetadata[$className];
 }
 if (class_exists($className, \false) && (new ReflectionClass($className))->isAnonymous()) {
 throw MappingException::classIsAnonymous($className);
 }
 if (!class_exists($className, \false) && strpos($className, ':') !== \false) {
 throw MappingException::nonExistingClass($className);
 }
 $realClassName = $this->getRealClass($className);
 if (isset($this->loadedMetadata[$realClassName])) {
 // We do not have the alias name in the map, include it
 return $this->loadedMetadata[$className] = $this->loadedMetadata[$realClassName];
 }
 try {
 if ($this->cache !== null) {
 $cached = $this->cache->getItem($this->getCacheKey($realClassName))->get();
 if ($cached instanceof ClassMetadata) {
 $this->loadedMetadata[$realClassName] = $cached;
 $this->wakeupReflection($cached, $this->getReflectionService());
 } else {
 $loadedMetadata = $this->loadMetadata($realClassName);
 $classNames = array_combine(array_map([$this, 'getCacheKey'], $loadedMetadata), $loadedMetadata);
 foreach ($this->cache->getItems(array_keys($classNames)) as $item) {
 if (!isset($classNames[$item->getKey()])) {
 continue;
 }
 $item->set($this->loadedMetadata[$classNames[$item->getKey()]]);
 $this->cache->saveDeferred($item);
 }
 $this->cache->commit();
 }
 } else {
 $this->loadMetadata($realClassName);
 }
 } catch (MappingException $loadingException) {
 $fallbackMetadataResponse = $this->onNotFoundMetadata($realClassName);
 if ($fallbackMetadataResponse === null) {
 throw $loadingException;
 }
 $this->loadedMetadata[$realClassName] = $fallbackMetadataResponse;
 }
 if ($className !== $realClassName) {
 // We do not have the alias name in the map, include it
 $this->loadedMetadata[$className] = $this->loadedMetadata[$realClassName];
 }
 return $this->loadedMetadata[$className];
 }
 public function hasMetadataFor(string $className)
 {
 $className = $this->normalizeClassName($className);
 return isset($this->loadedMetadata[$className]);
 }
 public function setMetadataFor(string $className, ClassMetadata $class)
 {
 $this->loadedMetadata[$this->normalizeClassName($className)] = $class;
 }
 protected function getParentClasses(string $name)
 {
 // Collect parent classes, ignoring transient (not-mapped) classes.
 $parentClasses = [];
 foreach (array_reverse($this->getReflectionService()->getParentClasses($name)) as $parentClass) {
 if ($this->getDriver()->isTransient($parentClass)) {
 continue;
 }
 $parentClasses[] = $parentClass;
 }
 return $parentClasses;
 }
 protected function loadMetadata(string $name)
 {
 if (!$this->initialized) {
 $this->initialize();
 }
 $loaded = [];
 $parentClasses = $this->getParentClasses($name);
 $parentClasses[] = $name;
 // Move down the hierarchy of parent classes, starting from the topmost ?class
 $parent = null;
 $rootEntityFound = \false;
 $visited = [];
 $reflService = $this->getReflectionService();
 foreach ($parentClasses as $className) {
 if (isset($this->loadedMetadata[$className])) {
 $parent = $this->loadedMetadata[$className];
 if ($this->isEntity($parent)) {
 $rootEntityFound = \true;
 array_unshift($visited, $className);
 }
 continue;
 }
 $class = $this->newClassMetadataInstance($className);
 $this->initializeReflection($class, $reflService);
 $this->doLoadMetadata($class, $parent, $rootEntityFound, $visited);
 $this->loadedMetadata[$className] = $class;
 $parent = $class;
 if ($this->isEntity($class)) {
 $rootEntityFound = \true;
 array_unshift($visited, $className);
 }
 $this->wakeupReflection($class, $reflService);
 $loaded[] = $className;
 }
 return $loaded;
 }
 protected function onNotFoundMetadata(string $className)
 {
 return null;
 }
 protected abstract function doLoadMetadata(ClassMetadata $class, ?ClassMetadata $parent, bool $rootEntityFound, array $nonSuperclassParents);
 protected abstract function newClassMetadataInstance(string $className);
 public function isTransient(string $className)
 {
 if (!$this->initialized) {
 $this->initialize();
 }
 if (class_exists($className, \false) && (new ReflectionClass($className))->isAnonymous()) {
 return \false;
 }
 if (!class_exists($className, \false) && strpos($className, ':') !== \false) {
 throw MappingException::nonExistingClass($className);
 }
 return $this->getDriver()->isTransient($className);
 }
 public function setReflectionService(ReflectionService $reflectionService)
 {
 $this->reflectionService = $reflectionService;
 }
 public function getReflectionService()
 {
 if ($this->reflectionService === null) {
 $this->reflectionService = new RuntimeReflectionService();
 }
 return $this->reflectionService;
 }
 protected function getCacheKey(string $realClassName) : string
 {
 return str_replace('\\', '__', $realClassName) . $this->cacheSalt;
 }
 private function getRealClass(string $class) : string
 {
 if ($this->proxyClassNameResolver === null) {
 $this->createDefaultProxyClassNameResolver();
 }
 assert($this->proxyClassNameResolver !== null);
 return $this->proxyClassNameResolver->resolveClassName($class);
 }
 private function createDefaultProxyClassNameResolver() : void
 {
 $this->proxyClassNameResolver = new class implements ProxyClassNameResolver
 {
 public function resolveClassName(string $className) : string
 {
 $pos = strrpos($className, '\\' . Proxy::MARKER . '\\');
 if ($pos === \false) {
 return $className;
 }
 return substr($className, $pos + Proxy::MARKER_LENGTH + 2);
 }
 };
 }
}
