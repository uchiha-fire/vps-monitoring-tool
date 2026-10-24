export type ContainerState =
  | 'running'
  | 'exited'
  | 'restarting'
  | 'paused'
  | 'dead'
  | 'created'
  | 'unknown';

export type ContainerHealth =
  | 'healthy'
  | 'unhealthy'
  | 'starting'
  | 'none';

export interface PortMapping {
  hostIp?: string;
  hostPort?: number;
  containerPort: number;
  protocol: 'tcp' | 'udp';
  raw: string;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  command: string;
  createdAt: string;
  status: string;
  state: ContainerState;
  health: ContainerHealth;
  ports: PortMapping[];
  labels: Record<string, string>;
  composeProject?: string;
  composeService?: string;
}

export interface DockerComposeStack {
  name: string;
  containers: DockerContainer[];
  runningCount: number;
  totalCount: number;
  status: 'running' | 'partial' | 'stopped';
}

export interface DockerOverview {
  composeStacks: DockerComposeStack[];
  standaloneContainers: DockerContainer[];
  totalRunning: number;
  totalStopped: number;
  totalContainers: number;
}

export type ContainerAction =
  | 'start'
  | 'stop'
  | 'restart'
  | 'pause'
  | 'unpause'
  | 'kill';
