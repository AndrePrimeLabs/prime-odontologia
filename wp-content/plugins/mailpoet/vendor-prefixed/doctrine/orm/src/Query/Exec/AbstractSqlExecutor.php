<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\Exec;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\DBAL\Cache\QueryCacheProfile;
use MailPoetVendor\Doctrine\DBAL\Connection;
use MailPoetVendor\Doctrine\DBAL\Result;
use MailPoetVendor\Doctrine\DBAL\Types\Type;
use function array_diff;
use function array_keys;
use function array_map;
use function array_values;
use function str_replace;
abstract class AbstractSqlExecutor
{
 protected $_sqlStatements;
 protected $sqlStatements;
 protected $queryCacheProfile;
 public function __construct()
 {
 // @phpstan-ignore property.deprecated
 $this->_sqlStatements =& $this->sqlStatements;
 }
 public function getSqlStatements()
 {
 return $this->sqlStatements;
 }
 public function setQueryCacheProfile(QueryCacheProfile $qcp) : void
 {
 $this->queryCacheProfile = $qcp;
 }
 public function removeQueryCacheProfile() : void
 {
 $this->queryCacheProfile = null;
 }
 public abstract function execute(Connection $conn, array $params, array $types);
 public function __sleep() : array
 {
 return array_values(array_diff(array_map(static function (string $prop) : string {
 return str_replace("\x00*\x00", '', $prop);
 }, array_keys((array) $this)), ['_sqlStatements']));
 }
 public function __wakeup() : void
 {
 // @phpstan-ignore property.deprecated
 if ($this->_sqlStatements !== null && $this->sqlStatements === null) {
 // @phpstan-ignore property.deprecated
 $this->sqlStatements = $this->_sqlStatements;
 }
 // @phpstan-ignore property.deprecated
 $this->_sqlStatements =& $this->sqlStatements;
 }
}
