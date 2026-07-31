import type { Refund, RefundsClient } from "@acmepay/sdk";
import type { OrderRecord } from "./order-state.js";

export type { Refund, RefundsClient } from "@acmepay/sdk";

export async function requestRefund(
  client: RefundsClient,
  order: OrderRecord,
): Promise<Refund> {
  const refund = await client.create({
    payment_id: order.paymentId ?? "",
  });

  order.refundId = refund.id;
  // AcmePay v2 migration: completion is authoritative via refund.completed.
  order.state = "refund_pending";
  return refund;
}
