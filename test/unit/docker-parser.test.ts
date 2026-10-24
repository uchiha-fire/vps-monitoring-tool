import { describe, it, expect } from 'vitest';
import { parseDockerPsOutput, parseContainerStatus, parsePortMappings } from '../../src/main/docker/DockerParser';
import { buildDockerOverview } from '../../src/main/docker/DockerHierarchyBuilder';
import { SAMPLE_DOCKER_PS_OUTPUT } from '../mocks/docker-fixtures';

describe('DockerParser & HierarchyBuilder (TDD)', () => {
  describe('parseContainerStatus', () => {
    it('should parse simple running container without healthcheck', () => {
      const { state, health } = parseContainerStatus('Up 3 days');
      expect(state).toBe('running');
      expect(health).toBe('none');
    });

    it('should parse healthy container', () => {
      const { state, health } = parseContainerStatus('Up 2 days (healthy)');
      expect(state).toBe('running');
      expect(health).toBe('healthy');
    });

    it('should parse unhealthy container', () => {
      const { state, health } = parseContainerStatus('Up 18 hours (unhealthy)');
      expect(state).toBe('running');
      expect(health).toBe('unhealthy');
    });

    it('should parse starting health check container', () => {
      const { state, health } = parseContainerStatus('Up 10 seconds (health: starting)');
      expect(state).toBe('running');
      expect(health).toBe('starting');
    });

    it('should parse exited container', () => {
      const { state, health } = parseContainerStatus('Exited (0) 5 hours ago');
      expect(state).toBe('exited');
      expect(health).toBe('none');
    });

    it('should parse restarting container', () => {
      const { state, health } = parseContainerStatus('Restarting (1) 20 seconds ago');
      expect(state).toBe('restarting');
      expect(health).toBe('none');
    });

    it('should parse paused container', () => {
      const { state, health } = parseContainerStatus('Up 4 hours (Paused)');
      expect(state).toBe('paused');
      expect(health).toBe('none');
    });
  });

  describe('parsePortMappings', () => {
    it('should parse multiple port mappings', () => {
      const raw = '0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp';
      const ports = parsePortMappings(raw);
      expect(ports).toHaveLength(3);
      expect(ports[0]).toEqual({
        hostIp: '0.0.0.0',
        hostPort: 80,
        containerPort: 80,
        protocol: 'tcp',
        raw: '0.0.0.0:80->80/tcp',
      });
      expect(ports[2]).toEqual({
        hostIp: '0.0.0.0',
        hostPort: 443,
        containerPort: 443,
        protocol: 'tcp',
        raw: '0.0.0.0:443->443/tcp',
      });
    });

    it('should parse single exposed port without host binding', () => {
      const raw = '6379/tcp';
      const ports = parsePortMappings(raw);
      expect(ports).toHaveLength(1);
      expect(ports[0]).toEqual({
        containerPort: 6379,
        protocol: 'tcp',
        raw: '6379/tcp',
      });
    });

    it('should return empty array for empty or empty string', () => {
      expect(parsePortMappings('')).toEqual([]);
      expect(parsePortMappings('   ')).toEqual([]);
    });
  });

  describe('parseDockerPsOutput', () => {
    it('should parse real-world docker ps json output', () => {
      const containers = parseDockerPsOutput(SAMPLE_DOCKER_PS_OUTPUT);
      expect(containers).toHaveLength(5);

      // Verify nginx (compose container)
      const nginx = containers.find(c => c.name === 'web-proxy-nginx-1');
      expect(nginx).toBeDefined();
      expect(nginx?.composeProject).toBe('web-proxy');
      expect(nginx?.composeService).toBe('nginx');
      expect(nginx?.state).toBe('running');
      expect(nginx?.health).toBe('none');
      expect(nginx?.image).toBe('nginx:alpine');

      // Verify postgres (healthy compose container)
      const postgres = containers.find(c => c.name === 'app-db-postgres-1');
      expect(postgres).toBeDefined();
      expect(postgres?.composeProject).toBe('app-db');
      expect(postgres?.health).toBe('healthy');
      expect(postgres?.state).toBe('running');

      // Verify standalone redis
      const redis = containers.find(c => c.name === 'standalone-redis');
      expect(redis).toBeDefined();
      expect(redis?.composeProject).toBeUndefined();
      expect(redis?.state).toBe('exited');
    });

    it('should handle empty or whitespace-only output gracefully', () => {
      expect(parseDockerPsOutput('')).toEqual([]);
      expect(parseDockerPsOutput('  \n  ')).toEqual([]);
    });
  });

  describe('buildDockerOverview', () => {
    it('should group containers into Compose stacks and standalone containers', () => {
      const containers = parseDockerPsOutput(SAMPLE_DOCKER_PS_OUTPUT);
      const overview = buildDockerOverview(containers);

      expect(overview.totalContainers).toBe(5);
      expect(overview.totalRunning).toBe(3); // nginx, postgres, api
      expect(overview.totalStopped).toBe(2); // redis (exited), caddy (restarting)

      // Compose stacks: 'web-proxy' and 'app-db'
      expect(overview.composeStacks).toHaveLength(2);

      const appDbStack = overview.composeStacks.find(s => s.name === 'app-db');
      expect(appDbStack).toBeDefined();
      expect(appDbStack?.containers).toHaveLength(2); // postgres + api
      expect(appDbStack?.runningCount).toBe(2);
      expect(appDbStack?.totalCount).toBe(2);
      expect(appDbStack?.status).toBe('running');

      // Standalone containers: 'standalone-redis' and 'standalone-caddy'
      expect(overview.standaloneContainers).toHaveLength(2);
      expect(overview.standaloneContainers.map(c => c.name)).toEqual(
        expect.arrayContaining(['standalone-redis', 'standalone-caddy'])
      );
    });
  });
});
