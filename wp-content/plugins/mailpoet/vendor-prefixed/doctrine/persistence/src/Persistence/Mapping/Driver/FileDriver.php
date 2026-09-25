<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping\Driver;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Persistence\Mapping\MappingException;
use function array_keys;
use function array_merge;
use function array_unique;
use function array_values;
use function is_file;
use function str_replace;
abstract class FileDriver implements MappingDriver
{
 protected $locator;
 protected $classCache;
 protected $globalBasename = '';
 public function __construct($locator, ?string $fileExtension = null)
 {
 if ($locator instanceof FileLocator) {
 $this->locator = $locator;
 } else {
 $this->locator = new DefaultFileLocator((array) $locator, $fileExtension);
 }
 }
 public function setGlobalBasename(string $file)
 {
 $this->globalBasename = $file;
 }
 public function getGlobalBasename()
 {
 return $this->globalBasename;
 }
 public function getElement(string $className)
 {
 if ($this->classCache === null) {
 $this->initialize();
 }
 if (isset($this->classCache[$className])) {
 return $this->classCache[$className];
 }
 $result = $this->loadMappingFile($this->locator->findMappingFile($className));
 if (!isset($result[$className])) {
 throw MappingException::invalidMappingFile($className, str_replace('\\', '.', $className) . $this->locator->getFileExtension());
 }
 $this->classCache[$className] = $result[$className];
 return $result[$className];
 }
 public function isTransient(string $className)
 {
 if ($this->classCache === null) {
 $this->initialize();
 }
 if (isset($this->classCache[$className])) {
 return \false;
 }
 return !$this->locator->fileExists($className);
 }
 public function getAllClassNames()
 {
 if ($this->classCache === null) {
 $this->initialize();
 }
 if ($this->classCache === []) {
 return $this->locator->getAllClassNames($this->globalBasename);
 }
 $classCache = $this->classCache;
 $keys = array_keys($classCache);
 return array_values(array_unique(array_merge($keys, $this->locator->getAllClassNames($this->globalBasename))));
 }
 protected abstract function loadMappingFile(string $file);
 protected function initialize()
 {
 $this->classCache = [];
 if ($this->globalBasename === '') {
 return;
 }
 foreach ($this->locator->getPaths() as $path) {
 $file = $path . '/' . $this->globalBasename . $this->locator->getFileExtension();
 if (!is_file($file)) {
 continue;
 }
 $this->classCache = array_merge($this->classCache, $this->loadMappingFile($file));
 }
 }
 public function getLocator()
 {
 return $this->locator;
 }
 public function setLocator(FileLocator $locator)
 {
 $this->locator = $locator;
 }
}
