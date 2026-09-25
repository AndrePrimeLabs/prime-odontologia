<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\DBAL\Platforms\Keywords;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Deprecations\Deprecation;
use function array_diff;
use function array_merge;
class MySQL84Keywords extends MySQL80Keywords
{
 public function getName()
 {
 Deprecation::triggerIfCalledFromOutside('doctrine/dbal', 'https://github.com/doctrine/dbal/pull/5433', 'MySQL84Keywords::getName() is deprecated.');
 return 'MySQL84';
 }
 protected function getKeywords()
 {
 $keywords = parent::getKeywords();
 // Removed Keywords and Reserved Words
 $keywords = array_diff($keywords, ['MASTER_BIND', 'MASTER_SSL_VERIFY_SERVER_CERT']);
 // New Keywords and Reserved Words
 $keywords = array_merge($keywords, ['AUTO', 'BERNOULLI', 'GTIDS', 'LOG', 'MANUAL', 'PARALLEL', 'PARSE_TREE', 'QUALIFY', 'S3', 'TABLESAMPLE']);
 return $keywords;
 }
}
