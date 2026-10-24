import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileStore } from '../../src/main/storage/ProfileStore';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('ProfileStore (TDD)', () => {
  let tempDir: string;
  let testFilePath: string;
  let store: ProfileStore;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vps-profile-test-'));
    testFilePath = path.join(tempDir, 'profiles.json');
    store = new ProfileStore({ filePath: testFilePath });
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it('should start with an empty profile list', () => {
    const profiles = store.listProfiles();
    expect(profiles).toEqual([]);
  });

  it('should save a new profile with generated id and timestamp', () => {
    const saved = store.saveProfile({
      label: 'Production Server',
      host: '123.45.67.89',
      port: 22,
      username: 'root',
      password: 'secretpassword',
    });

    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeDefined();
    expect(saved.label).toBe('Production Server');

    const list = store.listProfiles();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(saved.id);
  });

  it('should update an existing profile when id is provided', () => {
    const saved = store.saveProfile({
      label: 'Staging Server',
      host: '10.0.0.1',
      port: 22,
      username: 'ubuntu',
    });

    const updated = store.saveProfile({
      id: saved.id,
      label: 'Updated Staging',
      host: '10.0.0.2',
      port: 2222,
      username: 'ubuntu',
    });

    expect(updated.id).toBe(saved.id);
    expect(updated.label).toBe('Updated Staging');
    expect(updated.host).toBe('10.0.0.2');

    const list = store.listProfiles();
    expect(list).toHaveLength(1);
    expect(list[0].label).toBe('Updated Staging');
  });

  it('should delete a profile by id', () => {
    const p1 = store.saveProfile({
      label: 'Server 1',
      host: '1.1.1.1',
      port: 22,
      username: 'user1',
    });
    const p2 = store.saveProfile({
      label: 'Server 2',
      host: '2.2.2.2',
      port: 22,
      username: 'user2',
    });

    expect(store.listProfiles()).toHaveLength(2);

    const deleted = store.deleteProfile(p1.id);
    expect(deleted).toBe(true);

    const remaining = store.listProfiles();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(p2.id);
  });

  it('should default to .dockmon directory under user home', () => {
    const customHome = fs.mkdtempSync(path.join(os.tmpdir(), 'dockmon-home-test-'));
    const defaultStore = new ProfileStore({ homeDir: customHome });

    defaultStore.saveProfile({
      label: 'Home Server',
      host: '192.168.1.100',
      port: 22,
      username: 'admin',
    });

    const expectedFile = path.join(customHome, '.dockmon', 'profiles.json');
    expect(fs.existsSync(expectedFile)).toBe(true);

    const content = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
    expect(content).toHaveLength(1);
    expect(content[0].label).toBe('Home Server');

    fs.rmSync(customHome, { recursive: true, force: true });
  });

  it('should migrate legacy .vps-docker-monitor profiles to .dockmon on initialization', () => {
    const customHome = fs.mkdtempSync(path.join(os.tmpdir(), 'dockmon-migrate-test-'));
    const legacyDir = path.join(customHome, '.vps-docker-monitor');
    fs.mkdirSync(legacyDir, { recursive: true });

    const legacyProfiles = [
      {
        id: 'legacy-1',
        label: 'Old VPS Server',
        host: 'old.vps.com',
        port: 22,
        username: 'root',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    fs.writeFileSync(path.join(legacyDir, 'profiles.json'), JSON.stringify(legacyProfiles), 'utf8');

    // Initialize new store without explicit filePath, using customHome
    const migratedStore = new ProfileStore({ homeDir: customHome });
    const loadedProfiles = migratedStore.listProfiles();

    expect(loadedProfiles).toHaveLength(1);
    expect(loadedProfiles[0].id).toBe('legacy-1');
    expect(loadedProfiles[0].label).toBe('Old VPS Server');

    // Verify .dockmon/profiles.json was created with the migrated data
    const newFile = path.join(customHome, '.dockmon', 'profiles.json');
    expect(fs.existsSync(newFile)).toBe(true);

    fs.rmSync(customHome, { recursive: true, force: true });
  });
});
