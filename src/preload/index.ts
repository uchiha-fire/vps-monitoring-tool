import { contextBridge, ipcRenderer } from 'electron';
import { SshCredentials, SshProfile, SshConnectionState } from '../common/types/ssh';
import { DockerOverview, ContainerAction } from '../common/types/docker';

export const electronAPI = {
  // SSH
  connectSsh: (credentials: SshCredentials): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('ssh:connect', credentials),
  disconnectSsh: (): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('ssh:disconnect'),
  getSshState: (): Promise<SshConnectionState> =>
    ipcRenderer.invoke('ssh:get-state'),
  checkPrivateKey: (keyPathOrContent: string): Promise<{ isRaw: boolean; exists: boolean; resolvedPath?: string }> =>
    ipcRenderer.invoke('ssh:check-key', keyPathOrContent),
  onSshStateChanged: (callback: (state: SshConnectionState) => void) => {
    const handler = (_event: any, state: SshConnectionState) => callback(state);
    ipcRenderer.on('ssh:state-changed', handler);
    return () => ipcRenderer.removeListener('ssh:state-changed', handler);
  },

  // Docker
  getDockerOverview: (): Promise<DockerOverview> =>
    ipcRenderer.invoke('docker:get-overview'),
  executeContainerAction: (params: { containerId: string; action: ContainerAction }): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('docker:execute-action', params),
  executeComposeAction: (params: { projectName: string; action: 'start' | 'stop' | 'restart' }): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('docker:execute-compose-action', params),

  // Logs
  startLogStream: (params: { containerId: string; tailLines?: number }): Promise<{ streamId: string }> =>
    ipcRenderer.invoke('logs:start-stream', params),
  stopLogStream: (params: { streamId: string }): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('logs:stop-stream', params),
  onLogData: (callback: (data: { streamId: string; chunk: string }) => void) => {
    const handler = (_event: any, data: { streamId: string; chunk: string }) => callback(data);
    ipcRenderer.on('logs:data', handler);
    return () => ipcRenderer.removeListener('logs:data', handler);
  },
  onLogEnd: (callback: (data: { streamId: string }) => void) => {
    const handler = (_event: any, data: { streamId: string }) => callback(data);
    ipcRenderer.on('logs:end', handler);
    return () => ipcRenderer.removeListener('logs:end', handler);
  },

  // Profiles
  listProfiles: (): Promise<SshProfile[]> =>
    ipcRenderer.invoke('profiles:list'),
  saveProfile: (profile: Omit<SshProfile, 'id' | 'createdAt'> & { id?: string }): Promise<SshProfile> =>
    ipcRenderer.invoke('profiles:save', profile),
  deleteProfile: (id: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('profiles:delete', id),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
