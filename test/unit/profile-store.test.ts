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
});
