import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DockerServiceManager } from '../../src/main/docker/DockerServiceManager';
import { SAMPLE_DOCKER_PS_OUTPUT } from '../mocks/docker-fixtures';

describe('DockerServiceManager (TDD)', () => {
  let mockSshManager: any;
  let serviceManager: DockerServiceManager;

  beforeEach(() => {
    mockSshManager = {
      executeCommand: vi.fn(),
      openStream: vi.fn(),
      getState: vi.fn().mockReturnValue({ status: 'connected' }),
    };
    serviceManager = new DockerServiceManager(mockSshManager);
  });

  it('should fetch docker overview using docker ps command', async () => {
    mockSshManager.executeCommand.mockResolvedValueOnce({
      stdout: SAMPLE_DOCKER_PS_OUTPUT,
      stderr: '',
      exitCode: 0,
    });

    const overview = await serviceManager.getOverview();
    expect(mockSshManager.executeCommand).toHaveBeenCalledWith(
      expect.stringContaining('docker ps -a --format')
    );
    expect(overview.totalContainers).toBe(5);
    expect(overview.composeStacks).toHaveLength(2);
  });

  it('should execute container action (start/stop/restart)', async () => {
    mockSshManager.executeCommand.mockResolvedValueOnce({
      stdout: 'container123\n',
      stderr: '',
      exitCode: 0,
    });

    const result = await serviceManager.executeAction('container123', 'restart');
    expect(result.success).toBe(true);
    expect(mockSshManager.executeCommand).toHaveBeenCalledWith('docker restart "container123"');
  });

  it('should handle error when container action fails', async () => {
    mockSshManager.executeCommand.mockResolvedValueOnce({
      stdout: '',
      stderr: 'Error response from daemon: No such container: bad-id',
      exitCode: 1,
    });

    const result = await serviceManager.executeAction('bad-id', 'stop');
    expect(result.success).toBe(false);
    expect(result.error).toContain('No such container');
  });

  it('should start log streaming for container', async () => {
    const mockChannel = { on: vi.fn(), stderr: { on: vi.fn() }, close: vi.fn() };
    mockSshManager.openStream.mockResolvedValueOnce(mockChannel);

    const { streamId } = await serviceManager.startLogStream('container123', 100);
    expect(streamId).toBeDefined();
    expect(mockSshManager.openStream).toHaveBeenCalledWith(
      'docker logs -f --tail 100 --timestamps "container123"'
    );
  });
});
