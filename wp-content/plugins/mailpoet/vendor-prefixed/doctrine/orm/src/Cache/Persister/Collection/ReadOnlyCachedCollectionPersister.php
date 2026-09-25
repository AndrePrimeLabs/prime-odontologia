<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Cache\Persister\Collection;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Cache\Exception\CannotUpdateReadOnlyCollection;
use MailPoetVendor\Doctrine\ORM\PersistentCollection;
use MailPoetVendor\Doctrine\ORM\Proxy\DefaultProxyClassNameResolver;
class ReadOnlyCachedCollectionPersister extends NonStrictReadWriteCachedCollectionPersister
{
 public function update(PersistentCollection $collection)
 {
 if ($collection->isDirty() && $collection->getSnapshot()) {
 throw CannotUpdateReadOnlyCollection::fromEntityAndField(DefaultProxyClassNameResolver::getClass($collection->getOwner()), $this->association['fieldName']);
 }
 parent::update($collection);
 }
}
