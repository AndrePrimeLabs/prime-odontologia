<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\DBAL\Platforms\Keywords;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Deprecations\Deprecation;
use function array_merge;
class MariaDb117Keywords extends MariaDb102Keywords
{
 public function getName() : string
 {
 Deprecation::triggerIfCalledFromOutside('doctrine/dbal', 'https://github.com/doctrine/dbal/pull/5433', 'MariaDb117Keywords::getName() is deprecated.');
 return 'MariaDb117';
 }
 protected function getKeywords() : array
 {
 $keywords = parent::getKeywords();
 // New Keywords and Reserved Words
 $keywords = array_merge($keywords, ['VECTOR']);
 return $keywords;
 }
}
