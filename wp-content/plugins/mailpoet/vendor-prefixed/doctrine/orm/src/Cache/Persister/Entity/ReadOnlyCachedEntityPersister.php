<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Cache\Persister\Entity;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Cache\Exception\CannotUpdateReadOnlyEntity;
use MailPoetVendor\Doctrine\ORM\Proxy\DefaultProxyClassNameResolver;
class ReadOnlyCachedEntityPersister extends NonStrictReadWriteCachedEntityPersister
{
 public function update($entity)
 {
 throw CannotUpdateReadOnlyEntity::fromEntity(DefaultProxyClassNameResolver::getClass($entity));
 }
}
