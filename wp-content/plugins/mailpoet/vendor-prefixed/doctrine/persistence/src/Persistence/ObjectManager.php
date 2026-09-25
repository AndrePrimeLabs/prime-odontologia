<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Persistence\Mapping\ClassMetadata;
use MailPoetVendor\Doctrine\Persistence\Mapping\ClassMetadataFactory;
interface ObjectManager
{
 public function find(string $className, $id);
 public function persist(object $object);
 public function remove(object $object);
 public function clear();
 public function detach(object $object);
 public function refresh(object $object);
 public function flush();
 public function getRepository(string $className);
 public function getClassMetadata(string $className);
 public function getMetadataFactory();
 public function initializeObject(object $obj);
 public function contains(object $object);
}
