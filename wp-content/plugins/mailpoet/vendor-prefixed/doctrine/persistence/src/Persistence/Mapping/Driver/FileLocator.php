<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping\Driver;
if (!defined('ABSPATH')) exit;
interface FileLocator
{
 public function findMappingFile(string $className);
 public function getAllClassNames(string $globalBasename);
 public function fileExists(string $className);
 public function getPaths();
 public function getFileExtension();
}
