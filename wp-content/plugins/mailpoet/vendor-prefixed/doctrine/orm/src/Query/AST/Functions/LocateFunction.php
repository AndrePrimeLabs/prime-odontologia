<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST\Functions;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\AST\Node;
use MailPoetVendor\Doctrine\ORM\Query\AST\SimpleArithmeticExpression;
use MailPoetVendor\Doctrine\ORM\Query\Parser;
use MailPoetVendor\Doctrine\ORM\Query\SqlWalker;
use MailPoetVendor\Doctrine\ORM\Query\TokenType;
class LocateFunction extends FunctionNode
{
 public $firstStringPrimary;
 public $secondStringPrimary;
 public $simpleArithmeticExpression = \false;
 public function getSql(SqlWalker $sqlWalker)
 {
 $platform = $sqlWalker->getConnection()->getDatabasePlatform();
 $firstString = $sqlWalker->walkStringPrimary($this->firstStringPrimary);
 $secondString = $sqlWalker->walkStringPrimary($this->secondStringPrimary);
 if ($this->simpleArithmeticExpression) {
 return $platform->getLocateExpression($secondString, $firstString, $sqlWalker->walkSimpleArithmeticExpression($this->simpleArithmeticExpression));
 }
 return $platform->getLocateExpression($secondString, $firstString);
 }
 public function parse(Parser $parser)
 {
 $parser->match(TokenType::T_IDENTIFIER);
 $parser->match(TokenType::T_OPEN_PARENTHESIS);
 $this->firstStringPrimary = $parser->StringPrimary();
 $parser->match(TokenType::T_COMMA);
 $this->secondStringPrimary = $parser->StringPrimary();
 $lexer = $parser->getLexer();
 if ($lexer->isNextToken(TokenType::T_COMMA)) {
 $parser->match(TokenType::T_COMMA);
 $this->simpleArithmeticExpression = $parser->SimpleArithmeticExpression();
 }
 $parser->match(TokenType::T_CLOSE_PARENTHESIS);
 }
}
