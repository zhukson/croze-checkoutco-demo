import {
  type OrderRecord,
  type WebhookEvent,
  transitionOrder,
} from "./order-state.js";

export function handleWebhook(
  order: OrderRecord,
  event: WebhookEvent,
  processedEventIds: Set<string>,
): OrderRecord {
  if (processedEventIds.has(event.id)) {
    return order;
  }

  // AcmePay v2 migration: reject events that do not belong to this order.
  if (event.data.order_id !== order.id) {
    return order;
  }

  if (event.type === "payment.succeeded") {
    if (order.paymentId && order.paymentId !== event.data.payment_id) {
      return order;
    }
    order.paymentId = event.data.payment_id;
    order.state = transitionOrder(order.state, event);
    // AcmePay v2 migration: pending payment events must never fulfill an order.
    order.fulfilled = order.fulfilled || event.data.status === "paid";
    processedEventIds.add(event.id);
    return order;
  }

  // AcmePay v2 migration: validate ownership before accepting final refund state.
  if (event.type === "refund.completed") {
    if (
      !order.paymentId ||
      order.paymentId !== event.data.payment_id ||
      (order.refundId && order.refundId !== event.data.refund_id) ||
      (order.state !== "refund_pending" && order.state !== "refunded")
    ) {
      return order;
    }
    order.refundId = event.data.refund_id;
    order.state = transitionOrder(order.state, event);
    processedEventIds.add(event.id);
  }

  return order;
}
