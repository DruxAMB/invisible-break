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
Assert the page shows "QuantumStore" and the hero product is visible.
Assert no console errors on the page.

## Add the hero product to the cart
Click the "BUY" button on the hero product.
Assert the bag count in the header increases.
Assert no console errors on the page.

## Open the bag and start checkout
Click the "BAG" button in the header to open the slide-out cart panel.
Assert the cart panel shows at least one item.
Click the "CHECKOUT" button in the cart panel.
Assert the checkout form is visible with fields for name, email, and address.
Assert no console errors on the page.
Assert no API calls returned 5xx status codes.

## Fill in and submit the checkout form
Type "Ada Lovelace" into the Full Name field.
Type "ada@analytical.engine" into the Email field.
Type "221B Baker Street, London" into the Shipping Address field.
Click the "COMPLETE ORDER" button.
Assert the page shows "ORDER CONFIRMED".
