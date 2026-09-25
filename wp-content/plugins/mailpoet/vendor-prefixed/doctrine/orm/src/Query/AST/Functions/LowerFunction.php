<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST\Functions;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\AST\Node;
use MailPoetVendor\Doctrine\ORM\Query\Parser;
use MailPoetVendor\Doctrine\ORM\Query\SqlWalker;
use MailPoetVendor\Doctrine\ORM\Query\TokenType;
use function sprintf;
class LowerFunction extends FunctionNode
{
 public $stringPrimary;
 public function getSql(SqlWalker $sqlWalker)
 {
 return sprintf('LOWER(%s)', $sqlWalker->walkSimpleArithmeticExpression($this->stringPrimary));
 }
 public function parse(Parser $parser)
 {
 $parser->match(TokenType::T_IDENTIFIER);
 $parser->match(TokenType::T_OPEN_PARENTHESIS);
 $this->stringPrimary = $parser->StringPrimary();
 $parser->match(TokenType::T_CLOSE_PARENTHESIS);
 }
}
