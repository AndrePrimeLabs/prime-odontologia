<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Internal;
if (!defined('ABSPATH')) exit;
use InvalidArgumentException;
use function array_keys;
use function array_pop;
use function array_push;
use function min;
use function spl_object_id;
final class StronglyConnectedComponents
{
 private const NOT_VISITED = 1;
 private const IN_PROGRESS = 2;
 private const VISITED = 3;
 private $nodes = [];
 private $states = [];
 private $edges = [];
 private $dfs = [];
 private $lowlink = [];
 private $maxdfs = 0;
 private $representingNodes = [];
 private $stack = [];
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
 public function addEdge($from, $to) : void
 {
 $fromId = spl_object_id($from);
 $toId = spl_object_id($to);
 $this->edges[$fromId][$toId] = \true;
 }
 public function findStronglyConnectedComponents() : void
 {
 foreach (array_keys($this->nodes) as $oid) {
 if ($this->states[$oid] === self::NOT_VISITED) {
 $this->tarjan($oid);
 }
 }
 }
 private function tarjan(int $oid) : void
 {
 $this->dfs[$oid] = $this->lowlink[$oid] = $this->maxdfs++;
 $this->states[$oid] = self::IN_PROGRESS;
 array_push($this->stack, $oid);
 foreach ($this->edges[$oid] as $adjacentId => $ignored) {
 if ($this->states[$adjacentId] === self::NOT_VISITED) {
 $this->tarjan($adjacentId);
 $this->lowlink[$oid] = min($this->lowlink[$oid], $this->lowlink[$adjacentId]);
 } elseif ($this->states[$adjacentId] === self::IN_PROGRESS) {
 $this->lowlink[$oid] = min($this->lowlink[$oid], $this->dfs[$adjacentId]);
 }
 }
 $lowlink = $this->lowlink[$oid];
 if ($lowlink === $this->dfs[$oid]) {
 $representingNode = null;
 do {
 $unwindOid = array_pop($this->stack);
 if (!$representingNode) {
 $representingNode = $this->nodes[$unwindOid];
 }
 $this->representingNodes[$unwindOid] = $representingNode;
 $this->states[$unwindOid] = self::VISITED;
 } while ($unwindOid !== $oid);
 }
 }
 public function getNodeRepresentingStronglyConnectedComponent($node)
 {
 $oid = spl_object_id($node);
 if (!isset($this->representingNodes[$oid])) {
 throw new InvalidArgumentException('unknown node');
 }
 return $this->representingNodes[$oid];
 }
}
