<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\Persistence;
if (!defined('ABSPATH')) exit;
use UnexpectedValueException;
interface ObjectRepository
{
 public function find($id);
 public function findAll();
 public function findBy(array $criteria, ?array $orderBy = null, ?int $limit = null, ?int $offset = null);
 public function findOneBy(array $criteria);
 public function getClassName();
}
