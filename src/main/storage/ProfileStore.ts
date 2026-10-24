import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SshProfile } from '../../common/types/ssh';

export interface ProfileStoreOptions {
  filePath?: string;
  homeDir?: string;
}

export class ProfileStore {
  private filePath: string;
  private profiles: SshProfile[] = [];

  constructor(options: ProfileStoreOptions = {}) {
    if (options.filePath) {
      this.filePath = options.filePath;
    } else {
      // Default to user home or current directory
      const homeDir = options.homeDir || process.env.HOME || process.env.USERPROFILE || '.';
      const appDir = path.join(homeDir, '.dockmon');
      const legacyDir = path.join(homeDir, '.vps-docker-monitor');

      if (!fs.existsSync(appDir)) {
        try {
          fs.mkdirSync(appDir, { recursive: true });
        } catch {
          // Fallback to local file
        }
      }

      this.filePath = path.join(appDir, 'profiles.json');

      // Seamless migration: If legacy profiles exist and new file does not, copy it over
      const legacyFile = path.join(legacyDir, 'profiles.json');
      if (fs.existsSync(legacyFile) && !fs.existsSync(this.filePath)) {
        try {
          fs.copyFileSync(legacyFile, this.filePath);
        } catch {
          // Ignore copy failure
        }
      }
    }

    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.profiles = parsed;
        }
      }
    } catch {
      this.profiles = [];
    }
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.profiles, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist profiles:', err);
    }
  }

  public listProfiles(): SshProfile[] {
    return [...this.profiles];
  }

  public getProfile(id: string): SshProfile | undefined {
    return this.profiles.find(p => p.id === id);
  }

  public saveProfile(
    input: Omit<SshProfile, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): SshProfile {
    const existingIndex = input.id ? this.profiles.findIndex(p => p.id === input.id) : -1;

    if (existingIndex !== -1) {
      const existing = this.profiles[existingIndex];
      const updated: SshProfile = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
      };
      this.profiles[existingIndex] = updated;
      this.persist();
      return updated;
    } else {
      const created: SshProfile = {
        ...input,
        id: input.id || crypto.randomUUID(),
        createdAt: input.createdAt || new Date().toISOString(),
      };
      this.profiles.push(created);
      this.persist();
      return created;
    }
  }

  public deleteProfile(id: string): boolean {
    const initialLen = this.profiles.length;
    this.profiles = this.profiles.filter(p => p.id !== id);
    const deleted = this.profiles.length < initialLen;
    if (deleted) {
      this.persist();
    }
    return deleted;
  }
}
