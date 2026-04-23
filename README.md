# Turborepo quick build

Run **`npm run build`** in the package that owns the current file, or run **Turbo** against that package’s **dependencies only**, from the Explorer or editor context menu—handy in a [Turborepo](https://turbo.build/) monorepo.

**Source:** [github.com/rharkor/mono-build (main)](https://github.com/rharkor/mono-build/tree/main)

## Features

- **Build package (npm run build)** — Resolves the nearest `package.json` with a `name` above the file, then runs `npm run build` in that folder.
- **Build this package’s dependencies (turbo build)** — From the monorepo root (where `turbo.json` is), runs:
  - `npx turbo run build --filter="<name>^..." --output-logs=new-only`  
  The `^` before `...` is [Turbo 2’s “omit the target; include dependencies” filter](https://turbo.build/repo/docs/reference/run#--filter) (not `^<name>...`).

After the command finishes, the integrated terminal prompts you to press **Enter** (or a key, on Windows) before the shell exits.

## Requirements

- A workspace file inside a package that has a `package.json` with a `name` field.
- For the Turbo action: a `turbo.json` in a parent directory (monorepo root).

## Development

1. Open this folder in [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.com/).
2. `npm install` and `npm run compile`.
3. **Run and Debug** → **Run Extension** (or F5) to start the Extension Development Host.

## License

[MIT](LICENSE)
