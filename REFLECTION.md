# Reflection

## Which quality risks here would I escalate to engineering leadership, and why those specifically?

**The astronomy-db health signal issue (TC-09/TC-10), not the currency rounding risk, would be my
first escalation** — and I think that ordering itself is worth explaining, because the obvious
instinct is to escalate whatever touches money first.

The currency/checkout risks are real, but they're the kind of risk engineering teams already have
institutional muscle for: someone owns payment code, code review exists, and a rounding bug is
findable by the exact kind of contract/unit tests described in test-strategy.md. It's a known
problem shape with known mitigations.

The health-signal issue is different in kind: it's evidence that a **known, accepted, and correctly
functioning** healthcheck is silently degrading the team's ability to trust their own alerting.
That's not a bug in the traditional sense — nothing is broken — but it's the kind of thing that
doesn't get caught by normal code review, because no single PR "introduces" it; it's an emergent
property of how the healthcheck interacts with Postgres logging. I'd escalate this specifically
because:

1. It's invisible until someone goes looking, which means it's probably not unique to this one
   service — I'd want leadership to ask "where else in our stack does a healthcheck or expected
   condition log at a severity that would trigger a page if anyone were watching?"
2. The fix is nearly free (add `-U postgres` or equivalent to the healthcheck command) but the
   awareness gap is not — someone needs to decide this is worth a ticket, because it will never be
   the loudest fire in the room on its own.
3. It's the kind of finding that, if I only report bugs and never report *signal quality* issues,
   leadership loses visibility into whether the team can actually trust its own dashboards during a
   real incident — which is a bigger risk than any single functional bug.

## With 4 QA engineers, how do I structure ownership across 20 services?

Not 5 services per person. Risk-tier ownership, as laid out in test-strategy.md:

- **1 person owns the Tier-1 money path end-to-end** (checkout, cart, payment, currency, shipping) —
  because a checkout bug is never cleanly "one service's" bug, and someone needs the cross-service
  view rather than four people each owning a slice and nobody owning the seam between them.
- **1 person owns Tier-2 services** (product catalogue, quote/shipping internals, recommendation) —
  lower blast radius, but still directly affects what customers see and what they're charged.
- **1 person rotates as the "automation health" owner** (from automation-strategy.md) — triaging CI
  failures, keeping the flaky-test list honest, maintaining the shared suite. This role rotates
  weekly across all 4 people rather than being permanently assigned, so automation ownership doesn't
  calcify into "the one person who understands the test suite."
- **1 person owns Tier-3 services collectively with the rest of the team** (ad, telemetry-docs,
  image-provider, load-generator) — lightweight smoke-test ownership, revisited only when they
  start causing real incidents, freeing capacity for the person to also help wherever Tier-1/2 needs
  a second pair of hands during a release crunch.

The reasoning: with 20 services and 4 people, uniform per-service ownership guarantees that the
highest-risk flows get the same attention as the lowest-risk ones, which is exactly backwards from
where defects actually cost the business money.

## What do I build in week 1 vs. month 3?

**Week 1**: the thin E2E suite for the Tier-1 checkout/cart flows (roughly what's in this repo's
`automation/tests/`) and the CI gate wiring to run it on every relevant PR. This is deliberately
the smallest thing that gives real regression protection on the highest-risk flow, because shipping
zero automated safety net on the money path for weeks while building "the right" test pyramid is a
worse trade than starting narrow and expanding.

**Month 1**: contract tests between the services in the checkout fan-out (checkout↔payment,
checkout↔currency, checkout↔cart), because this is where the test-strategy doc argues the highest
uncaught-bug value actually is — schema drift between services is invisible to both unit tests and
E2E tests, and expensive to find any other way. Also: the observability suite (TC-09/TC-10 style
checks) becomes a standing practice, not a one-off finding from week 1 — any new service's
healthcheck gets the same "does healthy actually mean healthy" scrutiny.

**Month 3**: the agentic CI-triage workflow moves from a 3-example prototype (this repo) to running
for real against the team's actual CI failure volume, with the eval set grown well past 3 examples
using real historical failures, not fixtures. Also by month 3: risk-tier ownership boundaries get
revisited based on where defects actually escaped in the first two months — the ownership model in
this document is a week-1 hypothesis, not a permanent structure, and I'd expect to redraw the tiers
once there's real defect-leakage data to look at instead of my current guesses from a few hours with
the demo app.

The throughline across all three timeframes: start with the thing that gives real protection
immediately, then spend the next months building the infrastructure (contract tests, agentic
tooling, ownership structure) that makes the *next* system this size faster to get right, rather
than re-deriving all of it from scratch again.
