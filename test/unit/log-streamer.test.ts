import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from 'events';
import { LogStreamController } from '../../src/main/docker/LogStreamController';
import { SAMPLE_ANSI_LOGS } from '../mocks/docker-fixtures';

describe('LogStreamController (TDD)', () => {
  it('should create and track active stream by streamId', () => {
    const controller = new LogStreamController();
    const mockChannel = new EventEmitter() as any;
    mockChannel.close = vi.fn();

    const stream = controller.registerStream('stream-1', 'container-123', mockChannel);
    expect(stream.id).toBe('stream-1');
    expect(stream.containerId).toBe('container-123');
    expect(controller.getActiveStream('stream-1')).toBeDefined();
  });

  it('should buffer incoming data in ring buffer with max lines limit', () => {
    const controller = new LogStreamController({ maxBufferLines: 3 });
    const mockChannel = new EventEmitter() as any;
    mockChannel.close = vi.fn();

    const stream = controller.registerStream('stream-2', 'container-abc', mockChannel);

    mockChannel.emit('data', Buffer.from('line 1\nline 2\n'));
    mockChannel.emit('data', Buffer.from('line 3\nline 4\n'));

    const buffer = stream.getBufferedLines();
    // Since maxBufferLines is 3, line 1 should have rolled off
    expect(buffer).toEqual(['line 2', 'line 3', 'line 4']);
  });

  it('should emit onData events when chunks arrive', () => {
    const controller = new LogStreamController();
    const mockChannel = new EventEmitter() as any;
    mockChannel.close = vi.fn();

    const stream = controller.registerStream('stream-3', 'container-xyz', mockChannel);
    const dataHandler = vi.fn();
    stream.on('data', dataHandler);

    mockChannel.emit('data', Buffer.from(SAMPLE_ANSI_LOGS));

    expect(dataHandler).toHaveBeenCalledWith(expect.stringContaining('Server started on port 3000'));
  });

  it('should gracefully stop stream and close SSH channel', () => {
    const controller = new LogStreamController();
    const mockChannel = new EventEmitter() as any;
    mockChannel.close = vi.fn();

    controller.registerStream('stream-4', 'container-test', mockChannel);
    const success = controller.stopStream('stream-4');

    expect(success).toBe(true);
    expect(mockChannel.close).toHaveBeenCalled();
    expect(controller.getActiveStream('stream-4')).toBeUndefined();
  });
});
