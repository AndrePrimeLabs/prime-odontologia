<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping\Driver;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Persistence\Mapping\ClassMetadata;
class PHPDriver extends FileDriver
{
 protected $metadata;
 public function __construct($locator)
 {
 parent::__construct($locator, '.php');
 }
 public function loadMetadataForClass(string $className, ClassMetadata $metadata)
 {
 $this->metadata = $metadata;
 $this->loadMappingFile($this->locator->findMappingFile($className));
 }
 protected function loadMappingFile(string $file)
 {
 $metadata = $this->metadata;
 include $file;
 return [$metadata->getName() => $metadata];
 }
}
