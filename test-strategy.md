# Test Strategy — OpenTelemetry Astronomy Shop

## 1. Where the risk actually is

Twenty services is a lot of surface area, but risk isn't evenly distributed. I'm prioritizing based on
three things: **blast radius** (how many other services/users does a failure touch), **money/state
correctness** (silent wrongness is worse than a crash), and **fan-out complexity** (how many hops a
single user action triggers).

**Tier 1 — highest risk**
- **Checkout flow (checkout service + its dependents)**: this is the single point where cart, shipping,
  currency, payment, and email all get orchestrated in one request. It's the widest fan-out in the
  system, it's synchronous from the user's point of view, and it's the one flow where "it mostly works"
  isn't good enough — partial failure (e.g., payment succeeds but order confirmation doesn't fire) is a
  silent, expensive bug class.
- **Cart service**: backed by Valkey/Redis, holds session state across multiple requests. Concurrency
  bugs here (double-add, stale reads after currency switch, cart surviving across sessions it shouldn't)
  are easy to miss in manual testing and easy to ship.
- **Currency conversion + pricing display**: observed directly — checkout showed shipping and item
  price independently converted and summed. Rounding, truncation, and "does the displayed total equal
  the sum of displayed line items" are classic sources of trust-eroding bugs that QA usually catches
  before finance does.

**Tier 2 — moderate risk**
- **Product catalogue**: feeds pricing and availability into everything downstream. Data integrity
  issues here propagate silently.
- **Shipping / quote services**: isolated logic, lower fan-out, but directly affects the total charged.
- **Recommendation service**: user-facing but not transactional — a bad recommendation is annoying, not
  costly.

**Tier 3 — lower priority for deep QA investment**
- **Ad service, telemetry-docs, load-generator, image-provider**: supporting or cosmetic. Worth smoke
  testing for availability, not worth deep functional investment.

**Observed evidence, not just architectural guessing**

Two things surfaced from actually running the stack that reinforce the priorities above:

- **Jaeger UI returned "no healthy upstream."** Tracing was unavailable while the system was otherwise
  functioning. If this were production, an incident during this window would be debugged blind — this
  is a quality risk in its own right (observability tooling needs its own health checks and its own
  place in the test surface, not an assumption that "it's just infra").
- **`astronomy-db` logs `FATAL: role "root" does not exist` on a precise 5-second cadence** — confirmed
  via `docker inspect --format '{{json .Config.Healthcheck}}'` to match the container's healthcheck
  interval (`pg_isready`, interval 5s) exactly. `docker inspect --format '{{json .State.Health}}'` shows
  the service reporting `"Status":"healthy"`, `FailingStreak: 0`, the entire time. Root cause: the
  healthcheck runs `pg_isready` as the container's default OS user (`root`), with no `-U` flag, so
  Postgres logs an auth-role failure on every check — but `pg_isready` only verifies the server accepts
  connections, not that auth succeeds, so the check still passes cleanly. **Functionally harmless, but it
  manufactures a FATAL-level log line every 5 seconds, indefinitely, by design.** This is a more
  interesting finding than a real outage: it's a log/alerting hygiene bug. Any FATAL-based log alerting
  on this service would either page continuously (alert fatigue, gets muted) or get filtered out
  entirely — and a genuine FATAL from this same service would then be indistinguishable from routine
  noise. This is exactly the class of thing I'd escalate to engineering leadership: not because the app
  breaks, but because it quietly erodes the reliability of the signal used to detect when it does.

## 2. Test pyramid — and what I'm leaving out on purpose

- **Unit (base, heaviest investment)**: owned by engineering, not QA, but QA defines the coverage bar
  for money-path logic (currency conversion, cart totals, discount/tax if present) in code review.
- **Integration / contract tests (second layer, QA-owned)**: this is where I'd put the most *new* QA
  effort. Each service publishes an OpenAPI spec — contract tests verify request/response shape between
  adjacent services (checkout↔payment, checkout↔currency, checkout↔cart) so a schema change breaks CI
  before it breaks production. This catches the class of bug that's invisible in a single-service unit
  test and too expensive to catch only at E2E.
- **E2E (thin layer, top of pyramid)**: 2–3 critical user journeys only — browse→cart→checkout success,
  checkout with a payment/shipping failure, currency switch mid-session. Deliberately not testing every
  product or every currency pair through the UI; that's what contract + unit tests are for.
- **Performance (targeted, not continuous)**: load test checkout and cart under concurrent sessions,
  since these are the stateful, orchestration-heavy paths most likely to degrade under load. I would
  *not* build a continuous perf regression suite across all 20 services for this scope — too expensive
  for the risk it retires.

**Deliberately left unautomated**: exhaustive currency-pair combinations, full visual regression across
every page, and exploratory testing of the recommendation engine's output quality. These are either
low-blast-radius, better caught by spot-checks, or genuinely require human judgment (recommendation
relevance isn't a pass/fail assertion).

## 3. QA ownership in a pod model across 20 services

I would not assign one QA engineer per N services — that scales linearly with headcount and doesn't
account for risk concentration. Instead:

- **Risk-tier ownership, not service-count ownership.** One QA engineer (or pair) owns the Tier 1 money
  path end-to-end, across the services it touches — because a checkout bug isn't "the payment team's
  bug," it's the whole flow's bug, and someone needs the cross-service view.
- **Embedded QA per pod, with a rotating cross-pod contract-test owner.** If pods are organized around
  service clusters (e.g., "commerce" = cart/checkout/payment, "catalogue" = product/currency/pricing,
  "fulfillment" = shipping/email), each pod's QA owns that pod's contract and E2E tests. One person
  rotates ownership of the shared contract-test suite that spans pod boundaries, so cross-pod breakage
  doesn't fall through the cracks between two "not my service" owners.
- **Tier 3 services get shared, lightweight ownership** — smoke tests only, owned collectively, revisited
  only when they start causing incidents.

## 4. Where quality gates live in CI/CD

- **PR gate**: unit tests + linting + contract tests for the changed service (fast, blocking).
- **Merge-to-main gate**: full contract test suite across all adjacent service pairs + the thin E2E suite
  against a docker-compose environment spun up in CI (blocking, but budgeted to stay under ~10 minutes).
- **Pre-deploy gate**: smoke test against staging (health checks + one E2E happy path), non-blocking perf
  check that alerts but doesn't block unless it breaches a hard threshold.
- **Post-deploy**: synthetic checkout transaction on a schedule in production, alerting QA/on-call on
  failure — this is the safety net for the things E2E in CI can't catch (real infra, real latency).

I deliberately don't block merges on performance tests or full E2E — both are too slow and too flaky to
gate every PR. They gate releases, not commits.

## 5. Metrics I'd actually track

- **Defect leakage rate**: bugs found in production / total bugs found. This is the single number I'd
  put in front of leadership — it tells you whether the gates above are actually working.
- **Escaped defect severity mix**: not just count, but how many escaped defects were Tier 1 (money path)
  vs Tier 3. A rising Tier-1 escape rate is the signal that matters, not aggregate bug count.
- **Automation coverage by risk tier**, not raw percentage — 100% coverage on Tier 3 services is not
  worth the same as 60% on Tier 1's contract tests.
- **Regression stability (flaky test rate)**: percentage of CI failures that turn out to be flaky vs
  real. If this creeps up, teams start ignoring red builds, which defeats every gate above it.
- **Mean time to triage a CI failure**: proxy for whether the CI triage burden is sustainable for a
  4-person team — ties directly into the agentic CI-triage idea explored later in this repo.
