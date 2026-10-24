import { EventEmitter } from 'events';
import { ClientChannel } from 'ssh2';

export interface ManagedLogStream extends EventEmitter {
  id: string;
  containerId: string;
  channel: ClientChannel;
  getBufferedLines: () => string[];
}

export class LogStreamController {
  private activeStreams: Map<string, ManagedLogStream> = new Map();
  private maxBufferLines: number;

  constructor(options: { maxBufferLines?: number } = {}) {
    this.maxBufferLines = options.maxBufferLines ?? 5000;
  }

  public registerStream(
    streamId: string,
    containerId: string,
    channel: ClientChannel
  ): ManagedLogStream {
    const emitter = new EventEmitter() as ManagedLogStream;
    emitter.id = streamId;
    emitter.containerId = containerId;
    emitter.channel = channel;

    const ringBuffer: string[] = [];

    emitter.getBufferedLines = () => [...ringBuffer];

    const appendToBuffer = (chunk: string) => {
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.length === 0) continue;
        ringBuffer.push(line);
        if (ringBuffer.length > this.maxBufferLines) {
          ringBuffer.shift();
        }
      }
    };

    channel.on('data', (data: Buffer) => {
      const chunk = data.toString('utf8');
      appendToBuffer(chunk);
      emitter.emit('data', chunk);
    });

    if (channel.stderr) {
      channel.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString('utf8');
        appendToBuffer(chunk);
        emitter.emit('data', chunk);
      });
    }

    channel.on('close', () => {
      emitter.emit('end');
      this.activeStreams.delete(streamId);
    });

    channel.on('error', (err: Error) => {
      emitter.emit('error', err);
      this.activeStreams.delete(streamId);
    });

    this.activeStreams.set(streamId, emitter);
    return emitter;
  }

  public getActiveStream(streamId: string): ManagedLogStream | undefined {
    return this.activeStreams.get(streamId);
  }

  public stopStream(streamId: string): boolean {
    const stream = this.activeStreams.get(streamId);
    if (!stream) {
      return false;
    }

    try {
      if (typeof stream.channel.close === 'function') {
        stream.channel.close();
      } else if (typeof (stream.channel as any).end === 'function') {
        (stream.channel as any).end();
      }
    } catch {
      // Channel might already be closed
    }

    this.activeStreams.delete(streamId);
    stream.emit('end');
    return true;
  }

  public stopAllStreams(): void {
    for (const [id] of this.activeStreams) {
      this.stopStream(id);
    }
  }
}
