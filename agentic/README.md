# Running the CI Triage Agent Session

This directory contains the **design** (`AGENT-DESIGN.md`), the **eval rubric** (`eval/rubric.md`),
and three **input fixtures** (`inputs/failure-0{1,2,3}.json`). The actual agent run — and its
transcript — has to happen against your local clone with a CLI coding agent (Claude Code, Codex
CLI, etc.), since a web-chat transcript doesn't count for this section.

## Steps to run this yourself

1. Open a terminal in the root of this repo (with Claude Code, or your chosen CLI agent).
2. Give it a prompt along these lines (adapt to your agent's interface):

   > Read `agentic/AGENT-DESIGN.md` and `agentic/eval/rubric.md`. Then, for each of the three files
   > in `agentic/inputs/`, classify the CI failure per the rubric's required output shape. Cite
   > specific evidence from each input in your reasoning. After producing all three, compare your
   > classifications against the ground truth table in `eval/rubric.md` and report your score.

3. Let it work — it should read the fixture files, read the test files they reference
   (`automation/playwright/tests/*.spec.ts`, `automation/observability/test_health_signal_integrity.py`)
   for context, and produce the three structured classifications.
4. If it gets one wrong or produces ungrounded reasoning, push back and ask it to re-examine the
   specific evidence it's missing — **this back-and-forth is exactly what the assignment wants
   captured**, not a clean one-shot success.
5. Export the full session transcript (check your CLI agent's docs for the export command — Claude
   Code supports this via its session logs) and save it as `agentic/TRANSCRIPT.jsonl` in this repo,
   unedited.

## What "done" looks like

- `agentic/TRANSCRIPT.jsonl` exists and shows real tool calls (file reads, not just chat text).
- The transcript includes at least one instance of you or the agent catching and correcting a
  mistake — a first-try clean sweep is less informative than a realistic session.
- The three classifications the agent produced are captured in the transcript itself; no need to
  duplicate them elsewhere.
