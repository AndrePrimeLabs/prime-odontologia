<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\Exec;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\DBAL\Connection;
use MailPoetVendor\Doctrine\DBAL\Result;
use MailPoetVendor\Doctrine\DBAL\Types\Type;
class FinalizedSelectExecutor extends AbstractSqlExecutor
{
 public function __construct(string $sql)
 {
 parent::__construct();
 $this->sqlStatements = $sql;
 }
 public function execute(Connection $conn, array $params, array $types) : Result
 {
 return $conn->executeQuery($this->getSqlStatements(), $params, $types, $this->queryCacheProfile);
 }
}
