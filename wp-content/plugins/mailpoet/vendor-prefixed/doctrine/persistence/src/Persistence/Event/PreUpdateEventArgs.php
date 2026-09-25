<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Event;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Persistence\ObjectManager;
use InvalidArgumentException;
use function get_class;
use function sprintf;
class PreUpdateEventArgs extends LifecycleEventArgs
{
 private $entityChangeSet;
 public function __construct(object $entity, ObjectManager $objectManager, array &$changeSet)
 {
 parent::__construct($entity, $objectManager);
 $this->entityChangeSet =& $changeSet;
 }
 public function getEntityChangeSet()
 {
 return $this->entityChangeSet;
 }
 public function hasChangedField(string $field)
 {
 return isset($this->entityChangeSet[$field]);
 }
 public function getOldValue(string $field)
 {
 $this->assertValidField($field);
 return $this->entityChangeSet[$field][0];
 }
 public function getNewValue(string $field)
 {
 $this->assertValidField($field);
 return $this->entityChangeSet[$field][1];
 }
 public function setNewValue(string $field, $value)
 {
 $this->assertValidField($field);
 $this->entityChangeSet[$field][1] = $value;
 }
 private function assertValidField(string $field)
 {
 if (!isset($this->entityChangeSet[$field])) {
 throw new InvalidArgumentException(sprintf('Field "%s" is not a valid field of the entity "%s" in PreUpdateEventArgs.', $field, get_class($this->getObject())));
 }
 }
}
