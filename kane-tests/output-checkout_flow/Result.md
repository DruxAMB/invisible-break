---
test: ../checkout_flow_test.md
status: passed
started: 2026-08-21T14:36:13.459Z
duration_s: 553
session_id: 904086a0-4677-40ea-9fa3-9653ed7b9aa1
---

# Checkout flow — invisible break detection — Result

## Open the store ✓ passed (92.9s)
md5: 3d1f02bc9c1532dd3f2087b81ea3835f
Go to {{app_url}}.
Assert the page shows "QuantumStore" and the hero product is visible.
Assert no console errors on the page.

## Add the hero product to the cart ✓ passed (63.5s)
md5: e07625541518b6dd64be37cc3a963f71
Click the "BUY" button on the hero product.
Assert the bag count in the header increases.
Assert no console errors on the page.

## Open the bag and start checkout ✓ passed (153.2s)
md5: a1a9bf25a89b8e25822ec029c6611adf
Click the "BAG" button in the header to open the slide-out cart panel.
Assert the cart panel shows at least one item.
Click the "CHECKOUT" button in the cart panel.
Assert the checkout form is visible with fields for name, email, and address.
Assert no console errors on the page.
Assert no API calls returned 5xx status codes.

## Fill in and submit the checkout form ✓ passed (109.2s)
md5: e31867718388cf6c3767fdbf5d8c5467
Type "Ada Lovelace" into the Full Name field.
Type "ada@analytical.engine" into the Email field.
Type "221B Baker Street, London" into the Shipping Address field.
Click the "COMPLETE ORDER" button.
Assert the page shows "ORDER CONFIRMED".
