import * as vscode from "vscode";
import { resolveFromUri, resolvePackageOnly } from "./resolve";
import { runNpmBuildInDirectory, runTurboBuildDeps } from "./run";

function getTargetUri(
	resource: vscode.Uri | undefined,
): vscode.Uri | undefined {
	if (resource !== undefined && resource.scheme === "file") {
		return resource;
	}
	return vscode.window.activeTextEditor?.document.uri;
}

function register(
	context: vscode.ExtensionContext,
	command: string,
	run: (uri: vscode.Uri) => void | Promise<void>,
): void {
	context.subscriptions.push(
		vscode.commands.registerCommand(command, async (resource?: vscode.Uri) => {
			const uri = getTargetUri(resource);
			if (uri === undefined) {
				void vscode.window.showErrorMessage(
					"No file selected. Open a file in the editor or use the Explorer context menu.",
				);
				return;
			}
			if (uri.scheme !== "file") {
				void vscode.window.showErrorMessage(
					"Only file:// resources are supported.",
				);
				return;
			}
			try {
				await run(uri);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				void vscode.window.showErrorMessage(`Turborepo build: ${msg}`);
			}
		}),
	);
}

export function activate(context: vscode.ExtensionContext): void {
	register(context, "turboBuildContext.buildPackage", async (uri) => {
		const resolved = resolvePackageOnly(uri);
		if (resolved === undefined) {
			void vscode.window.showErrorMessage(
				"No package.json with a name was found for this file.",
			);
			return;
		}
		const { packageRoot } = resolved.pkg;
		runNpmBuildInDirectory(packageRoot);
	});

	register(context, "turboBuildContext.buildPackageDeps", async (uri) => {
		const resolved = resolveFromUri(uri);
		if (resolved === undefined) {
			const only = resolvePackageOnly(uri);
			if (only === undefined) {
				void vscode.window.showErrorMessage(
					"No package.json with a name was found for this file.",
				);
				return;
			}
			void vscode.window.showErrorMessage(
				"No turbo.json found above this file. The dependency build only runs in a turborepo root.",
			);
			return;
		}
		const {
			pkg: { packageName },
			turboRoot,
		} = resolved;
		runTurboBuildDeps(turboRoot, packageName);
	});
}

export function deactivate(): void {
	// nothing
}
