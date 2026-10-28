import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { SshConnectionManager } from './ssh/SshConnectionManager';
import { DockerServiceManager } from './docker/DockerServiceManager';
import { ProfileStore } from './storage/ProfileStore';
import { registerIpcHandlers } from './ipc/registerIpcHandlers';
import { setupApplicationMenu } from './menu/AppMenuBuilder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
const sshManager = new SshConnectionManager();
const dockerManager = new DockerServiceManager(sshManager);
const profileStore = new ProfileStore();

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: 'DockMon',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  registerIpcHandlers(mainWindow, sshManager, dockerManager, profileStore);

  // In development, load from Vite dev server; in production, load built HTML
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    sshManager.disconnect();
  });
}

app.whenReady().then(() => {
  setupApplicationMenu();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
