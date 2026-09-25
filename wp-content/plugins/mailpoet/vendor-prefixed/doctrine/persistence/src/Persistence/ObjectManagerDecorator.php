<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
use BadMethodCallException;
use MailPoetVendor\Doctrine\Persistence\Mapping\ClassMetadata;
use MailPoetVendor\Doctrine\Persistence\Mapping\ClassMetadataFactory;
use function get_class;
use function method_exists;
use function sprintf;
abstract class ObjectManagerDecorator implements ObjectManager
{
 protected $wrapped;
 public function find(string $className, $id)
 {
 return $this->wrapped->find($className, $id);
 }
 public function persist(object $object)
 {
 $this->wrapped->persist($object);
 }
 public function remove(object $object)
 {
 $this->wrapped->remove($object);
 }
 public function clear() : void
 {
 $this->wrapped->clear();
 }
 public function detach(object $object)
 {
 $this->wrapped->detach($object);
 }
 public function refresh(object $object)
 {
 $this->wrapped->refresh($object);
 }
 public function flush()
 {
 $this->wrapped->flush();
 }
 public function getRepository(string $className)
 {
 return $this->wrapped->getRepository($className);
 }
 public function getClassMetadata(string $className)
 {
 return $this->wrapped->getClassMetadata($className);
 }
 public function getMetadataFactory()
 {
 return $this->wrapped->getMetadataFactory();
 }
 public function initializeObject(object $obj)
 {
 $this->wrapped->initializeObject($obj);
 }
 public function isUninitializedObject($value) : bool
 {
 if (!method_exists($this->wrapped, 'isUninitializedObject')) {
 $wrappedClass = get_class($this->wrapped);
 throw new BadMethodCallException(sprintf(<<<'EXCEPTION'
Context: Trying to call %s
Problem: The wrapped ObjectManager, an instance of %s does not implement this method.
Solution: Implement %s::isUninitializedObject() with a signature compatible with this one:
 public function isUninitializedObject(mixed $value): bool
EXCEPTION
, __METHOD__, $wrappedClass, $wrappedClass));
 }
 return $this->wrapped->isUninitializedObject($value);
 }
 public function contains(object $object)
 {
 return $this->wrapped->contains($object);
 }
}
