# Test Case: Cart Management

## Meta
- **Flow:** Adding, updating, and removing items in the cart
- **Risk Level:** HIGH
- **Why this flow is high risk:** The cart relies on a stateful store (Redis). Issues with concurrent session updates, serialization, or connection drops can result in users losing their selected items, directly impacting conversion rates.

## Preconditions
1. The user has navigated to the frontend application.
2. The user has identified two distinct products in the catalog (e.g., "Telescope" and "Camera").

## Steps & Expected Results

| Step # | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Navigate to Product A ("Telescope") and click "Add to Cart". | Product A is in the cart with quantity 1. Subtotal is correct. |
| 2 | Navigate to Product A again and click "Add to Cart". | Product A quantity in the cart updates to 2. Subtotal updates accordingly. |
| 3 | Navigate to Product B ("Camera") and click "Add to Cart". | Cart contains both Product A (qty 2) and Product B (qty 1). Total price reflects all items. |
| 4 | In the cart view, change the currency from USD to EUR. | All item prices and the total price update immediately to reflect the EUR conversion rate. |
| 5 | Click the "Empty Cart" button. | The cart is completely cleared. A message indicates the cart is empty. The total is 0. |

## Edge Cases & Negative Scenarios
- **Concurrent Updates:** Opening the application in two separate tabs, adding different items in each tab simultaneously. The cart state should merge or handle the race condition without data corruption.
- **Redis Unavailability:** If the Cart Service cannot reach Redis (simulated via chaos testing), the UI should display a graceful degradation message (e.g., "Unable to update cart at this time") rather than a raw 500 stack trace.
- **Maximum Item Limits:** Attempting to add an unrealistic quantity of items (e.g., 9999) should be capped or validated by the backend to prevent overflow or abuse.

## Quality Risk Flags (Ship Blocker)
If any of the following occur during manual testing, the release should be blocked:
- Prices calculate incorrectly when multiple items or different currencies are involved.
- Cart items randomly disappear upon refreshing the page (indicating state persistence failure).
- Adding items to the cart causes massive latency spikes in the Frontend service.
