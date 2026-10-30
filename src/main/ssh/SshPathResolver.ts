import os from 'os';
import path from 'path';
import fs from 'fs';

export class PrivateKeyNotFoundError extends Error {
  public readonly originalPath: string;
  public readonly resolvedPath: string;

  constructor(message: string, originalPath: string, resolvedPath: string) {
    super(message);
    this.name = 'PrivateKeyNotFoundError';
    this.originalPath = originalPath;
    this.resolvedPath = resolvedPath;
  }
}

/**
 * Checks whether the given string is raw private key PEM/OpenSSH content
 * rather than a file path on disk.
 */
export function isRawKeyContent(keyStr: string): boolean {
  if (!keyStr || typeof keyStr !== 'string') return false;
  const trimmed = keyStr.trim();
  return (
    trimmed.startsWith('-----BEGIN') ||
    trimmed.includes('PRIVATE KEY-----') ||
    trimmed.includes('-----BEGIN OPENSSH') ||
    trimmed.includes('-----BEGIN RSA')
  );
}

/**
 * Resolves a private key path string, expanding tilde (~) to the user's home directory
 * and resolving environment variables ($HOME, %USERPROFILE%).
 */
export function resolveSshPath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return '';

  let cleaned = rawPath.trim();

  // Strip surrounding quotes if present (e.g. "~/.ssh/id_rsa" or '/path/key')
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const homeDir = os.homedir();

  // Expand leading tilde
  if (cleaned === '~') {
    return homeDir;
  }
  if (cleaned.startsWith('~/') || cleaned.startsWith('~\\')) {
    cleaned = path.join(homeDir, cleaned.slice(2));
  } else if (cleaned.startsWith('~')) {
    cleaned = path.join(homeDir, cleaned.slice(1));
  }

  // Expand $HOME
  if (cleaned.startsWith('$HOME/') || cleaned.startsWith('$HOME\\')) {
    cleaned = path.join(homeDir, cleaned.slice(6));
  } else if (cleaned === '$HOME') {
    cleaned = homeDir;
  }

  // Expand Windows %USERPROFILE%
  if (cleaned.startsWith('%USERPROFILE%\\') || cleaned.startsWith('%USERPROFILE%/')) {
    cleaned = path.join(process.env.USERPROFILE || homeDir, cleaned.slice(14));
  } else if (cleaned === '%USERPROFILE%') {
    cleaned = process.env.USERPROFILE || homeDir;
  }

  return path.resolve(cleaned);
}

/**
 * Loads a private key, either returning the raw PEM string if provided directly,
 * or reading the key file from disk after expanding paths.
 *
 * @throws PrivateKeyNotFoundError if the file does not exist on disk
 */
export function loadPrivateKey(keyPathOrContent: string): {
  content: Buffer | string;
  resolvedPath?: string;
} {
  if (isRawKeyContent(keyPathOrContent)) {
    return { content: keyPathOrContent };
  }

  const resolved = resolveSshPath(keyPathOrContent);

  if (!fs.existsSync(resolved)) {
    throw new PrivateKeyNotFoundError(
      `Private key file not found: "${keyPathOrContent}" (resolved to: "${resolved}")`,
      keyPathOrContent,
      resolved
    );
  }

  return {
    content: fs.readFileSync(resolved),
    resolvedPath: resolved,
  };
}

/**
 * Quick status check helper for the UI to preview whether a key exists
 */
export function checkPrivateKeyStatus(keyPathOrContent: string): {
  isRaw: boolean;
  exists: boolean;
  resolvedPath?: string;
} {
  if (!keyPathOrContent || !keyPathOrContent.trim()) {
    return { isRaw: false, exists: false };
  }

  if (isRawKeyContent(keyPathOrContent)) {
    return { isRaw: true, exists: true };
  }

  const resolved = resolveSshPath(keyPathOrContent);
  const exists = fs.existsSync(resolved);

  return {
    isRaw: false,
    exists,
    resolvedPath: resolved,
  };
}
