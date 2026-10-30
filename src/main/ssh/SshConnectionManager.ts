import { Client, ClientChannel, ConnectConfig } from 'ssh2';
import { EventEmitter } from 'events';
import { SshCredentials, SshConnectionState } from '../../common/types/ssh';
import { loadPrivateKey } from './SshPathResolver';

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class SshConnectionManager extends EventEmitter {
  private client: Client | null = null;
  private state: SshConnectionState = {
    status: 'disconnected',
  };

  constructor() {
    super();
  }

  public getState(): SshConnectionState {
    return { ...this.state };
  }

  private setState(newState: Partial<SshConnectionState>): void {
    this.state = { ...this.state, ...newState };
    this.emit('stateChanged', this.getState());
  }

  public async connect(credentials: SshCredentials): Promise<void> {
    if (this.client) {
      await this.disconnect();
    }

    this.setState({
      status: 'connecting',
      currentHost: credentials.host,
      currentPort: credentials.port,
      currentUsername: credentials.username,
      error: undefined,
    });

    return new Promise((resolve, reject) => {
      const client = new Client();
      this.client = client;

      const config: ConnectConfig = {
        host: credentials.host,
        port: credentials.port || 22,
        username: credentials.username,
        readyTimeout: 15000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
      };

      if (credentials.password) {
        config.password = credentials.password;
      }

      if (credentials.privateKey) {
        try {
          const loaded = loadPrivateKey(credentials.privateKey);
          config.privateKey = loaded.content;
        } catch (err) {
          this.setState({
            status: 'error',
            error: (err as Error).message,
          });
          return reject(err);
        }

        if (credentials.passphrase) {
          config.passphrase = credentials.passphrase;
        }
      }

      client.on('ready', () => {
        this.setState({
          status: 'connected',
          error: undefined,
        });
        resolve();
      });

      client.on('error', (err) => {
        this.setState({
          status: 'error',
          error: err.message,
        });
        reject(err);
      });

      client.on('end', () => {
        this.setState({
          status: 'disconnected',
        });
      });

      client.on('close', () => {
        this.setState({
          status: 'disconnected',
        });
      });

      try {
        client.connect(config);
      } catch (err) {
        this.setState({
          status: 'error',
          error: (err as Error).message,
        });
        reject(err);
      }
    });
  }

  public async executeCommand(command: string): Promise<CommandExecutionResult> {
    if (!this.client || this.state.status !== 'connected') {
      throw new Error('SSH client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.exec(command, (err, stream) => {
        if (err) {
          return reject(err);
        }

        let stdout = '';
        let stderr = '';
        let exitCode = 0;

        stream.on('data', (data: Buffer) => {
          stdout += data.toString('utf8');
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString('utf8');
        });

        stream.on('close', (code: number) => {
          exitCode = typeof code === 'number' ? code : 0;
          resolve({ stdout, stderr, exitCode });
        });

        stream.on('error', (streamErr: Error) => {
          reject(streamErr);
        });
      });
    });
  }

  public async openStream(command: string): Promise<ClientChannel> {
    if (!this.client || this.state.status !== 'connected') {
      throw new Error('SSH client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.exec(command, (err, stream) => {
        if (err) {
          return reject(err);
        }
        resolve(stream);
      });
    });
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        this.client.end();
      } catch {
        // Ignore end errors
      }
      this.client = null;
    }
    this.setState({
      status: 'disconnected',
      error: undefined,
    });
  }
}
