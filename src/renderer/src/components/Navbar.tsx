import React from 'react';
import { Server, Power, RefreshCw, Terminal, ShieldCheck, BookOpen } from 'lucide-react';
import { SshConnectionState } from '../../../common/types/ssh';

interface NavbarProps {
  connectionState: SshConnectionState;
  onOpenConnectModal: () => void;
  onOpenGuideModal?: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  connectionState,
  onOpenConnectModal,
  onOpenGuideModal,
  onDisconnect,
  onRefresh,
  isRefreshing,
}) => {
  const isConnected = connectionState.status === 'connected';
  const isConnecting = connectionState.status === 'connecting';

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
          <Terminal className="w-5 h-5 text-indigo-100" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white">DockMon</h1>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">Agentless Docker & Compose Control</p>
        </div>
      </div>

      {/* Connection Status Pill & Actions */}
      <div className="flex items-center gap-3">
        {onOpenGuideModal && (
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/50 text-xs font-medium"
            title="SSH Connection Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">SSH Guide</span>
          </button>
        )}
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono">
              {connectionState.currentUsername}@{connectionState.currentHost}:{connectionState.currentPort}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-1" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Disconnected</span>
          </div>
        )}

        {isConnected && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50 disabled:opacity-50"
            title="Refresh Services"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        )}

        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            Disconnect
          </button>
        ) : (
          <button
            onClick={onOpenConnectModal}
            disabled={isConnecting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5" />
                Connect to VPS
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
