<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\DBAL\Platforms;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Deprecations\Deprecation;
class MariaDb110700Platform extends MariaDb1010Platform
{
 protected function getReservedKeywordsClass() : string
 {
 Deprecation::triggerIfCalledFromOutside('doctrine/dbal', 'https://github.com/doctrine/dbal/issues/4510', 'MariaDb110700Platform::getReservedKeywordsClass() is deprecated,' . ' use MariaDb110700Platform::createReservedKeywordsList() instead.');
 return Keywords\MariaDb117Keywords::class;
 }
}
