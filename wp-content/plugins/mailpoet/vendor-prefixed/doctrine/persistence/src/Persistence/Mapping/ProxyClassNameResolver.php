<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Mapping;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Persistence\Proxy;
interface ProxyClassNameResolver
{
 public function resolveClassName(string $className) : string;
}
