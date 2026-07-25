export type PaymentSucceededEvent = {
  id: string;
  type: "payment.succeeded";
  data: {
    payment_id: string;
    order_id: string;
    status: "pending" | "paid";
  };
};

export type RefundCompletedEvent = {
  id: string;
  type: "refund.completed";
  data: {
    refund_id: string;
    payment_id: string;
    order_id: string;
  };
};

export type WebhookEvent = PaymentSucceededEvent | RefundCompletedEvent;

export interface OrderRecord {
  id: string;
  paymentId: string | null;
  refundId: string | null;
  state: OrderState;
  fulfilled: boolean;
}

export type OrderState = "created" | "paid" | "refunded";

export function transitionOrder(
  current: OrderState,
  event: WebhookEvent,
): OrderState {
  if (event.type === "payment.succeeded") {
    return "paid";
  }

  return current;
}
