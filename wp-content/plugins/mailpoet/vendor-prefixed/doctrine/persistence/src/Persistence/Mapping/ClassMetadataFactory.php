<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping;
if (!defined('ABSPATH')) exit;
interface ClassMetadataFactory
{
 public function getAllMetadata();
 public function getMetadataFor(string $className);
 public function hasMetadataFor(string $className);
 public function setMetadataFor(string $className, ClassMetadata $class);
 public function isTransient(string $className);
}
