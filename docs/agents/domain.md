# Domain Docs

## Layout

This repository uses a single context:
- `GLOSSARY.md` at the repository root defines domain vocabulary.
- `docs/adr/` contains numbered architecture decision records.

## Reading rules

Before exploring, read the glossary and ADRs relevant to the task.
If they do not exist, proceed silently. Domain-modeling work creates
them when terminology or decisions need to be recorded; do not
create empty placeholders.

Use glossary terms consistently in specs, tickets, code and tests.
Reconsider invented synonyms; note genuine vocabulary gaps for
domain modeling.

Explicitly identify any proposal that conflicts with an existing
ADR and explain why the decision should be reconsidered.
