---
mode: testing
max_steps: 30
timeout: 120
headless: true
variables:
  app_url:
    value: "http://localhost:3000"
    secret: false
---

# Checkout flow — invisible break detection

This flow exercises the full QuantumStore checkout path and asserts
on two things screenshots miss: console errors and 5xx network responses.
It is designed to FAIL when the two seeded invisible breaks are present
and PASS once the agent fixes them.

## Open the store
Go to {{app_url}}.
Assert the page shows "QuantumStore" and at least one product is visible.
Assert no console errors on the page.

## Add a product to the cart
Click the "Add to Cart" button for the first product.
Assert the page navigates to the cart page.
Assert the cart shows at least one item.
Assert no console errors on the page.

## Open the checkout page
Go to {{app_url}}/checkout.
Assert the checkout form is visible with fields for name, email, and address.
Assert no console errors on the page.
Assert no API calls returned 5xx status codes.

## Fill in and submit the checkout form
Go to {{app_url}}/checkout.
Type "Ada Lovelace" into the Full Name field.
Type "ada@analytical.engine" into the Email field.
Type "221B Baker Street, London" into the Shipping Address field.
Click the "Complete Order" button.
Assert the page shows "Order Confirmed".
