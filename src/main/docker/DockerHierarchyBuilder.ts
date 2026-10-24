import { DockerContainer, DockerComposeStack, DockerOverview } from '../../common/types/docker';

/**
 * Groups raw containers into Compose Stacks and Standalone containers
 * with summary counts and stack health status.
 */
export function buildDockerOverview(containers: DockerContainer[]): DockerOverview {
  const stackMap = new Map<string, DockerContainer[]>();
  const standaloneContainers: DockerContainer[] = [];

  let totalRunning = 0;
  let totalStopped = 0;

  for (const container of containers) {
    if (container.state === 'running') {
      totalRunning++;
    } else {
      totalStopped++;
    }

    if (container.composeProject) {
      const existing = stackMap.get(container.composeProject) || [];
      existing.push(container);
      stackMap.set(container.composeProject, existing);
    } else {
      standaloneContainers.push(container);
    }
  }

  const composeStacks: DockerComposeStack[] = [];

  for (const [projectName, stackContainers] of stackMap.entries()) {
    const runningCount = stackContainers.filter(c => c.state === 'running').length;
    const totalCount = stackContainers.length;

    let status: 'running' | 'partial' | 'stopped' = 'stopped';
    if (runningCount === totalCount) {
      status = 'running';
    } else if (runningCount > 0) {
      status = 'partial';
    }

    composeStacks.push({
      name: projectName,
      containers: stackContainers,
      runningCount,
      totalCount,
      status,
    });
  }

  // Sort stacks alphabetically
  composeStacks.sort((a, b) => a.name.localeCompare(b.name));

  return {
    composeStacks,
    standaloneContainers,
    totalRunning,
    totalStopped,
    totalContainers: containers.length,
  };
}
