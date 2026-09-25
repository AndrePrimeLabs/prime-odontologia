<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST\Functions;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\AST\Node;
use MailPoetVendor\Doctrine\ORM\Query\Parser;
use MailPoetVendor\Doctrine\ORM\Query\SqlWalker;
use MailPoetVendor\Doctrine\ORM\Query\TokenType;
class BitAndFunction extends FunctionNode
{
 public $firstArithmetic;
 public $secondArithmetic;
 public function getSql(SqlWalker $sqlWalker)
 {
 $platform = $sqlWalker->getConnection()->getDatabasePlatform();
 return $platform->getBitAndComparisonExpression($this->firstArithmetic->dispatch($sqlWalker), $this->secondArithmetic->dispatch($sqlWalker));
 }
 public function parse(Parser $parser)
 {
 $parser->match(TokenType::T_IDENTIFIER);
 $parser->match(TokenType::T_OPEN_PARENTHESIS);
 $this->firstArithmetic = $parser->ArithmeticPrimary();
 $parser->match(TokenType::T_COMMA);
 $this->secondArithmetic = $parser->ArithmeticPrimary();
 $parser->match(TokenType::T_CLOSE_PARENTHESIS);
 }
}
