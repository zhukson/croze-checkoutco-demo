# CheckoutCo × AcmePay

This is CheckoutCo's TypeScript checkout service. It is pinned to AcmePay SDK
v1.8.2 and uses provider webhooks to manage payment and refund state.

CheckoutCo uses automated provider updates to keep the integration current
without changing its stable business behavior.

## The breaking change

AcmePay v2 introduces three contract changes:

1. Payment requests replace `amount_cents` and `currency` with a typed
   `amount: { value, currency }` object.
2. `payment.succeeded` can carry `status: "pending"` and must not always
   fulfill the order.
3. Refund creation is asynchronous. Orders remain `refund_pending` until a
   `refund.completed` webhook arrives.

The local packages under `vendor/` model the v1.8.2 and v2 SDK contracts. No
external AcmePay service is required.

## Run the baseline

Requirements: Node.js 22 and npm 10 or newer.

```bash
npm ci
npm run typecheck
npm test
```

The CI workflow exposes the exact checks Unbreak waits for:

- `Unbreak / typecheck`
- `Unbreak / tests`

## Exact migration contract

The expected AcmePay v2 pull request changes exactly six files:

- `package.json`
- `package-lock.json`
- `src/checkout.ts`
- `src/order-state.ts`
- `src/refund.ts`
- `src/webhook.ts`

Canonical post-migration versions live in
[`fixtures/expected-v2`](fixtures/expected-v2). The test suite, CI workflow,
TypeScript configuration, and local SDK fixtures are intentionally unchanged.

To preview the real migration without touching this baseline:

```bash
node scripts/new-demo-copy.mjs
# Copy the printed path, then:
node scripts/apply-expected-v2.mjs /tmp/unbreak-checkoutco-XXXXXXXX
cd /tmp/unbreak-checkoutco-XXXXXXXX
npm ci && npm run typecheck && npm test
```

`apply-expected-v2.mjs` refuses to operate on this source repository, refuses
to overwrite a modified target, and only writes the six declared files.

## Reset for another demo

Do not reset or force-checkout the source repository. Run
`node scripts/new-demo-copy.mjs` again to create a fresh disposable baseline.
The script never deletes or overwrites an existing directory.

See [the migration notes](docs/acmepay-v2-migration.md) for the expected pull
request story and verification criteria.
