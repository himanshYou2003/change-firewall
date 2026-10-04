# Change Firewall playground fixture

This directory contains immutable source layers used to create each disposable
playground repository. `scripts/playground/seed.mjs` builds a real Git history,
records real Change Firewall memory, and applies the selected working-tree
scenario.

Do not add a live `.git` directory or generated `.firewall` data here. Those are
created only inside the session workspace.

The default `contract-drift` scenario has a committed safe baseline and three
uncommitted changes:

- authentication now requires the `admin` role;
- the user route wraps its response in `{ user }`;
- `findUser` can return `null`.

Use `node scripts/playground/seed.mjs --help` for seeding options.
