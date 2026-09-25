<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Proxy;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Persistence\Mapping\ProxyClassNameResolver;
use MailPoetVendor\Doctrine\Persistence\Proxy;
use function get_class;
use function strrpos;
use function substr;
final class DefaultProxyClassNameResolver implements ProxyClassNameResolver
{
 public function resolveClassName(string $className) : string
 {
 $pos = strrpos($className, '\\' . Proxy::MARKER . '\\');
 if ($pos === \false) {
 return $className;
 }
 return substr($className, $pos + Proxy::MARKER_LENGTH + 2);
 }
 public static function getClass($object) : string
 {
 return (new self())->resolveClassName(get_class($object));
 }
}
