# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd prime` for full workflow context.

> Issues live in a local Dolt database (`.beads/dolt/`); cross-machine sync
> uses `bd dolt push/pull` against `refs/dolt/data` on your git remote.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work atomically
bd close <id>         # Complete work
bd dolt push          # Push beads data to remote
```

## Code Style

- Functions: 4-20 lines. Split if longer.
- Files: under 500 lines. Split by responsibility.
- One thing per function, one responsibility per module (SRP).
- Names: specific and unique. Avoid `data`, `handler`, `Manager`.
  Prefer names that return <5 grep hits in the codebase.
- Types: explicit. No `any`, no `Dict`, no untyped functions.
- No code duplication. Extract shared logic into a function/module.
- Early returns over nested ifs. Max 2 levels of indentation.
- Exception messages must include the offending value and expected shape.

## Comments

- Keep your own comments. Don't strip them on refactor — they carry
  intent and provenance.
- Write WHY, not WHAT. Skip `// increment counter` above `i++`.
- Docstrings on public functions: intent + one usage example.
- Reference issue numbers / commit SHAs when a line exists because
  of a specific bug or upstream constraint.

## Tests

- Tests run with a single command: `npm test`.
- Every new function gets a test. Bug fixes get a regression test.
- Mock external I/O with named fake classes, not inline stubs.
- Tests must be F.I.R.S.T: fast, independent, repeatable,
  self-validating, timely.

## Dependencies

- Inject dependencies through constructor/parameter, not global/import.
- Wrap third-party libs behind a thin interface owned by this project.

## Structure

- Follow React + Vite conventions.
- Prefer small focused modules over god files.
- Predictable paths: `src/components/`, `src/lib/`, `src/types/`.

## Git

- Atomic commits: one logical change per commit.
- Commit messages: imperative mood, short subject line (<72 chars),
  blank line, then body explaining WHY.
- Reference bead IDs in commit body when applicable.
- Never commit generated files (`dist/`, `node_modules/`, `.DS_Store`).
- Squash fixup commits before pushing.

## Formatting

- Use `prettier`. Don't discuss style beyond that.

## Logging

- Structured JSON when logging for debugging / observability.
- Plain text only for user-facing CLI output.

## Shell Commands

**ALWAYS use non-interactive flags** to avoid hanging on prompts. Commands
like `cp`, `mv`, `rm` may be aliased with `-i`.

```bash
cp -f source dest           # NOT: cp source dest
mv -f source dest           # NOT: mv source dest
rm -f file                  # NOT: rm file
rm -rf directory            # NOT: rm -r directory
```

Other commands: `scp -o BatchMode=yes`, `ssh -o BatchMode=yes`,
`apt-get -y`, `brew` with `HOMEBREW_NO_AUTO_UPDATE=1`.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:970c3bf2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to
see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate,
  or markdown TODO lists.
- Run `bd prime` for detailed command reference and session close protocol.
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses
`refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive
export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md
for details and anti-patterns.

## Agent Context Profiles

- **Conservative (default)**: Use `bd` for task tracking. Do not run git
  commits, pushes, or Dolt remote sync unless explicitly asked. At handoff,
  report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; same
  conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents
  may close beads, run quality gates, commit, and push as part of session
  close.

## Session Completion

1. **File issues for remaining work** — Create beads for anything that
   needs follow-up.
2. **Run quality gates** — Tests, linters, builds.
3. **Update issue status** — Close finished work, update in-progress items.
4. **Handle git/sync by active profile**:
   ```bash
   git status  # Conservative: report and wait for approval.
   # Team-maintainer opt-in only:
   git pull --rebase && bd dolt push && git push && git status
   ```
5. **Hand off** — Summarize changes, validation, issue status, and any
   blocked sync/commit/push step.

**Critical rules:**
- Explicit user instructions override this Beads block.
- Do not commit or push without clear authority.
- If sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
