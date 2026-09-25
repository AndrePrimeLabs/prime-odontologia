<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST\Functions;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\AST\SimpleArithmeticExpression;
use MailPoetVendor\Doctrine\ORM\Query\Parser;
use MailPoetVendor\Doctrine\ORM\Query\SqlWalker;
use MailPoetVendor\Doctrine\ORM\Query\TokenType;
class ModFunction extends FunctionNode
{
 public $firstSimpleArithmeticExpression;
 public $secondSimpleArithmeticExpression;
 public function getSql(SqlWalker $sqlWalker)
 {
 return $sqlWalker->getConnection()->getDatabasePlatform()->getModExpression($sqlWalker->walkSimpleArithmeticExpression($this->firstSimpleArithmeticExpression), $sqlWalker->walkSimpleArithmeticExpression($this->secondSimpleArithmeticExpression));
 }
 public function parse(Parser $parser)
 {
 $parser->match(TokenType::T_IDENTIFIER);
 $parser->match(TokenType::T_OPEN_PARENTHESIS);
 $this->firstSimpleArithmeticExpression = $parser->SimpleArithmeticExpression();
 $parser->match(TokenType::T_COMMA);
 $this->secondSimpleArithmeticExpression = $parser->SimpleArithmeticExpression();
 $parser->match(TokenType::T_CLOSE_PARENTHESIS);
 }
}
