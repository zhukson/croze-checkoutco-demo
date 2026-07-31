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
    amount: {
      value: (input.amountCents / 100).toFixed(2),
      currency: input.currency.toUpperCase(),
    },
    reference: input.orderId,
  });

  return {
    paymentId: payment.id,
    paymentStatus: payment.status,
    orderId: input.orderId,
  };
}
