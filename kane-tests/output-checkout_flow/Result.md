---
test: ../checkout_flow_test.md
status: passed
started: 2026-08-19T22:58:32.697Z
duration_s: 162
session_id: cb4378f2-d49a-4ded-8e9f-56ec245e9170
---

# Checkout flow — invisible break detection — Result

## Open the store ✓ passed (3.2s)
md5: 62aab78e9753c89d7045f3ba7ea7eea3
Go to {{app_url}}.
Assert the page shows "QuantumStore" and at least one product is visible.
Assert no console errors on the page.

## Add a product to the cart ✓ passed (2.03s)
md5: f3474ed8d30aaef9602ab435b162d424
Click the "Add to Cart" button for the first product.
Assert the page navigates to the cart page.
Assert the cart shows at least one item.
Assert no console errors on the page.

## Open the checkout page ✓ passed (87.7s)
md5: 94ae1a3fa92e1a036186d3b1670ef8c6
Go to {{app_url}}/checkout.
Assert the checkout form is visible with fields for name, email, and address.
Assert no console errors on the page.
Assert no API calls returned 5xx status codes.

## Fill in and submit the checkout form ✓ passed (46.2s)
md5: ab96498087ed0c49b64b321755420cd5
Go to {{app_url}}/checkout.
Type "Ada Lovelace" into the Full Name field.
Type "ada@analytical.engine" into the Email field.
Type "221B Baker Street, London" into the Shipping Address field.
Click the "Complete Order" button.
Assert the page shows "Order Confirmed".
