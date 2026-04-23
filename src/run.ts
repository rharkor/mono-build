import * as vscode from "vscode";

const DEFAULT_TERMINAL = "Turborepo: build";

/**
 * Build argument for npx: filter value is `^<name>...` (dependencies only, excluding the package).
 */
function turboFilterArg(packageName: string): string {
  if (packageName.includes('"') || packageName.includes("\n")) {
    throw new Error("Package name cannot contain double quotes or newlines");
  }
  return `^${packageName}...`;
}

/**
 * Quoted form safe for `sendText` in bash-like shells: --filter="^@scope/pkg..."
 */
function shQuoteForDoubleQuotes(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function runNpmBuildInDirectory(packageRoot: string): void {
  const t = vscode.window.createTerminal({
    name: DEFAULT_TERMINAL,
    cwd: packageRoot,
  });
  t.show();
  t.sendText("npm run build", true);
}

export function runTurboBuildDeps(
  monorepoRoot: string,
  packageName: string
): void {
  const filterValue = turboFilterArg(packageName);
  const t = vscode.window.createTerminal({
    name: DEFAULT_TERMINAL,
    cwd: monorepoRoot,
  });
  t.show();
  const quoted = shQuoteForDoubleQuotes(filterValue);
  t.sendText(
    `npx turbo run build --filter="${quoted}" --output-logs=new-only`,
    true
  );
}
