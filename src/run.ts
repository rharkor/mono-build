import * as vscode from "vscode";

const DEFAULT_TERMINAL = "Turborepo: build";

/** Not PowerShell/cmd (e.g. macOS, Linux, Git Bash, WSL). */
function usePosixStyleClosePrompt(): boolean {
	if (process.platform !== "win32") {
		return true;
	}
	const s = (vscode.env.shell ?? "").toLowerCase();
	return (
		s.includes("bash") ||
		s.includes("zsh") ||
		s.includes("wsl") ||
		s.includes("git") ||
		s.includes("msys") ||
		s.includes("cygwin")
	);
}

function isPowerShellShell(): boolean {
	const s = (vscode.env.shell ?? "").toLowerCase();
	return s.includes("powershell") || s.includes("pwsh");
}

/**
 * Run a line in the default terminal profile, then wait for a key/Enter
 * and exit the shell so the session can be closed.
 */
function withPressToClose(command: string): string {
	if (usePosixStyleClosePrompt()) {
		// bash/zsh/sh: `read -p` is not portable for zsh; use echo + read -r, then exit the shell.
		return (
			`${command}; ` +
			"echo; echo 'Press Enter to close this terminal...'; " +
			"read -r; exit"
		);
	}
	// Default VS Code shell on Windows is often PowerShell; `pause` is a cmd built-in.
	if (isPowerShellShell() || (vscode.env.shell ?? "") === "") {
		return (
			`${command}; ` +
			"Read-Host 'Press Enter to close this terminal'; exit"
		);
	}
	return `${command} & echo. & pause & exit`;
}

/**
 * Turbo 2+ filter: `<name>^...` omits the package and runs only its dependencies
 * (see microsyntax at https://turbo.build/repo/docs/reference/run#--filter).
 * Do not use `^<name>...` — that is parsed as a literal package name starting with `^`.
 */
function turboFilterArg(packageName: string): string {
	if (packageName.includes('"') || packageName.includes("\n")) {
		throw new Error("Package name cannot contain double quotes or newlines");
	}
	return `${packageName}^...`;
}

/**
 * Quoted form safe for `sendText` in bash-like shells: --filter="@scope/pkg^..."
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
	t.sendText(withPressToClose("npm run build"), true);
}

export function runTurboBuildDeps(
	monorepoRoot: string,
	packageName: string,
): void {
	const filterValue = turboFilterArg(packageName);
	const t = vscode.window.createTerminal({
		name: DEFAULT_TERMINAL,
		cwd: monorepoRoot,
	});
	t.show();
	const quoted = shQuoteForDoubleQuotes(filterValue);
	t.sendText(
		withPressToClose(
			`npx turbo run build --filter="${quoted}" --output-logs=new-only`,
		),
		true,
	);
}
