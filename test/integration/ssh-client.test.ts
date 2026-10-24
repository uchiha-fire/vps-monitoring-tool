import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MockSshServer } from '../mocks/MockSshServer';
import { SshConnectionManager } from '../../src/main/ssh/SshConnectionManager';

describe('SshConnectionManager (TDD Integration)', () => {
  let mockServer: MockSshServer;
  let port: number;

  beforeAll(async () => {
    mockServer = new MockSshServer();
    port = await mockServer.start();
  });

  afterAll(async () => {
    await mockServer.stop();
  });

  it('should start in disconnected state', () => {
    const manager = new SshConnectionManager();
    expect(manager.getState().status).toBe('disconnected');
  });

  it('should successfully connect to mock SSH server with valid credentials', async () => {
    const manager = new SshConnectionManager();
    await manager.connect({
      host: '127.0.0.1',
      port,
      username: 'testuser',
      password: 'testpass',
    });

    const state = manager.getState();
    expect(state.status).toBe('connected');
    expect(state.currentHost).toBe('127.0.0.1');
    expect(state.currentPort).toBe(port);

    await manager.disconnect();
    expect(manager.getState().status).toBe('disconnected');
  });

  it('should reject connection with invalid credentials', async () => {
    const manager = new SshConnectionManager();
    await expect(
      manager.connect({
        host: '127.0.0.1',
        port,
        username: 'testuser',
        password: 'wrongpassword',
      })
    ).rejects.toThrow();

    expect(manager.getState().status).toBe('error');
  });

  it('should execute remote command and capture output', async () => {
    const manager = new SshConnectionManager();
    await manager.connect({
      host: '127.0.0.1',
      port,
      username: 'testuser',
      password: 'testpass',
    });

    const result = await manager.executeCommand('docker ps -a --format "{{json .}}"');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('web-proxy-nginx-1');
    expect(mockServer.commandHistory).toContain('docker ps -a --format "{{json .}}"');

    await manager.disconnect();
  });

  it('should execute docker compose ls and return output', async () => {
    const manager = new SshConnectionManager();
    await manager.connect({
      host: '127.0.0.1',
      port,
      username: 'testuser',
      password: 'testpass',
    });

    const result = await manager.executeCommand('docker compose ls --format json');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('web-proxy');

    await manager.disconnect();
  });
});
