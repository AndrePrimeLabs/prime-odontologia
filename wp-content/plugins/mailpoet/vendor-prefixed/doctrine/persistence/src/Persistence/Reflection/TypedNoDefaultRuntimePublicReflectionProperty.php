<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence\Reflection;
if (!defined('ABSPATH')) exit;
class TypedNoDefaultRuntimePublicReflectionProperty extends RuntimePublicReflectionProperty
{
 use TypedNoDefaultReflectionPropertyBase;
}
