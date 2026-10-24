import React from 'react';
import { ContainerState, ContainerHealth } from '../../../common/types/docker';
import { CheckCircle2, AlertTriangle, XCircle, Play, Pause, RefreshCw, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  state: ContainerState;
  health: ContainerHealth;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state, health }) => {
  const getStateConfig = () => {
    switch (state) {
      case 'running':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: Play,
          label: 'Running',
        };
      case 'exited':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          dot: 'bg-rose-400',
          icon: XCircle,
          label: 'Exited',
        };
      case 'restarting':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          dot: 'bg-amber-400',
          icon: RefreshCw,
          label: 'Restarting',
        };
      case 'paused':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          dot: 'bg-blue-400',
          icon: Pause,
          label: 'Paused',
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
          dot: 'bg-slate-400',
          icon: HelpCircle,
          label: state || 'Unknown',
        };
    }
  };

  const getHealthConfig = () => {
    switch (health) {
      case 'healthy':
        return {
          badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
          icon: CheckCircle2,
          label: 'Healthy',
        };
      case 'unhealthy':
        return {
          badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
          icon: AlertTriangle,
          label: 'Unhealthy',
        };
      case 'starting':
        return {
          badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
          icon: RefreshCw,
          label: 'Starting',
        };
      default:
        return null;
    }
  };

  const stateCfg = getStateConfig();
  const healthCfg = getHealthConfig();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${stateCfg.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${stateCfg.dot} animate-pulse`} />
        {stateCfg.label}
      </span>

      {healthCfg && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${healthCfg.badge}`}
        >
          <healthCfg.icon className="w-3 h-3" />
          {healthCfg.label}
        </span>
      )}
    </div>
  );
};
