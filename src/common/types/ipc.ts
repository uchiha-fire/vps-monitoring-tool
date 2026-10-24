import { SshCredentials, SshProfile, SshConnectionState } from './ssh';
import { DockerOverview, ContainerAction } from './docker';

export interface IpcChannels {
  // SSH connection
  'ssh:connect': (credentials: SshCredentials) => Promise<{ success: boolean; error?: string }>;
  'ssh:disconnect': () => Promise<{ success: boolean }>;
  'ssh:get-state': () => Promise<SshConnectionState>;
  'ssh:state-changed': (callback: (state: SshConnectionState) => void) => () => void;

  // Docker operations
  'docker:get-overview': () => Promise<DockerOverview>;
  'docker:execute-action': (params: { containerId: string; action: ContainerAction }) => Promise<{ success: boolean; error?: string }>;
  'docker:execute-compose-action': (params: { projectName: string; action: 'start' | 'stop' | 'restart' }) => Promise<{ success: boolean; error?: string }>;

  // Real-time log streaming
  'logs:start-stream': (params: { containerId: string; tailLines?: number }) => Promise<{ streamId: string }>;
  'logs:stop-stream': (params: { streamId: string }) => Promise<{ success: boolean }>;
  'logs:on-data': (callback: (data: { streamId: string; chunk: string }) => void) => () => void;
  'logs:on-end': (callback: (data: { streamId: string }) => void) => () => void;

  // Saved profiles
  'profiles:list': () => Promise<SshProfile[]>;
  'profiles:save': (profile: Omit<SshProfile, 'id' | 'createdAt'> & { id?: string }) => Promise<SshProfile>;
  'profiles:delete': (id: string) => Promise<{ success: boolean }>;
}
