---
test: ../checkout_flow_test.md
status: failed
started: 2026-08-19T22:33:05.453Z
duration_s: 178
session_id: 5a262895-c6af-4450-857c-833a6b35799f
---

# Checkout flow — invisible break detection — Result

## Open the store ✓ passed (63.2s)
md5: 62aab78e9753c89d7045f3ba7ea7eea3
Go to {{app_url}}.
Assert the page shows "QuantumStore" and at least one product is visible.
Assert no console errors on the page.

## Add a product to the cart ✓ passed (37.4s)
md5: f3474ed8d30aaef9602ab435b162d424
Click the "Add to Cart" button for the first product.
Assert the page navigates to the cart page.
Assert the cart shows at least one item.
Assert no console errors on the page.

## Open the checkout page ✗ failed (57.6s)
md5: 94ae1a3fa92e1a036186d3b1670ef8c6
Reason: Checkpoint assertion failed: "no console errors on the page" — bug verdict: Checkout page triggers shipping-rates 500s and feature-flag console errors [application_issue/api_error, confidence 0.98]
Go to {{app_url}}/checkout.
Assert the checkout form is visible with fields for name, email, and address.
Assert no console errors on the page.
Assert no API calls returned 5xx status codes.

## Fill in and submit the checkout form ⏭ skipped
