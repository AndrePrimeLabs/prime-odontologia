<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Common\Lexer;
if (!defined('ABSPATH')) exit;
use ArrayAccess;
use MailPoetVendor\Doctrine\Deprecations\Deprecation;
use ReturnTypeWillChange;
use UnitEnum;
use function in_array;
final class Token implements ArrayAccess
{
 public $value;
 public $type;
 public $position;
 public function __construct($value, $type, int $position)
 {
 $this->value = $value;
 $this->type = $type;
 $this->position = $position;
 }
 public function isA(...$types) : bool
 {
 return in_array($this->type, $types, \true);
 }
 public function offsetExists($offset) : bool
 {
 Deprecation::trigger('doctrine/lexer', 'https://github.com/doctrine/lexer/pull/79', 'Accessing %s properties via ArrayAccess is deprecated, use the value, type or position property instead', self::class);
 return in_array($offset, ['value', 'type', 'position'], \true);
 }
 #[\ReturnTypeWillChange]
 public function offsetGet($offset)
 {
 Deprecation::trigger('doctrine/lexer', 'https://github.com/doctrine/lexer/pull/79', 'Accessing %s properties via ArrayAccess is deprecated, use the value, type or position property instead', self::class);
 return $this->{$offset};
 }
 public function offsetSet($offset, $value) : void
 {
 Deprecation::trigger('doctrine/lexer', 'https://github.com/doctrine/lexer/pull/79', 'Setting %s properties via ArrayAccess is deprecated', self::class);
 $this->{$offset} = $value;
 }
 public function offsetUnset($offset) : void
 {
 Deprecation::trigger('doctrine/lexer', 'https://github.com/doctrine/lexer/pull/79', 'Setting %s properties via ArrayAccess is deprecated', self::class);
 $this->{$offset} = null;
 }
}
