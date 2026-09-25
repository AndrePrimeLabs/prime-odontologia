<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\Exec;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\DBAL\LockMode;
use MailPoetVendor\Doctrine\ORM\Query;
use MailPoetVendor\Doctrine\ORM\Query\QueryException;
use MailPoetVendor\Doctrine\ORM\Utility\LockSqlHelper;
class SingleSelectSqlFinalizer implements SqlFinalizer
{
 use LockSqlHelper;
 private $sql;
 public function __construct(string $sql)
 {
 $this->sql = $sql;
 }
 public function finalizeSql(Query $query) : string
 {
 $platform = $query->getEntityManager()->getConnection()->getDatabasePlatform();
 $sql = $platform->modifyLimitQuery($this->sql, $query->getMaxResults(), $query->getFirstResult());
 $lockMode = $query->getHint(Query::HINT_LOCK_MODE) ?: LockMode::NONE;
 if ($lockMode !== LockMode::NONE && $lockMode !== LockMode::OPTIMISTIC && $lockMode !== LockMode::PESSIMISTIC_READ && $lockMode !== LockMode::PESSIMISTIC_WRITE) {
 throw QueryException::invalidLockMode();
 }
 if ($lockMode === LockMode::PESSIMISTIC_READ) {
 $sql .= ' ' . $this->getReadLockSQL($platform);
 } elseif ($lockMode === LockMode::PESSIMISTIC_WRITE) {
 $sql .= ' ' . $this->getWriteLockSQL($platform);
 }
 return $sql;
 }
 public function createExecutor(Query $query) : AbstractSqlExecutor
 {
 return new FinalizedSelectExecutor($this->finalizeSql($query));
 }
}
