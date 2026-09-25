<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Mapping;
if (!defined('ABSPATH')) exit;
use Attribute;
use MailPoetVendor\Doctrine\Common\Annotations\Annotation\NamedArgumentConstructor;
use MailPoetVendor\Doctrine\Deprecations\Deprecation;
#[\Attribute(Attribute::TARGET_CLASS)]
final class InheritanceType implements MappingAttribute
{
 public $value;
 public function __construct(string $value)
 {
 if ($value === 'TABLE_PER_CLASS') {
 Deprecation::trigger('doctrine/orm', 'https://github.com/doctrine/orm/pull/10414/', 'Concrete table inheritance has never been implemented, and its stubs will be removed in Doctrine ORM 3.0 with no replacement');
 }
 $this->value = $value;
 }
}
