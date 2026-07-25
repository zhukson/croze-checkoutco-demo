export const apiVersion: "2.0";

export type Money = {
  value: string;
  currency: string;
};

export type Payment = {
  id: string;
  status: "pending" | "paid";
};

export type PaymentRequest = {
  amount: Money;
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
