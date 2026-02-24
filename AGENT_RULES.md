# AGENT_RULES.md

## Strict Rules for AI Agents

### Scope Control

1. **Never scan the whole repo.** Only read files directly relevant to the task.
2. **Modify only requested files.** Do not touch files the user didn't mention.
3. **Return only changed files.** Never output unchanged files.
4. **No global refactors.** Even if you spot issues elsewhere, leave them alone.
5. **No renaming** of files, variables, or functions unless explicitly asked.

### Change Quality

6. **Keep changes minimal.** Smallest diff that solves the problem.
7. **Prefer small files.** Never let a file exceed 250 lines — split if needed.
8. **No new dependencies** without explicit user approval.
9. **Follow existing patterns.** Match the style already in the file (naming, spacing, structure).
10. **Spanish for domain terms, English for technical terms** — match the codebase convention.

### Process

11. **Read before editing.** Never modify a file you haven't read first.
12. **Validate after editing.** Check for errors in every file you change.
13. **One concern per change.** Don't bundle unrelated fixes into one edit.
14. **Ask if ambiguous.** If the request is unclear, ask — don't guess and refactor.

### Boundaries

15. **UI code stays in components/pages.** No Firestore imports in JSX files.
16. **Firestore logic stays in services.** No React hooks in service files.
17. **Providers stay in `src/app/providers/`.** Don't create ad-hoc contexts elsewhere.
18. **Shared utils go in `src/lib/`.** Don't duplicate helpers across features.

### What NOT to Do

- ❌ Rewrite files "for consistency"
- ❌ Add TypeScript unless asked
- ❌ Change CSS variable names or theme colors
- ❌ Restructure folders without permission
- ❌ Remove comments or documentation
