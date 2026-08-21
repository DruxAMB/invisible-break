---
test: ../checkout_flow_test.md
status: passed
started: 2026-08-21T00:52:38.408Z
duration_s: 293
session_id: e25b629e-cec6-435e-ac7a-a877b173469b
---

# Checkout flow — invisible break detection — Result

## Open the store ✓ passed (39.7s)
md5: 3d1f02bc9c1532dd3f2087b81ea3835f
Go to {{app_url}}.
Assert the page shows "QuantumStore" and the hero product is visible.
Assert no console errors on the page.

## Add the hero product to the cart ✓ passed (53s)
md5: e07625541518b6dd64be37cc3a963f71
Click the "BUY" button on the hero product.
Assert the bag count in the header increases.
Assert no console errors on the page.

## Open the bag and start checkout ✓ passed (113.3s)
md5: a1a9bf25a89b8e25822ec029c6611adf
Click the "BAG" button in the header to open the slide-out cart panel.
Assert the cart panel shows at least one item.
Click the "CHECKOUT" button in the cart panel.
Assert the checkout form is visible with fields for name, email, and address.
Assert no console errors on the page.
Assert no API calls returned 5xx status codes.

## Fill in and submit the checkout form ✓ passed (57.2s)
md5: e31867718388cf6c3767fdbf5d8c5467
Type "Ada Lovelace" into the Full Name field.
Type "ada@analytical.engine" into the Email field.
Type "221B Baker Street, London" into the Shipping Address field.
Click the "COMPLETE ORDER" button.
Assert the page shows "ORDER CONFIRMED".
