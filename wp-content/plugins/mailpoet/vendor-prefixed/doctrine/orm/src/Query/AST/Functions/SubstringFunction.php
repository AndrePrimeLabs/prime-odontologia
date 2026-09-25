<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST\Functions;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\AST\Node;
use MailPoetVendor\Doctrine\ORM\Query\AST\SimpleArithmeticExpression;
use MailPoetVendor\Doctrine\ORM\Query\Parser;
use MailPoetVendor\Doctrine\ORM\Query\SqlWalker;
use MailPoetVendor\Doctrine\ORM\Query\TokenType;
class SubstringFunction extends FunctionNode
{
 public $stringPrimary;
 public $firstSimpleArithmeticExpression;
 public $secondSimpleArithmeticExpression = null;
 public function getSql(SqlWalker $sqlWalker)
 {
 $optionalSecondSimpleArithmeticExpression = null;
 if ($this->secondSimpleArithmeticExpression !== null) {
 $optionalSecondSimpleArithmeticExpression = $sqlWalker->walkSimpleArithmeticExpression($this->secondSimpleArithmeticExpression);
 }
 return $sqlWalker->getConnection()->getDatabasePlatform()->getSubstringExpression($sqlWalker->walkStringPrimary($this->stringPrimary), $sqlWalker->walkSimpleArithmeticExpression($this->firstSimpleArithmeticExpression), $optionalSecondSimpleArithmeticExpression);
 }
 public function parse(Parser $parser)
 {
 $parser->match(TokenType::T_IDENTIFIER);
 $parser->match(TokenType::T_OPEN_PARENTHESIS);
 $this->stringPrimary = $parser->StringPrimary();
 $parser->match(TokenType::T_COMMA);
 $this->firstSimpleArithmeticExpression = $parser->SimpleArithmeticExpression();
 $lexer = $parser->getLexer();
 if ($lexer->isNextToken(TokenType::T_COMMA)) {
 $parser->match(TokenType::T_COMMA);
 $this->secondSimpleArithmeticExpression = $parser->SimpleArithmeticExpression();
 }
 $parser->match(TokenType::T_CLOSE_PARENTHESIS);
 }
}
