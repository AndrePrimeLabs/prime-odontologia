<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\Exec;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query;
interface SqlFinalizer
{
 public function createExecutor(Query $query) : AbstractSqlExecutor;
}
