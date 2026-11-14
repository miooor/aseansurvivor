# Issue tracker: GitHub

Specs and tickets live in GitHub Issues for `miooor/aseansurvivor`.
Use the authenticated `gh` CLI from this repository.

## Operations

- Verify the target with `gh repo view --json nameWithOwner`.
- Create issues with `gh issue create --title "..." --body-file <file>`.
- Read issues with `gh issue view <number> --json number,title,body,labels,comments`.
- List work with `gh issue list --state open --json number,title,labels`.
- Link tickets to their spec with `gh issue edit <parent> --add-sub-issue <child>`.
- Record blockers with `gh issue edit <child> --add-blocked-by <blocker>`.
- A ticket is ready only when every blocker is closed.
- If native relationships are unavailable, put `Part of #<parent>`
  and `Blocked by: #<number>` at the top of the ticket body.
- Apply labels with `gh issue edit <number> --add-label <label>`.
- Write multiline descriptions and comments through `--body-file`.
- Record completion evidence in an issue comment. Use PR closing
  references for implemented tickets; otherwise close resolved issues
  explicitly after posting the explanation.

## Publishing and implementation

“Publish to the issue tracker” means create a GitHub issue.
“Fetch the relevant ticket” means read its issue and comments.

Implement related tickets on one `codex/` integration branch.
Reference the spec and tickets in the implementation PR.
Never file project work in the upstream skills repository.

Preview remote mutations before executing them, as required by the
repository's working agreements.

## Pull requests as a triage surface

PRs as a request surface: no.

## Wayfinding

A wayfinding map is an issue labelled `wayfinder:map`.
Its children use `wayfinder:research`, `wayfinder:prototype`,
`wayfinder:grilling`, or `wayfinder:task`.
Choose unassigned children with no open blockers, in map order.
Claim with `gh issue edit <number> --add-assignee @me`.
On resolution, comment with evidence, close the child, and add a
result link to the map's decisions.
