import type { Refund, RefundsClient } from "@acmepay/sdk";
import type { OrderRecord } from "./order-state.js";

export type { Refund, RefundsClient } from "@acmepay/sdk";

export async function requestRefund(
  client: RefundsClient,
  order: OrderRecord,
): Promise<Refund> {
  if (order.state !== "paid") {
    throw new Error("Refunds require a paid order");
  }

  if (order.paymentId === null) {
    throw new Error("Refunds require a payment ID");
  }

  const paymentId = order.paymentId;
  // AcmePay v2 migration: expose the pending state while creation is in flight.
  order.state = "refund_pending";

  let refund: Refund;
  try {
    refund = await client.create({ payment_id: paymentId });
  } catch (error) {
    if (order.state === "refund_pending") {
      order.state = "paid";
    }
    throw error;
  }

  if (order.refundId === null) {
    order.refundId = refund.id;
  } else if (order.refundId !== refund.id) {
    throw new Error("Refund response does not match the completed refund");
  }

  return refund;
}
