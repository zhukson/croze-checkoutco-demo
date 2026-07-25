import assert from "node:assert/strict";
import test from "node:test";

import { apiVersion } from "@acmepay/sdk";
import { createCheckout } from "../dist/checkout.js";

test("creates a payment and returns the stable checkout result", async () => {
  let request;
  const client = {
    async create(input) {
      request = input;
      return { id: "pay_123", status: "paid" };
    },
  };

  const result = await createCheckout(client, {
    amountCents: 2599,
    currency: "usd",
    orderId: "order_123",
  });

  assert.equal(request.reference, "order_123");
  if (apiVersion === "2.0") {
    assert.deepEqual(request.amount, {
      value: "25.99",
      currency: "USD",
    });
    assert.equal("amount_cents" in request, false);
  } else {
    assert.equal(request.amount_cents, 2599);
    assert.equal(request.currency, "usd");
  }
  assert.deepEqual(result, {
    paymentId: "pay_123",
    paymentStatus: "paid",
    orderId: "order_123",
  });
});
