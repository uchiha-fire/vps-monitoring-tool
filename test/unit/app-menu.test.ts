import { describe, it, expect } from 'vitest';
import { buildMenuTemplate } from '../../src/main/menu/AppMenuBuilder';

describe('AppMenuBuilder (TDD)', () => {
  it('should build macOS menu structure when isMac is true', () => {
    const template = buildMenuTemplate({ isMac: true, appName: 'DockMon' });

    // In macOS, the first menu is the application name menu
    expect(template).toHaveLength(5); // App, Edit, View, Window, Help
    const appMenu = template[0];
    expect(appMenu.label).toBe('DockMon');
    expect(Array.isArray(appMenu.submenu)).toBe(true);

    const appSubmenu = appMenu.submenu as Array<{ role?: string; label?: string }>;
    const roles = appSubmenu.map(item => item.role).filter(Boolean);
    expect(roles).toContain('about');
    expect(roles).toContain('hide');
    expect(roles).toContain('hideOthers');
    expect(roles).toContain('unhide');
    expect(roles).toContain('quit');

    // Verify Edit menu has standard clipboard operations (essential for Cmd+C / Cmd+V)
    const editMenu = template[1];
    expect(editMenu.label).toBe('Edit');
    const editSubmenu = editMenu.submenu as Array<{ role?: string; label?: string }>;
    const editRoles = editSubmenu.map(item => item.role);
    expect(editRoles).toContain('undo');
    expect(editRoles).toContain('redo');
    expect(editRoles).toContain('cut');
    expect(editRoles).toContain('copy');
    expect(editRoles).toContain('paste');
    expect(editRoles).toContain('selectAll');

    // Verify Window menu has macOS-specific 'front' role
    const windowMenu = template[3];
    expect(windowMenu.label).toBe('Window');
    const windowSubmenu = windowMenu.submenu as Array<{ role?: string; label?: string }>;
    const windowRoles = windowSubmenu.map(item => item.role);
    expect(windowRoles).toContain('minimize');
    expect(windowRoles).toContain('zoom');
    expect(windowRoles).toContain('front');
  });

  it('should build Windows/Linux menu structure when isMac is false', () => {
    const template = buildMenuTemplate({ isMac: false, appName: 'DockMon' });

    // In Linux/Windows, first menu is File, not App Menu
    expect(template).toHaveLength(4); // File, Edit, View, Help
    const fileMenu = template[0];
    expect(fileMenu.label).toBe('File');

    const fileSubmenu = fileMenu.submenu as Array<{ role?: string; label?: string }>;
    const fileRoles = fileSubmenu.map(item => item.role);
    expect(fileRoles).toContain('quit');

    // Verify Edit menu exists with copy/paste
    const editMenu = template[1];
    expect(editMenu.label).toBe('Edit');
    const editSubmenu = editMenu.submenu as Array<{ role?: string; label?: string }>;
    const editRoles = editSubmenu.map(item => item.role);
    expect(editRoles).toContain('copy');
    expect(editRoles).toContain('paste');
  });

  it('should default to DockMon when appName is not provided', () => {
    const template = buildMenuTemplate({ isMac: true });
    expect(template[0].label).toBe('DockMon');
  });

  it('should include Help menu with links on both platforms', () => {
    const macTemplate = buildMenuTemplate({ isMac: true });
    const helpMenuMac = macTemplate.find(m => m.label === 'Help');
    expect(helpMenuMac).toBeDefined();

    const linuxTemplate = buildMenuTemplate({ isMac: false });
    const helpMenuLinux = linuxTemplate.find(m => m.label === 'Help');
    expect(helpMenuLinux).toBeDefined();
  });
});
