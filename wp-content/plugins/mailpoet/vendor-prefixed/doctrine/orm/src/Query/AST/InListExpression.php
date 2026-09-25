<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST;
if (!defined('ABSPATH')) exit;
class InListExpression extends InExpression
{
 public $literals;
 public function __construct(ArithmeticExpression $expression, array $literals, bool $not = \false)
 {
 $this->literals = $literals;
 // @phpstan-ignore property.deprecatedClass
 $this->not = $not;
 // @phpstan-ignore method.deprecatedClass
 parent::__construct($expression);
 }
}
