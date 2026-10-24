import { SshConnectionManager } from '../ssh/SshConnectionManager';
import { parseDockerPsOutput } from './DockerParser';
import { buildDockerOverview } from './DockerHierarchyBuilder';
import { LogStreamController, ManagedLogStream } from './LogStreamController';
import { DockerOverview, ContainerAction } from '../../common/types/docker';
import crypto from 'crypto';

export class DockerServiceManager {
  private sshManager: SshConnectionManager;
  private logStreamController: LogStreamController;

  constructor(sshManager: SshConnectionManager, logStreamController?: LogStreamController) {
    this.sshManager = sshManager;
    this.logStreamController = logStreamController || new LogStreamController();
  }

  public getLogStreamController(): LogStreamController {
    return this.logStreamController;
  }

  public async getOverview(): Promise<DockerOverview> {
    const command = "docker ps -a --format '{{json .}}'";
    const result = await this.sshManager.executeCommand(command);

    if (result.exitCode !== 0 && result.stderr) {
      throw new Error(`Failed to list containers: ${result.stderr}`);
    }

    const containers = parseDockerPsOutput(result.stdout);
    return buildDockerOverview(containers);
  }

  public async executeAction(
    containerId: string,
    action: ContainerAction
  ): Promise<{ success: boolean; error?: string }> {
    const sanitizedId = containerId.replace(/["$`\\]/g, '');
    const command = `docker ${action} "${sanitizedId}"`;

    const result = await this.sshManager.executeCommand(command);

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr.trim() || `Command exited with code ${result.exitCode}`,
      };
    }

    return { success: true };
  }

  public async executeComposeAction(
    projectName: string,
    action: 'start' | 'stop' | 'restart'
  ): Promise<{ success: boolean; error?: string }> {
    const sanitizedProject = projectName.replace(/["$`\\]/g, '');
    const command = `docker compose -p "${sanitizedProject}" ${action}`;

    const result = await this.sshManager.executeCommand(command);

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr.trim() || `Command exited with code ${result.exitCode}`,
      };
    }

    return { success: true };
  }

  public async startLogStream(
    containerId: string,
    tailLines: number = 200
  ): Promise<{ streamId: string; stream: ManagedLogStream }> {
    const sanitizedId = containerId.replace(/["$`\\]/g, '');
    const tail = Math.max(1, Math.min(10000, tailLines));
    const command = `docker logs -f --tail ${tail} --timestamps "${sanitizedId}"`;

    const channel = await this.sshManager.openStream(command);
    const streamId = crypto.randomUUID();

    const stream = this.logStreamController.registerStream(streamId, sanitizedId, channel);
    return { streamId, stream };
  }

  public stopLogStream(streamId: string): boolean {
    return this.logStreamController.stopStream(streamId);
  }
}
