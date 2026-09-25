<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST;
if (!defined('ABSPATH')) exit;
class InSubselectExpression extends InExpression
{
 public $subselect;
 public function __construct(ArithmeticExpression $expression, Subselect $subselect, bool $not = \false)
 {
 $this->subselect = $subselect;
 // @phpstan-ignore property.deprecatedClass
 $this->not = $not;
 // @phpstan-ignore method.deprecatedClass
 parent::__construct($expression);
 }
}
