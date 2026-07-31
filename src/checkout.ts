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

const MAX_AMOUNT_CENTS = 9_999_999_999_999;

export async function createCheckout(
  client: PaymentsClient,
  input: CheckoutInput,
): Promise<CheckoutResult> {
  if (
    !Number.isSafeInteger(input.amountCents) ||
    input.amountCents < 0 ||
    input.amountCents > MAX_AMOUNT_CENTS
  ) {
    throw new RangeError("amountCents must be a supported non-negative integer");
  }

  if (
    typeof input.currency !== "string" ||
    !/^[A-Za-z]{3}$/.test(input.currency)
  ) {
    throw new TypeError("currency must be a three-letter code");
  }

  const whole = Math.floor(input.amountCents / 100);
  const fractional = String(input.amountCents % 100).padStart(2, "0");
  const payment = await client.create({
    amount: {
      value: `${whole}.${fractional}`,
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
