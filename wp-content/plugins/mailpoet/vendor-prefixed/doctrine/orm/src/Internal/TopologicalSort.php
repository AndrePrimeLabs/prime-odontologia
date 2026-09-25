<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Internal;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\ORM\Internal\TopologicalSort\CycleDetectedException;
use function array_keys;
use function spl_object_id;
final class TopologicalSort
{
 private const NOT_VISITED = 1;
 private const IN_PROGRESS = 2;
 private const VISITED = 3;
 private $nodes = [];
 private $states = [];
 private $edges = [];
 private $sortResult = [];
 public function addNode($node) : void
 {
 $id = spl_object_id($node);
 $this->nodes[$id] = $node;
 $this->states[$id] = self::NOT_VISITED;
 $this->edges[$id] = [];
 }
 public function hasNode($node) : bool
 {
 return isset($this->nodes[spl_object_id($node)]);
 }
 public function addEdge($from, $to, bool $optional) : void
 {
 $fromId = spl_object_id($from);
 $toId = spl_object_id($to);
 if (isset($this->edges[$fromId][$toId]) && $this->edges[$fromId][$toId] === \false) {
 return;
 // we already know about this dependency, and it is not optional
 }
 $this->edges[$fromId][$toId] = $optional;
 }
 public function sort() : array
 {
 foreach (array_keys($this->nodes) as $oid) {
 if ($this->states[$oid] === self::NOT_VISITED) {
 $this->visit($oid);
 }
 }
 return $this->sortResult;
 }
 private function visit(int $oid) : void
 {
 if ($this->states[$oid] === self::IN_PROGRESS) {
 // This node is already on the current DFS stack. We've found a cycle!
 throw new CycleDetectedException($this->nodes[$oid]);
 }
 if ($this->states[$oid] === self::VISITED) {
 // We've reached a node that we've already seen, including all
 // other nodes that are reachable from here. We're done here, return.
 return;
 }
 $this->states[$oid] = self::IN_PROGRESS;
 // Continue the DFS downwards the edge list
 foreach ($this->edges[$oid] as $adjacentId => $optional) {
 try {
 $this->visit($adjacentId);
 } catch (CycleDetectedException $exception) {
 if ($exception->isCycleCollected()) {
 // There is a complete cycle downstream of the current node. We cannot
 // do anything about that anymore.
 throw $exception;
 }
 if ($optional) {
 // The current edge is part of a cycle, but it is optional and the closest
 // such edge while backtracking. Break the cycle here by skipping the edge
 // and continuing with the next one.
 continue;
 }
 // We have found a cycle and cannot break it at $edge. Best we can do
 // is to backtrack from the current vertex, hoping that somewhere up the
 // stack this can be salvaged.
 $this->states[$oid] = self::NOT_VISITED;
 $exception->addToCycle($this->nodes[$oid]);
 throw $exception;
 }
 }
 // We have traversed all edges and visited all other nodes reachable from here.
 // So we're done with this vertex as well.
 $this->states[$oid] = self::VISITED;
 $this->sortResult[] = $this->nodes[$oid];
 }
}
