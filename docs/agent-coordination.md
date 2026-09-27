# Agent coordination

`AGENTS.md` is the common entry point. `CLAUDE.md` imports it for Claude Code.
Codex is the single coordination and integration owner; Claude and any later
agents work within this same flow. The owner may talk to either agent; bring
new scope or conflicting directions back to Codex before changing shared work.

## One queue, explicit assignments

Codex maintains assignments in [open work](open-work.md). Agents return findings
there through Codex, rather than starting competing backlogs or product plans.
Each implementation assignment records its ID, owner, acceptance criteria,
allowed files, branch/worktree, and base commit before editing starts.
A prepared brief is not evidence that an agent has started or completed it.

## Prevent overlapping edits

- Codex coordinates writes to the main checkout and shared planning documents.
  Read-only reviewers may inspect it, recording HEAD and dirty-file state;
  use an application diff or content hashes to identify an uncommitted build.
- Before another agent implements a task, Codex allocates a separate worktree
  and task branch from a recorded base containing the current instructions.
  No agent switches, stashes, resets, or cleans another agent's checkout.
- One active writer per file, even across worktrees. Codex sequences overlapping
  tasks or reallocates the file explicitly. Shared controllers, dependency
  manifests, schemas, and this coordination documentation follow the same rule.
- Work independently within the assigned scope, including local task commits.
  Report an overlapping edit or required scope expansion to Codex before
  touching the affected files; continue independent assigned checks meanwhile.
- A worktree isolates code, not Supabase data. Keep live mail, user creation,
  data deletion, and hosted configuration outside ordinary local QA.
- Use an isolated browser profile/session for QA. Separate tabs on the same
  origin share local storage and may affect the owner's drafts or session.

## Delivery and review

Return the task ID, base and final commit (or dirty state for a read-only audit),
changed files, checks actually run, reproducible findings, and remaining issues.
Use PASS / FAIL / NOT RUN and distinguish local checks from hosted evidence.
Record if the tested application changed during review; recheck affected paths.
Never put credentials, email codes, personal inbox details, or private assets
in reports or the public repository.

Codex reviews the exact submitted revision, reconciles conflicts, and performs
shared integration. Further changes require review of the new revision.
Claude also reviews significant Codex changes; that does not transfer final
integration authority. Release follows the owner's direction and
[operations](operations.md), including the remaining real-user release gates.

## Communication

The active Codex lead conversation is the decision center. If there is no
direct messaging channel, return a concise report for the owner to bring to
Codex. Never claim automatic delivery, background execution, or approval.
These documents define the working protocol; they do not configure GitHub
branch protection or a messaging integration.
