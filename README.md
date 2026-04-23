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

## Publish to Open VSX (Cursor / VSCodium)

Cursor (and other editors) can install extensions from **[Open VSX](https://open-vsx.org/)**, not only the Microsoft Marketplace. To list this extension under your account and make it installable from Cursor:

1. **Account** — Sign in at [open-vsx.org](https://open-vsx.org) with a **GitHub / Google / Eclipse** account and accept the **Eclipse Publisher Agreement** when prompted.
2. **Token** — Open [Personal access tokens](https://open-vsx.org/user-settings/tokens), create a token, and copy it (use it only on your machine).
3. **Namespace** — The `publisher` in [`package.json`](package.json) (`rharkor`) is your **namespace**. If this is your first publish under that name, create it:
   ```bash
   export OVSX_PAT="your-token-here"
   npx ovsx create-namespace rharkor
   ```
   Optional: [claim the namespace](https://github.com/eclipse/openvsx/wiki/Namespace-Access) so only you can publish updates.
4. **Publish** — From the repo root (after `npm install` and `npm run compile`):
   ```bash
   export OVSX_PAT="your-token-here"
   npm run publish:openvsx
   ```
   This uses [`ovsx`](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions) (same as `npx ovsx publish`) and packages with `vsce` under the hood.

**Where to see it:** [Your Open VSX extensions](https://open-vsx.org/user-settings/extensions) lists published versions; the public page is `https://open-vsx.org/extension/<publisher>/<name>` (e.g. `rharkor/mono-build`).

**Updates:** Bump `"version"` in `package.json`, then run `npm run publish:openvsx` again with `OVSX_PAT` set.

## License

[MIT](LICENSE)
