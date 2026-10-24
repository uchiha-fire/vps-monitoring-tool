import { describe, it, expect } from 'vitest';
import { parseSshCommand, toSshCommand, InvalidSshCommandError } from '../../src/main/ssh/SshConfigParser';

describe('SshConfigParser (TDD)', () => {
  describe('parseSshCommand', () => {
    it('should parse standard ssh command with default port 22', () => {
      const result = parseSshCommand('ssh root@192.168.1.100');
      expect(result).toEqual({
        host: '192.168.1.100',
        username: 'root',
        port: 22,
      });
    });

    it('should parse custom port with -p flag before user@host', () => {
      const result = parseSshCommand('ssh -p 2222 ubuntu@ec2-54-12-34.compute.amazonaws.com');
      expect(result).toEqual({
        host: 'ec2-54-12-34.compute.amazonaws.com',
        username: 'ubuntu',
        port: 2222,
      });
    });

    it('should parse custom port with -p flag after user@host', () => {
      const result = parseSshCommand('ssh deploy@10.0.0.5 -p 8022');
      expect(result).toEqual({
        host: '10.0.0.5',
        username: 'deploy',
        port: 8022,
      });
    });

    it('should parse identity file flag -i', () => {
      const result = parseSshCommand('ssh -i ~/.ssh/vps_rsa -p 2222 admin@vps.mysite.com');
      expect(result).toEqual({
        host: 'vps.mysite.com',
        username: 'admin',
        port: 2222,
        privateKey: '~/.ssh/vps_rsa',
      });
    });

    it('should parse identity file with quotes and spaces', () => {
      const result = parseSshCommand('ssh -i "/home/dev/keys/my vps key.pem" root@123.45.67.89');
      expect(result).toEqual({
        host: '123.45.67.89',
        username: 'root',
        port: 22,
        privateKey: '/home/dev/keys/my vps key.pem',
      });
    });

    it('should ignore common SSH flags like -v, -C, -4, -o StrictHostKeyChecking=no', () => {
      const result = parseSshCommand('ssh -v -C -4 -o StrictHostKeyChecking=no -p 2200 dev@app.internal');
      expect(result).toEqual({
        host: 'app.internal',
        username: 'dev',
        port: 2200,
      });
    });

    it('should handle ssh command without "ssh " prefix if user just pastes user@host', () => {
      const result = parseSshCommand('root@167.99.123.45');
      expect(result).toEqual({
        host: '167.99.123.45',
        username: 'root',
        port: 22,
      });
    });

    it('should throw InvalidSshCommandError for empty input', () => {
      expect(() => parseSshCommand('')).toThrow(InvalidSshCommandError);
      expect(() => parseSshCommand('   ')).toThrow('SSH command string cannot be empty');
    });

    it('should throw InvalidSshCommandError if username or host is missing', () => {
      expect(() => parseSshCommand('ssh -p 2222')).toThrow(InvalidSshCommandError);
      expect(() => parseSshCommand('ssh -p 2222 -i id_rsa')).toThrow('Missing user@host destination in SSH command');
    });

    it('should throw InvalidSshCommandError for invalid port numbers', () => {
      expect(() => parseSshCommand('ssh -p notaport user@host')).toThrow('Invalid port number');
      expect(() => parseSshCommand('ssh -p 70000 user@host')).toThrow('Port must be between 1 and 65535');
      expect(() => parseSshCommand('ssh -p 0 user@host')).toThrow('Port must be between 1 and 65535');
    });
  });

  describe('toSshCommand', () => {
    it('should serialize SshCredentials into standard ssh command', () => {
      const command = toSshCommand({
        host: 'vps.example.com',
        username: 'root',
        port: 22,
      });
      expect(command).toBe('ssh root@vps.example.com');
    });

    it('should include -p flag when port is not 22', () => {
      const command = toSshCommand({
        host: 'vps.example.com',
        username: 'admin',
        port: 2222,
      });
      expect(command).toBe('ssh -p 2222 admin@vps.example.com');
    });

    it('should include -i flag when privateKey path is specified', () => {
      const command = toSshCommand({
        host: 'vps.example.com',
        username: 'admin',
        port: 2222,
        privateKey: '/home/user/.ssh/id_rsa',
      });
      expect(command).toBe('ssh -p 2222 -i "/home/user/.ssh/id_rsa" admin@vps.example.com');
    });
  });
});
