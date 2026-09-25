<?php declare(strict_types = 1);

namespace MailPoet\Premium\Automation\Integrations\MailPoetPremium;

if (!defined('ABSPATH')) exit;


/**
 * Tracks how many custom-action → custom-trigger hops led to the hook currently
 * being dispatched, so self- or cross-referencing automations cannot chain runs
 * without bound. The depth is persisted in the custom data subject of each run
 * and therefore survives the asynchronous step scheduling in between. It only
 * follows synchronous listeners: a listener that defers work to its own job and
 * fires a custom trigger hook from there starts a new chain at depth zero.
 */
class CustomHookChain {
  public const MAX_DEPTH = 5;

  /** @var int */
  private $depth = 0;

  public function dispatch(int $depth, callable $callback): void {
    $previousDepth = $this->depth;
    $this->depth = $depth;
    try {
      $callback();
    } finally {
      $this->depth = $previousDepth;
    }
  }

  public function getCurrentDepth(): int {
    return $this->depth;
  }

  public function isDepthAllowed(int $depth): bool {
    return $depth <= self::MAX_DEPTH;
  }
}
