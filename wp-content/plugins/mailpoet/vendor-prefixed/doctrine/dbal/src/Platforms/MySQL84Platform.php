<?php
namespace MailPoetVendor\Doctrine\DBAL\Platforms;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Deprecations\Deprecation;
class MySQL84Platform extends MySQL80Platform
{
 protected function getReservedKeywordsClass()
 {
 Deprecation::triggerIfCalledFromOutside('doctrine/dbal', 'https://github.com/doctrine/dbal/issues/4510', 'MySQL84Platform::getReservedKeywordsClass() is deprecated,' . ' use MySQL84Platform::createReservedKeywordsList() instead.');
 return Keywords\MySQL84Keywords::class;
 }
}
