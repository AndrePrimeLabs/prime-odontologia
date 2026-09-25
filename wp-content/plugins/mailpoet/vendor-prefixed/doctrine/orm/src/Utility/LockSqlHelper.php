<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Utility;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\DBAL\Platforms\AbstractMySQLPlatform;
use MailPoetVendor\Doctrine\DBAL\Platforms\AbstractPlatform;
use MailPoetVendor\Doctrine\DBAL\Platforms\DB2Platform;
use MailPoetVendor\Doctrine\DBAL\Platforms\MySQLPlatform;
use MailPoetVendor\Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use MailPoetVendor\Doctrine\DBAL\Platforms\SqlitePlatform;
use MailPoetVendor\Doctrine\DBAL\Platforms\SQLServerPlatform;
trait LockSqlHelper
{
 private function getReadLockSQL(AbstractPlatform $platform) : string
 {
 if ($platform instanceof AbstractMySQLPlatform || $platform instanceof MySQLPlatform) {
 return 'LOCK IN SHARE MODE';
 }
 if ($platform instanceof PostgreSQLPlatform) {
 return 'FOR SHARE';
 }
 return $this->getWriteLockSQL($platform);
 }
 private function getWriteLockSQL(AbstractPlatform $platform) : string
 {
 if ($platform instanceof DB2Platform) {
 return 'WITH RR USE AND KEEP UPDATE LOCKS';
 }
 if ($platform instanceof SqlitePlatform) {
 return '';
 }
 if ($platform instanceof SQLServerPlatform) {
 return '';
 }
 return 'FOR UPDATE';
 }
}
