import { describe, it, expect } from 'vitest';
import os from 'os';
import path from 'path';
import fs from 'fs';
import {
  resolveSshPath,
  isRawKeyContent,
  loadPrivateKey,
  PrivateKeyNotFoundError,
} from '../../src/main/ssh/SshPathResolver';

describe('SshPathResolver (TDD)', () => {
  const homeDir = os.homedir();

  describe('resolveSshPath', () => {
    it('should expand leading tilde ~ to user home directory', () => {
      const resolved = resolveSshPath('~/.ssh/id_rsa');
      expect(resolved).toBe(path.join(homeDir, '.ssh', 'id_rsa'));
    });

    it('should expand tilde with subdirectories and custom keys', () => {
      const resolved = resolveSshPath('~/keys/production/app.pem');
      expect(resolved).toBe(path.join(homeDir, 'keys', 'production', 'app.pem'));
    });

    it('should strip surrounding double or single quotes', () => {
      const resolvedDouble = resolveSshPath('"~/.ssh/my key.pem"');
      expect(resolvedDouble).toBe(path.join(homeDir, '.ssh', 'my key.pem'));

      const resolvedSingle = resolveSshPath("'~/.ssh/id_ed25519'");
      expect(resolvedSingle).toBe(path.join(homeDir, '.ssh', 'id_ed25519'));
    });

    it('should expand $HOME environment variable', () => {
      const resolved = resolveSshPath('$HOME/.ssh/id_ed25519');
      expect(resolved).toBe(path.join(homeDir, '.ssh', 'id_ed25519'));
    });

    it('should leave absolute paths untouched', () => {
      const absPath = path.resolve('/etc/ssl/certs/vps.pem');
      const resolved = resolveSshPath(absPath);
      expect(resolved).toBe(absPath);
    });

    it('should resolve relative paths against process.cwd() or absolute', () => {
      const relPath = './test-key.pem';
      const resolved = resolveSshPath(relPath);
      expect(path.isAbsolute(resolved)).toBe(true);
      expect(resolved).toBe(path.resolve(process.cwd(), 'test-key.pem'));
    });
  });

  describe('isRawKeyContent', () => {
    it('should return true for OpenSSH private key PEM content', () => {
      const pem = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
-----END OPENSSH PRIVATE KEY-----`;
      expect(isRawKeyContent(pem)).toBe(true);
    });

    it('should return true for RSA/DSA/EC private key content', () => {
      const rsa = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...';
      expect(isRawKeyContent(rsa)).toBe(true);
    });

    it('should return false for file paths', () => {
      expect(isRawKeyContent('~/.ssh/id_rsa')).toBe(false);
      expect(isRawKeyContent('/home/user/.ssh/id_ed25519')).toBe(false);
      expect(isRawKeyContent('C:\\Users\\user\\.ssh\\id_rsa')).toBe(false);
      expect(isRawKeyContent('id_rsa.pem')).toBe(false);
    });
  });

  describe('loadPrivateKey', () => {
    it('should pass through raw PEM key content directly', () => {
      const rawPem = `-----BEGIN OPENSSH PRIVATE KEY-----
dummykeycontent
-----END OPENSSH PRIVATE KEY-----`;
      const result = loadPrivateKey(rawPem);
      expect(result.content).toBe(rawPem);
      expect(result.resolvedPath).toBeUndefined();
    });

    it('should load actual key file content when file exists on disk', () => {
      const tempKeyPath = path.join(os.tmpdir(), `dockmon-test-key-${Date.now()}.pem`);
      const keyContent = 'DUMMY_KEY_CONTENT_FOR_UNIT_TEST';
      fs.writeFileSync(tempKeyPath, keyContent, 'utf8');

      try {
        const result = loadPrivateKey(tempKeyPath);
        expect(result.content.toString('utf8')).toBe(keyContent);
        expect(result.resolvedPath).toBe(tempKeyPath);
      } finally {
        if (fs.existsSync(tempKeyPath)) {
          fs.unlinkSync(tempKeyPath);
        }
      }
    });

    it('should throw PrivateKeyNotFoundError with clear descriptive message when file does not exist', () => {
      const nonExistentPath = '~/.ssh/definitely_not_existing_key_xyz123';
      const expectedResolved = path.join(homeDir, '.ssh', 'definitely_not_existing_key_xyz123');

      expect(() => loadPrivateKey(nonExistentPath)).toThrow(PrivateKeyNotFoundError);
      try {
        loadPrivateKey(nonExistentPath);
      } catch (err) {
        const error = err as PrivateKeyNotFoundError;
        expect(error.message).toContain('Private key file not found');
        expect(error.message).toContain(nonExistentPath);
        expect(error.message).toContain(expectedResolved);
        expect(error.originalPath).toBe(nonExistentPath);
        expect(error.resolvedPath).toBe(expectedResolved);
      }
    });
  });
});
