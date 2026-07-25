# AcmePay v2 migration

## Expected pull request

**Title:** `Migrate CheckoutCo to AcmePay API v2`

The pull request should:

1. pin `@acmepay/sdk` to the local v2 contract;
2. convert cents to a two-decimal money value and normalize currency;
3. add `payment_pending` and `refund_pending` order states;
4. fulfill only paid payments;
5. validate webhook ownership and IDs before changing an order;
6. treat `refund.completed` as the authoritative refund transition.

## Safety properties

- Invalid amounts and currency codes fail before an API call.
- Duplicate webhook IDs are idempotent.
- Webhooks for another order are ignored.
- A completed refund cannot regress to an earlier state.
- A failed refund request returns an order from `refund_pending` to `paid`.
- The v2 change is limited to the six files listed in the README.

## Verification

The pull request is ready when both GitHub checks pass:

- `Unbreak / typecheck`
- `Unbreak / tests`

The local SDK packages are deliberately tiny type contracts. They keep this
repository deterministic while making an incomplete migration fail at
compile time.
