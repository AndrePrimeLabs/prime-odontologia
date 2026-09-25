<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
interface ManagerRegistry extends ConnectionRegistry
{
 public function getDefaultManagerName();
 public function getManager(?string $name = null);
 public function getManagers();
 public function resetManager(?string $name = null);
 public function getManagerNames();
 public function getRepository(string $persistentObject, ?string $persistentManagerName = null);
 public function getManagerForClass(string $class);
}
