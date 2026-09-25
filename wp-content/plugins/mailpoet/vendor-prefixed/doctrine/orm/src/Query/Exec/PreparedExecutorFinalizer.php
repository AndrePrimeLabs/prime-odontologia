<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query\Exec;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query;
final class PreparedExecutorFinalizer implements SqlFinalizer
{
 private $executor;
 public function __construct(AbstractSqlExecutor $exeutor)
 {
 $this->executor = $exeutor;
 }
 public function createExecutor(Query $query) : AbstractSqlExecutor
 {
 return $this->executor;
 }
}
