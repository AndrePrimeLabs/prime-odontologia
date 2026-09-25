<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\Exec\PreparedExecutorFinalizer;
use MailPoetVendor\Doctrine\ORM\Query\Exec\SingleSelectSqlFinalizer;
use MailPoetVendor\Doctrine\ORM\Query\Exec\SqlFinalizer;
use LogicException;
class SqlOutputWalker extends SqlWalker implements OutputWalker
{
 public function getFinalizer($AST) : SqlFinalizer
 {
 switch (\true) {
 case $AST instanceof AST\SelectStatement:
 return new SingleSelectSqlFinalizer($this->createSqlForFinalizer($AST));
 case $AST instanceof AST\UpdateStatement:
 return new PreparedExecutorFinalizer($this->createUpdateStatementExecutor($AST));
 case $AST instanceof AST\DeleteStatement:
 return new PreparedExecutorFinalizer($this->createDeleteStatementExecutor($AST));
 }
 throw new LogicException('Unexpected AST node type');
 }
}
