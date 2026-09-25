<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Tools\Pagination;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\AST;
use MailPoetVendor\Doctrine\ORM\Query\Exec\FinalizedSelectExecutor;
use MailPoetVendor\Doctrine\ORM\Query\Exec\PreparedExecutorFinalizer;
use MailPoetVendor\Doctrine\ORM\Query\Exec\SqlFinalizer;
use MailPoetVendor\Doctrine\ORM\Query\SqlOutputWalker;
use MailPoetVendor\Doctrine\ORM\Utility\PersisterHelper;
use RuntimeException;
use function count;
use function reset;
final class RootTypeWalker extends SqlOutputWalker
{
 public function walkSelectStatement(AST\SelectStatement $AST) : string
 {
 // Get the root entity and alias from the AST fromClause
 $from = $AST->fromClause->identificationVariableDeclarations;
 if (count($from) > 1) {
 throw new RuntimeException('Can only process queries that select only one FROM component');
 }
 $fromRoot = reset($from);
 $rootAlias = $fromRoot->rangeVariableDeclaration->aliasIdentificationVariable;
 $rootClass = $this->getMetadataForDqlAlias($rootAlias);
 $identifierFieldName = $rootClass->getSingleIdentifierFieldName();
 return PersisterHelper::getTypeOfField($identifierFieldName, $rootClass, $this->getQuery()->getEntityManager())[0];
 }
 public function getFinalizer($AST) : SqlFinalizer
 {
 if (!$AST instanceof AST\SelectStatement) {
 throw new RuntimeException(self::class . ' is to be used on SelectStatements only');
 }
 return new PreparedExecutorFinalizer(new FinalizedSelectExecutor($this->walkSelectStatement($AST)));
 }
}
