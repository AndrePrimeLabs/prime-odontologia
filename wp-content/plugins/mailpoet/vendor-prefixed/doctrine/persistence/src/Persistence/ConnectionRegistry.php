<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
interface ConnectionRegistry
{
 public function getDefaultConnectionName();
 public function getConnection(?string $name = null);
 public function getConnections();
 public function getConnectionNames();
}
