<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Id;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\DBAL\Connections\PrimaryReadReplicaConnection;
use MailPoetVendor\Doctrine\ORM\EntityManagerInterface;
use Serializable;
use function serialize;
use function unserialize;
class SequenceGenerator extends AbstractIdGenerator implements Serializable
{
 private $allocationSize;
 private $sequenceName;
 private $nextValue = 0;
 private $maxValue = null;
 public function __construct($sequenceName, $allocationSize)
 {
 $this->sequenceName = $sequenceName;
 $this->allocationSize = $allocationSize;
 }
 public function generateId(EntityManagerInterface $em, $entity)
 {
 if ($this->maxValue === null || $this->nextValue === $this->maxValue) {
 // Allocate new values
 $connection = $em->getConnection();
 $sql = $connection->getDatabasePlatform()->getSequenceNextValSQL($this->sequenceName);
 if ($connection instanceof PrimaryReadReplicaConnection) {
 $connection->ensureConnectedToPrimary();
 }
 $this->nextValue = (int) $connection->fetchOne($sql);
 $this->maxValue = $this->nextValue + $this->allocationSize;
 }
 return $this->nextValue++;
 }
 public function getCurrentMaxValue()
 {
 return $this->maxValue;
 }
 public function getNextValue()
 {
 return $this->nextValue;
 }
 public function serialize()
 {
 return serialize($this->__serialize());
 }
 public function __serialize() : array
 {
 return ['allocationSize' => $this->allocationSize, 'sequenceName' => $this->sequenceName];
 }
 public function unserialize($serialized)
 {
 $this->__unserialize(unserialize($serialized));
 }
 public function __unserialize(array $data) : void
 {
 $this->sequenceName = $data['sequenceName'];
 $this->allocationSize = $data['allocationSize'];
 }
}
