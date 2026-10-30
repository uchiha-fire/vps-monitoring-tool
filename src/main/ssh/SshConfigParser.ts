import { SshCredentials } from '../../common/types/ssh';

export class InvalidSshCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSshCommandError';
  }
}

/**
 * Tokenize a command line string taking quotes (single and double) into account,
 * while treating backslash line continuations as whitespace.
 */
function tokenizeCommandLine(cmd: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];

    // Handle line continuation: backslash followed by newline or carriage return
    if (char === '\\' && !inSingle && !inDouble) {
      if (i + 1 < cmd.length && (cmd[i + 1] === '\n' || cmd[i + 1] === '\r')) {
        // Skip backslash and newline (line continuation)
        if (cmd[i + 1] === '\r' && i + 2 < cmd.length && cmd[i + 2] === '\n') {
          i += 2;
        } else {
          i += 1;
        }
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
        continue;
      }
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (/\s/.test(char) && !inDouble && !inSingle) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  // Filter out any stray standalone backslash tokens
  return tokens.filter((t) => t !== '\\');
}

/**
 * OpenSSH options that require an argument following the flag
 */
const FLAGS_WITH_ARGS = new Set([
  '-b', '-c', '-D', '-E', '-e', '-F', '-I', '-i',
  '-J', '-L', '-l', '-m', '-O', '-o', '-p', '-Q',
  '-R', '-S', '-W', '-w'
]);

/**
 * Parses a raw SSH command string or destination into SshCredentials
 * Examples:
 *   "ssh root@192.168.1.100"
 *   "ssh -p 2222 ubuntu@ec2.amazon.com"
 *   "ssh -i ~/.ssh/key.pem -p 2200 admin@host"
 */
export function parseSshCommand(rawCommand: string): SshCredentials {
  if (!rawCommand || typeof rawCommand !== 'string' || rawCommand.trim().length === 0) {
    throw new InvalidSshCommandError('SSH command string cannot be empty');
  }

  const tokens = tokenizeCommandLine(rawCommand.trim());
  if (tokens.length === 0) {
    throw new InvalidSshCommandError('SSH command string cannot be empty');
  }

  let startIndex = 0;
  if (tokens[0].toLowerCase() === 'ssh') {
    startIndex = 1;
  }

  let port = 22;
  let privateKey: string | undefined = undefined;
  let explicitUser: string | undefined = undefined;
  let destination: string | undefined = undefined;

  for (let i = startIndex; i < tokens.length; i++) {
    const token = tokens[i];

    // Handle port: -p 2222 or attached -p2222
    if (token === '-p' && i + 1 < tokens.length) {
      const portRaw = tokens[++i];
      const parsedPort = parseInt(portRaw, 10);
      if (isNaN(parsedPort)) {
        throw new InvalidSshCommandError(`Invalid port number: "${portRaw}"`);
      }
      if (parsedPort < 1 || parsedPort > 65535) {
        throw new InvalidSshCommandError(`Port must be between 1 and 65535 (received ${parsedPort})`);
      }
      port = parsedPort;
    } else if (token.startsWith('-p') && token.length > 2) {
      const portRaw = token.slice(2);
      const parsedPort = parseInt(portRaw, 10);
      if (isNaN(parsedPort)) {
        throw new InvalidSshCommandError(`Invalid port number: "${portRaw}"`);
      }
      if (parsedPort < 1 || parsedPort > 65535) {
        throw new InvalidSshCommandError(`Port must be between 1 and 65535 (received ${parsedPort})`);
      }
      port = parsedPort;
    }
    // Handle identity file: -i key or attached -ikey
    else if (token === '-i' && i + 1 < tokens.length) {
      privateKey = tokens[++i];
    } else if (token.startsWith('-i') && token.length > 2) {
      privateKey = token.slice(2);
    }
    // Handle login user: -l user or attached -luser
    else if (token === '-l' && i + 1 < tokens.length) {
      explicitUser = tokens[++i];
    } else if (token.startsWith('-l') && token.length > 2) {
      explicitUser = token.slice(2);
    }
    // Handle other argument-taking flags (like -L, -R, -D, -o, -F, etc.)
    else if (FLAGS_WITH_ARGS.has(token) && i + 1 < tokens.length) {
      // Safely consume both the flag and its parameter
      i++;
    }
    // Handle boolean flags like -v, -vv, -C, -4, -6, -N, -T, etc.
    else if (token.startsWith('-')) {
      continue;
    }
    // First non-option token is the destination
    else if (!destination) {
      destination = token;
    }
  }

  if (!destination) {
    throw new InvalidSshCommandError('Missing user@host destination in SSH command');
  }

  // Handle ssh:// uri scheme if present
  let cleanDestination = destination;
  if (cleanDestination.startsWith('ssh://')) {
    cleanDestination = cleanDestination.slice(6);
  }

  let username = explicitUser;
  let host = cleanDestination;

  if (cleanDestination.includes('@')) {
    const parts = cleanDestination.split('@');
    username = parts[0];
    host = parts.slice(1).join('@');
  }

  if (!username || !host || username.trim().length === 0 || host.trim().length === 0) {
    throw new InvalidSshCommandError('Missing user@host destination in SSH command');
  }

  const credentials: SshCredentials = {
    host: host.trim(),
    username: username.trim(),
    port,
  };

  if (privateKey) {
    credentials.privateKey = privateKey.trim();
  }

  return credentials;
}

/**
 * Converts SshCredentials back into a readable SSH command line string
 */
export function toSshCommand(credentials: SshCredentials): string {
  const parts = ['ssh'];

  if (credentials.port && credentials.port !== 22) {
    parts.push(`-p ${credentials.port}`);
  }

  if (credentials.privateKey) {
    parts.push(`-i "${credentials.privateKey}"`);
  }

  parts.push(`${credentials.username}@${credentials.host}`);

  return parts.join(' ');
}
