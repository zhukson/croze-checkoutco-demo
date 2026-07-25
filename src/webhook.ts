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

  if (event.type === "payment.succeeded") {
    order.paymentId = event.data.payment_id;
    order.state = transitionOrder(order.state, event);
    order.fulfilled = true;
    processedEventIds.add(event.id);
  }

  return order;
}
