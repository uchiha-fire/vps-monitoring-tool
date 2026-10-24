import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Layers, RefreshCw, Square } from 'lucide-react';
import { DockerComposeStack, DockerContainer, ContainerAction } from '../../../common/types/docker';
import { ContainerRow } from './ContainerRow';

interface ComposeStackCardProps {
  stack: DockerComposeStack;
  onOpenLogs: (container: DockerContainer) => void;
  onContainerAction: (containerId: string, action: ContainerAction, containerName: string) => void;
  onStackAction: (projectName: string, action: 'start' | 'stop' | 'restart') => void;
}

export const ComposeStackCard: React.FC<ComposeStackCardProps> = ({
  stack,
  onOpenLogs,
  onContainerAction,
  onStackAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusBadge = () => {
    switch (stack.status) {
      case 'running':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {stack.runningCount}/{stack.totalCount} Running
          </span>
        );
      case 'partial':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {stack.runningCount}/{stack.totalCount} Degraded
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {stack.runningCount}/{stack.totalCount} Stopped
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-md overflow-hidden transition-all">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <button className="text-slate-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white font-mono">{stack.name}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-[11px] text-slate-400">Docker Compose Stack</p>
          </div>
        </div>

        {/* Stack-wide Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStackAction(stack.name, 'restart')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-colors"
            title="Restart all services in this stack"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            Restart Stack
          </button>
          <button
            onClick={() => onStackAction(stack.name, 'stop')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs border border-slate-700/60 hover:border-rose-500/40 transition-colors"
            title="Stop all services in this stack"
          >
            <Square className="w-3 h-3 text-rose-400" />
            Stop Stack
          </button>
        </div>
      </div>

      {/* Expanded Container List */}
      {isExpanded && (
        <div className="divide-y divide-slate-800/40">
          {stack.containers.map((container) => (
            <ContainerRow
              key={container.id}
              container={container}
              onOpenLogs={onOpenLogs}
              onAction={onContainerAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};
