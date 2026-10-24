import React from 'react';
import { Terminal, Play, Square, RefreshCw, Globe, Box } from 'lucide-react';
import { DockerContainer, ContainerAction } from '../../../common/types/docker';
import { StatusBadge } from './StatusBadge';

interface ContainerRowProps {
  container: DockerContainer;
  onOpenLogs: (container: DockerContainer) => void;
  onAction: (containerId: string, action: ContainerAction, containerName: string) => void;
  isActionLoading?: boolean;
}

export const ContainerRow: React.FC<ContainerRowProps> = ({
  container,
  onOpenLogs,
  onAction,
  isActionLoading,
}) => {
  const isRunning = container.state === 'running';

  return (
    <div className="px-5 py-3.5 bg-slate-900/60 hover:bg-slate-800/40 border-b border-slate-800/50 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Container Info */}
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="p-2 rounded-lg bg-slate-800 text-slate-400 mt-0.5 shrink-0 border border-slate-700/50">
          <Box className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-semibold text-xs text-white truncate font-mono">
              {container.name}
            </span>
            <StatusBadge state={container.state} health={container.health} />
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap">
            <span className="text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
              {container.image}
            </span>
            <span>ID: {container.id.substring(0, 12)}</span>
            <span className="text-slate-500">•</span>
            <span>{container.status}</span>
          </div>

          {/* Exposed Ports */}
          {container.ports.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <Globe className="w-3 h-3 text-slate-500" />
              {container.ports.map((p, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono"
                >
                  {p.hostPort ? `${p.hostPort}:${p.containerPort}/${p.protocol}` : `${p.containerPort}/${p.protocol}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Open Logs Button */}
        <button
          onClick={() => onOpenLogs(container)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
          title="Stream Realtime Logs"
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          Logs
        </button>

        {/* Start / Stop / Restart buttons */}
        {isRunning ? (
          <button
            onClick={() => onAction(container.id, 'stop', container.name)}
            disabled={isActionLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors disabled:opacity-50"
            title="Stop Container"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onAction(container.id, 'start', container.name)}
            disabled={isActionLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/60 hover:border-emerald-500/40 transition-colors disabled:opacity-50"
            title="Start Container"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onAction(container.id, 'restart', container.name)}
          disabled={isActionLoading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700/60 hover:border-amber-500/40 transition-colors disabled:opacity-50"
          title="Restart Container"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
