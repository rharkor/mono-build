import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import * as vscode from "vscode";

export type PackageResolution = {
  packageRoot: string;
  packageName: string;
};

function readPackageName(dir: string): string | undefined {
  const p = join(dir, "package.json");
  if (!existsSync(p)) {
    return undefined;
  }
  try {
    const raw = readFileSync(p, "utf8");
    const parsed = JSON.parse(raw) as { name?: unknown };
    return typeof parsed.name === "string" && parsed.name.length > 0
      ? parsed.name
      : undefined;
  } catch {
    return undefined;
  }
}

function hasTurboJson(dir: string): boolean {
  return existsSync(join(dir, "turbo.json"));
}

/**
 * Walk upward from a file path to find the nearest package.json with a non-empty `name`.
 */
export function findPackageFromFilePath(
  fileFsPath: string
): PackageResolution | undefined {
  let dir = dirname(fileFsPath);
  // Walk until parent === dir (filesystem root)
  for (;;) {
    const name = readPackageName(dir);
    if (name !== undefined) {
      return { packageRoot: dir, packageName: name };
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}

/**
 * Walk upward from a file path to find a directory containing turbo.json.
 */
export function findTurboRootFromFilePath(
  fileFsPath: string
): string | undefined {
  let dir = dirname(fileFsPath);
  for (;;) {
    if (hasTurboJson(dir)) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}

export function resolveFromUri(uri: vscode.Uri): {
  pkg: PackageResolution;
  turboRoot: string;
} | undefined {
  if (uri.scheme !== "file") {
    return undefined;
  }
  const fsPath = uri.fsPath;
  const pkg = findPackageFromFilePath(fsPath);
  if (pkg === undefined) {
    return undefined;
  }
  const turboRoot = findTurboRootFromFilePath(fsPath);
  if (turboRoot === undefined) {
    return undefined;
  }
  return { pkg, turboRoot };
}

export function resolvePackageOnly(uri: vscode.Uri):
  | { pkg: PackageResolution; turboRoot?: string }
  | undefined {
  if (uri.scheme !== "file") {
    return undefined;
  }
  const fsPath = uri.fsPath;
  const pkg = findPackageFromFilePath(fsPath);
  if (pkg === undefined) {
    return undefined;
  }
  const turboRoot = findTurboRootFromFilePath(fsPath);
  return { pkg, turboRoot };
}
