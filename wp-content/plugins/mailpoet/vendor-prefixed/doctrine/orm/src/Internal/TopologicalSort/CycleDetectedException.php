<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Internal\TopologicalSort;
if (!defined('ABSPATH')) exit;
use RuntimeException;
use function array_unshift;
class CycleDetectedException extends RuntimeException
{
 private $cycle;
 private $startNode;
 private $cycleCollected = \false;
 public function __construct($startNode)
 {
 parent::__construct('A cycle has been detected, so a topological sort is not possible. The getCycle() method provides the list of nodes that form the cycle.');
 $this->startNode = $startNode;
 $this->cycle = [$startNode];
 }
 public function getCycle() : array
 {
 return $this->cycle;
 }
 public function addToCycle($node) : void
 {
 array_unshift($this->cycle, $node);
 if ($node === $this->startNode) {
 $this->cycleCollected = \true;
 }
 }
 public function isCycleCollected() : bool
 {
 return $this->cycleCollected;
 }
}
