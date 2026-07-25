export const apiVersion: "1.0";

export type Payment = {
  id: string;
  status: "pending" | "paid";
};

export type PaymentRequest = {
  amount_cents: number;
  currency: string;
  reference: string;
};

export interface PaymentsClient {
  create(input: PaymentRequest): Promise<Payment>;
}

export type Refund = {
  id: string;
  status: "pending";
};

export interface RefundsClient {
  create(input: { payment_id: string }): Promise<Refund>;
}
