import { app, Menu, shell, MenuItemConstructorOptions } from 'electron';

export interface MenuBuilderOptions {
  isMac: boolean;
  appName?: string;
  onOpenWebsite?: () => void;
  onReportIssue?: () => void;
}

export function buildMenuTemplate(options: MenuBuilderOptions): MenuItemConstructorOptions[] {
  const isMac = options.isMac;
  const appName = options.appName || 'DockMon';

  const defaultOpenWebsite = () => {
    shell?.openExternal?.('https://dockmon.zephyrus-labs.tech/');
  };
  const defaultReportIssue = () => {
    shell?.openExternal?.('https://github.com/uchiha-fire/vps-monitoring-tool/issues');
  };

  const onOpenWebsite = options.onOpenWebsite || defaultOpenWebsite;
  const onReportIssue = options.onReportIssue || defaultReportIssue;

  const macAppMenu: MenuItemConstructorOptions = {
    label: appName,
    submenu: [
      { role: 'about', label: `About ${appName}` },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide', label: `Hide ${appName}` },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit', label: `Quit ${appName}` },
    ],
  };

  const fileMenu: MenuItemConstructorOptions = {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit', label: 'Exit' },
    ],
  };

  const editMenu: MenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' as const },
            { role: 'delete' as const },
            { role: 'selectAll' as const },
            { type: 'separator' as const },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' as const }, { role: 'stopSpeaking' as const }],
            },
          ]
        : [
            { role: 'delete' as const },
            { type: 'separator' as const },
            { role: 'selectAll' as const },
          ]),
    ],
  };

  const viewMenu: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  };

  const windowMenu: MenuItemConstructorOptions = {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' as const },
            { role: 'front' as const },
            { type: 'separator' as const },
            { role: 'window' as const },
          ]
        : [{ role: 'close' as const }]),
    ],
  };

  const helpMenu: MenuItemConstructorOptions = {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'DockMon Documentation & Website',
        click: () => onOpenWebsite(),
      },
      {
        label: 'Report an Issue (GitHub)',
        click: () => onReportIssue(),
      },
    ],
  };

  if (isMac) {
    return [macAppMenu, editMenu, viewMenu, windowMenu, helpMenu];
  } else {
    return [fileMenu, editMenu, viewMenu, helpMenu];
  }
}

export function setupApplicationMenu(options?: Partial<MenuBuilderOptions>): void {
  const isMac = options?.isMac ?? (typeof process !== 'undefined' && process.platform === 'darwin');
  const template = buildMenuTemplate({
    isMac,
    appName: options?.appName || app?.name || 'DockMon',
    onOpenWebsite: options?.onOpenWebsite,
    onReportIssue: options?.onReportIssue,
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
