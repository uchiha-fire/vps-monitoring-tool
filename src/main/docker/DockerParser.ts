import { DockerContainer, ContainerState, ContainerHealth, PortMapping } from '../../common/types/docker';

/**
 * Parses container status strings like:
 * "Up 3 days"
 * "Up 2 days (healthy)"
 * "Up 18 hours (unhealthy)"
 * "Up 10 seconds (health: starting)"
 * "Exited (0) 5 hours ago"
 * "Restarting (1) 20 seconds ago"
 * "Up 4 hours (Paused)"
 */
export function parseContainerStatus(statusRaw: string): { state: ContainerState; health: ContainerHealth } {
  if (!statusRaw || typeof statusRaw !== 'string') {
    return { state: 'unknown', health: 'none' };
  }

  const trimmed = statusRaw.trim();
  const lower = trimmed.toLowerCase();

  // Health extraction
  let health: ContainerHealth = 'none';
  if (lower.includes('(healthy)')) {
    health = 'healthy';
  } else if (lower.includes('(unhealthy)')) {
    health = 'unhealthy';
  } else if (lower.includes('(health: starting)')) {
    health = 'starting';
  }

  // State extraction
  let state: ContainerState = 'unknown';
  if (lower.includes('(paused)') || lower.startsWith('paused')) {
    state = 'paused';
  } else if (lower.startsWith('up')) {
    state = 'running';
  } else if (lower.startsWith('exited')) {
    state = 'exited';
  } else if (lower.startsWith('restarting')) {
    state = 'restarting';
  } else if (lower.startsWith('dead')) {
    state = 'dead';
  } else if (lower.startsWith('created')) {
    state = 'created';
  }

  return { state, health };
}

/**
 * Parses docker port string format:
 * "0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp" or "6379/tcp"
 */
export function parsePortMappings(portsRaw: string): PortMapping[] {
  if (!portsRaw || typeof portsRaw !== 'string' || portsRaw.trim().length === 0) {
    return [];
  }

  const items = portsRaw.split(',').map(s => s.trim()).filter(Boolean);
  const mappings: PortMapping[] = [];

  for (const item of items) {
    // Check if it's a mapping e.g. 0.0.0.0:80->80/tcp or :::80->80/tcp
    if (item.includes('->')) {
      const [hostPart, containerPart] = item.split('->');
      const [containerPortStr, protoStr] = (containerPart || '').split('/');
      const protocol = (protoStr?.toLowerCase() === 'udp' ? 'udp' : 'tcp') as 'tcp' | 'udp';
      const containerPort = parseInt(containerPortStr, 10);

      let hostIp: string | undefined = undefined;
      let hostPort: number | undefined = undefined;

      const lastColonIndex = hostPart.lastIndexOf(':');
      if (lastColonIndex !== -1) {
        hostIp = hostPart.substring(0, lastColonIndex);
        hostPort = parseInt(hostPart.substring(lastColonIndex + 1), 10);
      }

      mappings.push({
        hostIp,
        hostPort: isNaN(hostPort!) ? undefined : hostPort,
        containerPort: isNaN(containerPort) ? 0 : containerPort,
        protocol,
        raw: item,
      });
    } else {
      // Just exposed port e.g. "6379/tcp"
      const [portStr, protoStr] = item.split('/');
      const protocol = (protoStr?.toLowerCase() === 'udp' ? 'udp' : 'tcp') as 'tcp' | 'udp';
      const containerPort = parseInt(portStr, 10);

      mappings.push({
        containerPort: isNaN(containerPort) ? 0 : containerPort,
        protocol,
        raw: item,
      });
    }
  }

  return mappings;
}

/**
 * Parses comma-separated label string into key-value map
 */
export function parseLabels(labelsRaw: string): Record<string, string> {
  if (!labelsRaw || typeof labelsRaw !== 'string' || labelsRaw.trim().length === 0) {
    return {};
  }

  const result: Record<string, string> = {};
  const pairs = labelsRaw.split(',');

  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx !== -1) {
      const key = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1).trim();
      if (key) {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Parses the raw stdout of `docker ps -a --format '{{json .}}'`
 */
export function parseDockerPsOutput(raw: string): DockerContainer[] {
  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return [];
  }

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const containers: DockerContainer[] = [];

  for (const line of lines) {
    try {
      const json = JSON.parse(line);
      const labels = parseLabels(json.Labels || '');
      const { state, health } = parseContainerStatus(json.Status || '');
      const ports = parsePortMappings(json.Ports || '');

      const composeProject = labels['com.docker.compose.project'];
      const composeService = labels['com.docker.compose.service'];

      containers.push({
        id: json.ID || '',
        name: (json.Names || '').replace(/^\//, ''),
        image: json.Image || '',
        command: json.Command || '',
        createdAt: json.CreatedAt || '',
        status: json.Status || '',
        state,
        health,
        ports,
        labels,
        composeProject: composeProject || undefined,
        composeService: composeService || undefined,
      });
    } catch {
      // Skip non-json line
      continue;
    }
  }

  return containers;
}
