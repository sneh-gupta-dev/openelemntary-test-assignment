# Agent Design — CI Failure Triage

## Why this workflow, over test generation or self-healing

Test generation from an OpenAPI spec produces artifacts I'd still need to manually validate line by
line before trusting them — the eval problem there is genuinely hard and, done honestly, would eat
most of the time budget on eval design rather than on the agent doing real work. Self-healing tests
is compelling but needs a broken test to react to, which means fabricating a UI/API change first —
more setup than signal for this scope. CI triage was the best fit for this repo specifically: I
already have a working automation suite with a real, evidenced flaky-looking signal (the
astronomy-db healthcheck noise), so I could build ground-truth examples that are grounded in this
project's actual output rather than invented from scratch.

## The workflow

```
                    ┌─────────────────────────────┐
                    │   CI failure occurs          │
                    │   (test name + log + diff)   │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   Agent reads:               │
                    │   - failure log              │
                    │   - test file (via tool use) │
                    │   - recent diff (if any)     │
                    │   - test run history         │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   Agent classifies:          │
                    │   flaky / product_bug /      │
                    │   environment / test_gap     │
                    │   + cites specific evidence  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    ▼                               ▼
          confidence: high/medium           confidence: low
          classification: flaky_test,       (any classification)
          environment_issue, test_gap                │
                    │                                │
                    ▼                                ▼
         ┌─────────────────────┐         ┌─────────────────────────┐
         │ Agent posts          │         │ Escalate to human,      │
         │ classification +     │         │ agent does NOT decide   │
         │ suggested action to  │         │ or take any action      │
         │ CI dashboard/thread  │         └─────────────────────────┘
         └──────────┬───────────┘
                    │
                    ▼
         classification: product_bug
         (regardless of confidence)
                    │
                    ▼
         ┌─────────────────────────┐
         │ ALWAYS escalate to a     │
         │ human — agent never      │
         │ auto-resolves a real     │
         │ product bug              │
         └─────────────────────────┘
```

## What the agent decides vs. what stays with a human

**The agent decides:**
- The classification itself (flaky / product bug / environment issue / test gap), with cited
  evidence.
- Whether it has enough evidence to be confident, and says so honestly (`confidence: low` is a
  valid, expected output, not a failure of the agent).
- For `flaky_test` and `environment_issue` classifications with high confidence: it can suggest a
  specific, low-risk action (e.g., "re-run this test," "the container name in the test no longer
  matches docker-compose.yml — update the test's `ASTRONOMY_DB_CONTAINER` constant") without
  needing sign-off to *suggest* it.

**A human always decides:**
- Whether to actually merge any fix, including a one-line environment-issue fix the agent
  correctly identifies. The agent proposes; it doesn't push to main.
- Any `product_bug` classification, regardless of confidence, gets escalated — a real bug in
  currency conversion is a business decision (revert? hotfix? is this shippable?), not a
  triage-tool decision.
- Any `confidence: low` result, regardless of classification — an unsure agent should surface its
  uncertainty, not guess and move on.
- Whether a repeatedly-flaky test gets quarantined, rewritten, or deleted — the agent can flag the
  pattern ("this test has failed intermittently 4 times this month") but doesn't get to decide the
  test's fate.

This split exists because the cost of a wrong "it's just flaky, ignore it" call is a shipped bug,
and the cost of a wrong "escalate to human" call is a few minutes of someone's attention. Those
costs are not symmetric, so the agent is deliberately biased toward escalating.

## How I know the output is correct — eval design

See `eval/rubric.md` for the full rubric. Summary of the approach:

1. **Three hand-labeled example inputs** (`inputs/failure-01/02/03.json`), each representing one of
   three classifications, with ground truth I established *before* running the agent — not by
   looking at what the agent said and rationalizing it after the fact.
2. **Grounding requirement in the prompt**: the agent must quote specific evidence (a log line, a
   diff hunk, a history fact) supporting its classification. Ungrounded reasoning is scored as a
   failure independent of whether the label was right, because a right-answer-wrong-reason result
   isn't trustworthy when the inputs vary even slightly.
3. **Structured JSON output only** — free text is a fail, because this is meant to feed a dashboard
   or CI comment, not require a human to re-interpret prose each time.
4. **An honest bar, not a perfect one**: I score against 2-of-3 correct classifications, not 3-of-3,
   and I say so explicitly in the rubric. Three examples is a smoke test proving the mechanism
   works end-to-end, not a claim that this generalizes to the long tail of real CI failures. Scaling
   this eval set is exactly the kind of "week 1 vs month 3" tradeoff discussed in REFLECTION.md.

## What stops it from generating nonsense

- The grounding requirement above is the main defense — an agent that can't point to a specific
  line in the log or diff doesn't get credit for a lucky-guess correct label.
- The escalation bias means the failure mode of "agent is wrong" is capped at "a human spent two
  minutes reviewing something that turned out to be flaky," not "a real bug shipped because the
  agent said it was fine."
- The eval explicitly does NOT trust the agent's own self-reported confidence as ground truth — the
  rubric's correctness check is independent of what the agent claims about itself.

## Running this

The three input fixtures in `inputs/` are designed to be handed to a CLI coding agent (Claude Code,
in my case) with a prompt asking it to read the failure JSON, inspect the referenced test file and
this repo's context, and produce the structured classification per the rubric. The full transcript
of that session — including anywhere the agent got a classification wrong on first pass and had to
be corrected — is included as `agentic/TRANSCRIPT.jsonl` in this repo, exported directly from the
CLI tool, unedited.
