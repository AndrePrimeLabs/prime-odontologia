<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query;
use MailPoetVendor\Doctrine\ORM\Query\Exec\AbstractSqlExecutor;
use MailPoetVendor\Doctrine\ORM\Query\Exec\SqlFinalizer;
use LogicException;
use function sprintf;
class ParserResult
{
 private const LEGACY_PROPERTY_MAPPING = ['sqlExecutor' => '_sqlExecutor', 'resultSetMapping' => '_resultSetMapping', 'parameterMappings' => '_parameterMappings', 'sqlFinalizer' => 'sqlFinalizer'];
 private $sqlExecutor;
 private $sqlFinalizer;
 private $resultSetMapping;
 private $parameterMappings = [];
 public function __construct()
 {
 $this->resultSetMapping = new ResultSetMapping();
 }
 public function getResultSetMapping()
 {
 return $this->resultSetMapping;
 }
 public function setResultSetMapping(ResultSetMapping $rsm)
 {
 $this->resultSetMapping = $rsm;
 }
 public function setSqlExecutor($executor)
 {
 $this->sqlExecutor = $executor;
 }
 public function getSqlExecutor()
 {
 return $this->sqlExecutor;
 }
 public function setSqlFinalizer(SqlFinalizer $finalizer) : void
 {
 $this->sqlFinalizer = $finalizer;
 }
 public function prepareSqlExecutor(Query $query) : AbstractSqlExecutor
 {
 if ($this->sqlFinalizer !== null) {
 return $this->sqlFinalizer->createExecutor($query);
 }
 if ($this->sqlExecutor !== null) {
 return $this->sqlExecutor;
 }
 throw new LogicException('This ParserResult lacks both the SqlFinalizer as well as the (legacy) SqlExecutor');
 }
 public function addParameterMapping($dqlPosition, $sqlPosition)
 {
 $this->parameterMappings[$dqlPosition][] = $sqlPosition;
 }
 public function getParameterMappings()
 {
 return $this->parameterMappings;
 }
 public function getSqlParameterPositions($dqlPosition)
 {
 return $this->parameterMappings[$dqlPosition];
 }
 public function __wakeup() : void
 {
 $this->__unserialize((array) $this);
 }
 public function __unserialize(array $data) : void
 {
 foreach (self::LEGACY_PROPERTY_MAPPING as $property => $legacyProperty) {
 $this->{$property} = $data[sprintf("\x00%s\x00%s", self::class, $legacyProperty)] ?? $data[self::class][$legacyProperty] ?? $data[sprintf("\x00%s\x00%s", self::class, $property)] ?? $data[self::class][$property] ?? $this->{$property} ?? null;
 }
 }
}
