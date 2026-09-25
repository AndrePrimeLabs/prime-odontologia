<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
use InvalidArgumentException;
use ReflectionClass;
use function assert;
use function sprintf;
abstract class AbstractManagerRegistry implements ManagerRegistry
{
 private $name;
 private $connections;
 private $managers;
 private $defaultConnection;
 private $defaultManager;
 private $proxyInterfaceName;
 public function __construct(string $name, array $connections, array $managers, string $defaultConnection, string $defaultManager, string $proxyInterfaceName)
 {
 $this->name = $name;
 $this->connections = $connections;
 $this->managers = $managers;
 $this->defaultConnection = $defaultConnection;
 $this->defaultManager = $defaultManager;
 $this->proxyInterfaceName = $proxyInterfaceName;
 }
 protected abstract function getService(string $name);
 protected abstract function resetService(string $name);
 public function getName()
 {
 return $this->name;
 }
 public function getConnection(?string $name = null)
 {
 if ($name === null) {
 $name = $this->defaultConnection;
 }
 if (!isset($this->connections[$name])) {
 throw new InvalidArgumentException(sprintf('Doctrine %s Connection named "%s" does not exist.', $this->name, $name));
 }
 return $this->getService($this->connections[$name]);
 }
 public function getConnectionNames()
 {
 return $this->connections;
 }
 public function getConnections()
 {
 $connections = [];
 foreach ($this->connections as $name => $id) {
 $connections[$name] = $this->getService($id);
 }
 return $connections;
 }
 public function getDefaultConnectionName()
 {
 return $this->defaultConnection;
 }
 public function getDefaultManagerName()
 {
 return $this->defaultManager;
 }
 public function getManager(?string $name = null)
 {
 if ($name === null) {
 $name = $this->defaultManager;
 }
 if (!isset($this->managers[$name])) {
 throw new InvalidArgumentException(sprintf('Doctrine %s Manager named "%s" does not exist.', $this->name, $name));
 }
 $service = $this->getService($this->managers[$name]);
 assert($service instanceof ObjectManager);
 return $service;
 }
 public function getManagerForClass(string $class)
 {
 $proxyClass = new ReflectionClass($class);
 if ($proxyClass->isAnonymous()) {
 return null;
 }
 if ($proxyClass->implementsInterface($this->proxyInterfaceName)) {
 $parentClass = $proxyClass->getParentClass();
 if ($parentClass === \false) {
 return null;
 }
 $class = $parentClass->getName();
 }
 foreach ($this->managers as $id) {
 $manager = $this->getService($id);
 assert($manager instanceof ObjectManager);
 if (!$manager->getMetadataFactory()->isTransient($class)) {
 return $manager;
 }
 }
 return null;
 }
 public function getManagerNames()
 {
 return $this->managers;
 }
 public function getManagers()
 {
 $managers = [];
 foreach ($this->managers as $name => $id) {
 $manager = $this->getService($id);
 assert($manager instanceof ObjectManager);
 $managers[$name] = $manager;
 }
 return $managers;
 }
 public function getRepository(string $persistentObject, ?string $persistentManagerName = null)
 {
 return $this->selectManager($persistentObject, $persistentManagerName)->getRepository($persistentObject);
 }
 public function resetManager(?string $name = null)
 {
 if ($name === null) {
 $name = $this->defaultManager;
 }
 if (!isset($this->managers[$name])) {
 throw new InvalidArgumentException(sprintf('Doctrine %s Manager named "%s" does not exist.', $this->name, $name));
 }
 // force the creation of a new document manager
 // if the current one is closed
 $this->resetService($this->managers[$name]);
 return $this->getManager($name);
 }
 private function selectManager(string $persistentObject, ?string $persistentManagerName = null) : ObjectManager
 {
 if ($persistentManagerName !== null) {
 return $this->getManager($persistentManagerName);
 }
 return $this->getManagerForClass($persistentObject) ?? $this->getManager();
 }
}
