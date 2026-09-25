<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Query;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Query\Exec\SqlFinalizer;
interface OutputWalker
{
 public function getFinalizer($AST) : SqlFinalizer;
}
