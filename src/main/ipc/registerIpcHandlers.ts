import { ipcMain, BrowserWindow } from 'electron';
import { SshConnectionManager } from '../ssh/SshConnectionManager';
import { DockerServiceManager } from '../docker/DockerServiceManager';
import { ProfileStore } from '../storage/ProfileStore';
import { SshCredentials, SshProfile } from '../../common/types/ssh';
import { ContainerAction } from '../../common/types/docker';

export function registerIpcHandlers(
  mainWindow: BrowserWindow,
  sshManager: SshConnectionManager,
  dockerManager: DockerServiceManager,
  profileStore: ProfileStore
): void {
  // SSH state change notification to renderer
  sshManager.on('stateChanged', (state) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('ssh:state-changed', state);
    }
  });

  // SSH Channels
  ipcMain.handle('ssh:connect', async (_event, credentials: SshCredentials) => {
    try {
      await sshManager.connect(credentials);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('ssh:disconnect', async () => {
    try {
      await sshManager.disconnect();
      return { success: true };
    } catch {
      return { success: false };
    }
  });

  ipcMain.handle('ssh:get-state', async () => {
    return sshManager.getState();
  });

  // Docker Channels
  ipcMain.handle('docker:get-overview', async () => {
    return await dockerManager.getOverview();
  });

  ipcMain.handle(
    'docker:execute-action',
    async (_event, params: { containerId: string; action: ContainerAction }) => {
      return await dockerManager.executeAction(params.containerId, params.action);
    }
  );

  ipcMain.handle(
    'docker:execute-compose-action',
    async (_event, params: { projectName: string; action: 'start' | 'stop' | 'restart' }) => {
      return await dockerManager.executeComposeAction(params.projectName, params.action);
    }
  );

  // Log streaming channels
  ipcMain.handle(
    'logs:start-stream',
    async (_event, params: { containerId: string; tailLines?: number }) => {
      const { streamId, stream } = await dockerManager.startLogStream(
        params.containerId,
        params.tailLines
      );

      // Listen on chunk and push to renderer
      stream.on('data', (chunk: string) => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('logs:data', { streamId, chunk });
        }
      });

      stream.on('end', () => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('logs:end', { streamId });
        }
      });

      return { streamId };
    }
  );

  ipcMain.handle('logs:stop-stream', async (_event, params: { streamId: string }) => {
    const success = dockerManager.stopLogStream(params.streamId);
    return { success };
  });

  // Profiles channels
  ipcMain.handle('profiles:list', async () => {
    return profileStore.listProfiles();
  });

  ipcMain.handle(
    'profiles:save',
    async (_event, profile: Omit<SshProfile, 'id' | 'createdAt'> & { id?: string }) => {
      return profileStore.saveProfile(profile);
    }
  );

  ipcMain.handle('profiles:delete', async (_event, id: string) => {
    const success = profileStore.deleteProfile(id);
    return { success };
  });
}
