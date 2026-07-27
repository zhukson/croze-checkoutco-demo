import type { Refund, RefundsClient } from "@acmepay/sdk";
import type { OrderRecord } from "./order-state.js";

export type { Refund, RefundsClient } from "@acmepay/sdk";

export async function requestRefund(
  client: RefundsClient,
  order: OrderRecord,
): Promise<Refund> {
  if (!order.paymentId) {
    throw new Error("cannot refund an order without a payment");
  }

  if (order.state !== "paid") {
    throw new Error("only paid orders can be refunded");
  }

  // AcmePay v2 migration: the request acknowledges work but does not complete it.
  order.state = "refund_pending";

  try {
    const refund = await client.create({
      payment_id: order.paymentId,
    });
    // AcmePay v2 migration: a webhook may complete while the request is in flight.
    const stateAfterRequest = Reflect.get(order, "state") as OrderRecord["state"];
    if (stateAfterRequest === "refunded") {
      if (order.refundId !== refund.id) {
        throw new Error(
          "provider refund ID conflicts with the completed webhook",
        );
      }
      return refund;
    }
    if (stateAfterRequest !== "refund_pending" || order.refundId) {
      throw new Error("refund state changed while the request was in flight");
    }
    order.refundId = refund.id;
    return refund;
  } catch (error) {
    // AcmePay v2 migration: roll back only our own still-pending transition.
    if (order.state === "refund_pending" && !order.refundId) {
      order.state = "paid";
    }
    throw error;
  }
}
