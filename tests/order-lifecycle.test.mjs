import assert from "node:assert/strict";
import test from "node:test";

import { apiVersion } from "@acmepay/sdk";
import { requestRefund } from "../dist/refund.js";
import { handleWebhook } from "../dist/webhook.js";

function newOrder() {
  return {
    id: "order_123",
    paymentId: null,
    refundId: null,
    state: "created",
    fulfilled: false,
  };
}

test("a paid webhook fulfills an order", () => {
  const order = newOrder();
  const processed = new Set();
  const event = {
    id: "evt_paid",
    type: "payment.succeeded",
    data: {
      payment_id: "pay_123",
      order_id: "order_123",
      status: "paid",
    },
  };

  handleWebhook(order, event, processed);

  assert.equal(order.paymentId, "pay_123");
  assert.equal(order.state, "paid");
  assert.equal(order.fulfilled, true);
  assert.equal(processed.has("evt_paid"), true);
});

test("pending payments follow the installed SDK contract", () => {
  const order = newOrder();
  const processed = new Set();

  handleWebhook(
    order,
    {
      id: "evt_pending",
      type: "payment.succeeded",
      data: {
        payment_id: "pay_123",
        order_id: "order_123",
        status: "pending",
      },
    },
    processed,
  );

  if (apiVersion === "2.0") {
    assert.equal(order.state, "payment_pending");
    assert.equal(order.fulfilled, false);
  } else {
    assert.equal(order.state, "paid");
    assert.equal(order.fulfilled, true);
  }
});

test("an already-processed webhook is idempotent", () => {
  const order = newOrder();
  const processed = new Set(["evt_duplicate"]);

  handleWebhook(
    order,
    {
      id: "evt_duplicate",
      type: "payment.succeeded",
      data: {
        payment_id: "pay_other",
        order_id: "order_123",
        status: "paid",
      },
    },
    processed,
  );

  assert.deepEqual(order, newOrder());
});

test("refund creation uses the order payment ID", async () => {
  const order = {
    ...newOrder(),
    paymentId: "pay_123",
    state: "paid",
    fulfilled: true,
  };
  let request;
  const client = {
    async create(input) {
      request = input;
      return { id: "ref_123", status: "pending" };
    },
  };

  const refund = await requestRefund(client, order);

  assert.deepEqual(request, { payment_id: "pay_123" });
  assert.deepEqual(refund, { id: "ref_123", status: "pending" });

  if (apiVersion === "2.0") {
    assert.equal(order.state, "refund_pending");
    handleWebhook(
      order,
      {
        id: "evt_refunded",
        type: "refund.completed",
        data: {
          refund_id: "ref_123",
          payment_id: "pay_123",
          order_id: "order_123",
        },
      },
      new Set(),
    );
    assert.equal(order.state, "refunded");
    assert.equal(order.refundId, "ref_123");
  } else {
    assert.equal(order.state, "refunded");
  }
});
