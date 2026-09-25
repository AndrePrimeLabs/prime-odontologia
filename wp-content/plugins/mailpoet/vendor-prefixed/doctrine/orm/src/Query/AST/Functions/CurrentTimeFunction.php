<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\AST\Functions;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\Parser;
use MailPoetVendor\Doctrine\ORM\Query\SqlWalker;
use MailPoetVendor\Doctrine\ORM\Query\TokenType;
class CurrentTimeFunction extends FunctionNode
{
 public function getSql(SqlWalker $sqlWalker)
 {
 return $sqlWalker->getConnection()->getDatabasePlatform()->getCurrentTimeSQL();
 }
 public function parse(Parser $parser)
 {
 $parser->match(TokenType::T_IDENTIFIER);
 $parser->match(TokenType::T_OPEN_PARENTHESIS);
 $parser->match(TokenType::T_CLOSE_PARENTHESIS);
 }
}
