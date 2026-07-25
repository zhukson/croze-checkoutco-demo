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
  const maximumAmountCents = 9_999_999_999_999;
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 0) {
    throw new Error("amountCents must be a non-negative safe integer");
  }

  if (input.amountCents > maximumAmountCents) {
    throw new Error("amountCents exceeds the supported maximum");
  }

  if (!/^[A-Za-z]{3}$/.test(input.currency)) {
    throw new Error("currency must be a three-letter code");
  }

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
