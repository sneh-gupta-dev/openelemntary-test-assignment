# Automation Suite

This directory contains the automated end-to-end test suite for the OpenTelemetry Astronomy Shop.

## Setup Instructions

1. Ensure you have Node.js installed (v18+ recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers (if not installed automatically):
   ```bash
   npx playwright install --with-deps chromium
   ```

## Running the Tests

Ensure the Astronomy Shop application is running locally via Docker Compose on `http://localhost:8080`.

To run all tests in headless mode:
```bash
npx playwright test
```

To run tests with a visible browser (UI mode):
```bash
npx playwright test --ui
```

To view the HTML report of the last run:
```bash
npx playwright show-report
```

## Coverage
Currently automates the two highest-risk manual flows:
1. `checkout.spec.ts`: E2E checkout flow.
2. `cart.spec.ts`: Cart management and currency conversion.
