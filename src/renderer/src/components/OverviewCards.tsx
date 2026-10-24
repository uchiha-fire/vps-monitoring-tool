import React from 'react';
import { Layers, Box, CheckCircle2, XCircle, Search } from 'lucide-react';
import { DockerOverview } from '../../../common/types/docker';

interface OverviewCardsProps {
  overview: DockerOverview;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  overview,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Stacks */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Compose Stacks</p>
            <p className="text-2xl font-bold text-white mt-1">{overview.composeStacks.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Total Containers */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Containers</p>
            <p className="text-2xl font-bold text-white mt-1">{overview.totalContainers}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Box className="w-5 h-5" />
          </div>
        </div>

        {/* Running */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400">Running</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{overview.totalRunning}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Stopped / Inactive */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Stopped / Inactive</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{overview.totalStopped}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter services by container name, image, or compose stack..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
        />
      </div>
    </div>
  );
};
