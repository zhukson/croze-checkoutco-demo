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

  if (event.data.order_id !== order.id) {
    return order;
  }

  if (event.type === "payment.succeeded") {
    if (order.paymentId !== null && order.paymentId !== event.data.payment_id) {
      return order;
    }

    order.paymentId ??= event.data.payment_id;
    order.state = transitionOrder(order.state, event);
    // AcmePay v2 migration: pending payment events must not fulfill orders.
    if (event.data.status === "paid" && order.state === "paid") {
      order.fulfilled = true;
    }
  } else {
    if (order.paymentId !== event.data.payment_id) {
      return order;
    }

    if (order.refundId === null) {
      if (order.state !== "refund_pending") {
        return order;
      }
      order.refundId = event.data.refund_id;
    } else if (order.refundId !== event.data.refund_id) {
      return order;
    }

    order.state = transitionOrder(order.state, event);
  }

  processedEventIds.add(event.id);
  return order;
}
