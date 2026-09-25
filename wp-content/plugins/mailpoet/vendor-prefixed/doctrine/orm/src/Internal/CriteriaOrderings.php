<?php
declare (strict_types=1);
namespace MailPoetVendor\Doctrine\ORM\Internal;
if (!defined('ABSPATH')) exit;
use MailPoetVendor\Doctrine\Common\Collections\Criteria;
use MailPoetVendor\Doctrine\Common\Collections\Order;
use function array_map;
use function class_exists;
use function method_exists;
use function strtoupper;
trait CriteriaOrderings
{
 private static function getCriteriaOrderings(Criteria $criteria) : array
 {
 if (!method_exists(Criteria::class, 'orderings')) {
 // @phpstan-ignore method.deprecated
 return $criteria->getOrderings();
 }
 return array_map(static function (Order $order) : string {
 return $order->value;
 }, $criteria->orderings());
 }
 private static function mapToOrderEnumIfAvailable(array $orderings) : array
 {
 if (!class_exists(Order::class)) {
 return $orderings;
 }
 return array_map(static function (string $order) : Order {
 return Order::from(strtoupper($order));
 }, $orderings);
 }
}
