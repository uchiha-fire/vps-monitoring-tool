import { SshCredentials } from '../../common/types/ssh';

export class InvalidSshCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSshCommandError';
  }
}

/**
 * Tokenize a command line string taking quotes (single and double) into account.
 */
function tokenizeCommandLine(cmd: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];

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

  return tokens;
}

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
    } else if (token === '-i' && i + 1 < tokens.length) {
      privateKey = tokens[++i];
    } else if (token === '-l' && i + 1 < tokens.length) {
      explicitUser = tokens[++i];
    } else if (token === '-o' && i + 1 < tokens.length) {
      // Skip option parameter like StrictHostKeyChecking=no
      i++;
    } else if (token.startsWith('-')) {
      // Skip other flags like -v, -C, -4, -6, etc.
      continue;
    } else {
      // Must be the host or user@host destination
      destination = token;
    }
  }

  if (!destination) {
    throw new InvalidSshCommandError('Missing user@host destination in SSH command');
  }

  let username = explicitUser;
  let host = destination;

  if (destination.includes('@')) {
    const parts = destination.split('@');
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
    credentials.privateKey = privateKey;
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
