import { Server, ServerChannel } from 'ssh2';
import crypto from 'crypto';
import { SAMPLE_DOCKER_PS_OUTPUT, SAMPLE_DOCKER_COMPOSE_LS_OUTPUT, SAMPLE_ANSI_LOGS } from './docker-fixtures';

// Generate a quick ephemeral RSA host key for the mock server
const { privateKey: HOST_PRIVATE_KEY } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
});

export class MockSshServer {
  private server: Server;
  public port: number = 0;
  public expectedUser: string = 'testuser';
  public expectedPassword: string = 'testpass';
  public commandHistory: string[] = [];

  constructor() {
    this.server = new Server({
      hostKeys: [HOST_PRIVATE_KEY],
    }, (client) => {
      client.on('authentication', (ctx) => {
        if (
          ctx.method === 'password' &&
          ctx.username === this.expectedUser &&
          ctx.password === this.expectedPassword
        ) {
          ctx.accept();
        } else {
          ctx.reject(['password']);
        }
      });

      client.on('ready', () => {
        client.on('session', (accept) => {
          const session = accept();

          session.on('exec', (acceptExec, _reject, info) => {
            const stream: ServerChannel = acceptExec();
            const cmd = info.command.trim();
            this.commandHistory.push(cmd);

            if (cmd.includes('docker ps -a')) {
              stream.write(SAMPLE_DOCKER_PS_OUTPUT + '\n');
              stream.exit(0);
              stream.end();
            } else if (cmd.includes('docker compose ls')) {
              stream.write(SAMPLE_DOCKER_COMPOSE_LS_OUTPUT + '\n');
              stream.exit(0);
              stream.end();
            } else if (cmd.includes('docker logs -f')) {
              stream.write(SAMPLE_ANSI_LOGS + '\n');
              // Keep channel open for streaming test until closed
              const timer = setInterval(() => {
                if (!stream.destroyed) {
                  stream.write(`[HEARTBEAT] ${new Date().toISOString()} heartbeat log\n`);
                } else {
                  clearInterval(timer);
                }
              }, 200);

              stream.on('close', () => {
                clearInterval(timer);
              });
            } else if (cmd.startsWith('docker start') || cmd.startsWith('docker stop') || cmd.startsWith('docker restart')) {
              stream.write('container-action-ok\n');
              stream.exit(0);
              stream.end();
            } else {
              stream.write(`Command executed: ${cmd}\n`);
              stream.exit(0);
              stream.end();
            }
          });
        });
      });
    });
  }

  public async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server.listen(0, '127.0.0.1', () => {
        const address = this.server.address();
        if (typeof address === 'object' && address !== null) {
          this.port = address.port;
          resolve(this.port);
        } else {
          reject(new Error('Failed to obtain ephemeral port'));
        }
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }
}
