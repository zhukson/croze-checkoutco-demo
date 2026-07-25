import type { Payment, PaymentsClient } from "@acmepay/sdk";

export type { Payment, PaymentsClient } from "@acmepay/sdk";

export type CheckoutInput = {
  amountCents: number;
  currency: string;
  orderId: string;
};

export type CheckoutResult = {
  paymentId: string;
  paymentStatus: Payment["status"];
  orderId: string;
};

export async function createCheckout(
  client: PaymentsClient,
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const payment = await client.create({
    amount_cents: input.amountCents,
    currency: input.currency,
    reference: input.orderId,
  });

  return {
    paymentId: payment.id,
    paymentStatus: payment.status,
    orderId: input.orderId,
  };
}
