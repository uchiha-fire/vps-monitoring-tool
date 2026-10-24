import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon, Search, ArrowUp, ArrowDown, Pin, PinOff, RefreshCw } from 'lucide-react';
import { DockerContainer } from '../../../common/types/docker';
import { TerminalView } from './TerminalView';
import { SearchAddon } from '@xterm/addon-search';

interface LogViewerModalProps {
  container: DockerContainer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewerModal: React.FC<LogViewerModalProps> = ({
  container,
  isOpen,
  onClose,
}) => {
  const [streamId, setStreamId] = useState<string | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [tailLines, setTailLines] = useState(250);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const searchAddonRef = useRef<SearchAddon | null>(null);

  useEffect(() => {
    if (!isOpen || !container) {
      if (streamId && window.electronAPI) {
        window.electronAPI.stopLogStream({ streamId });
      }
      setStreamId(null);
      return;
    }

    let activeStream: string | null = null;
    setIsConnecting(true);

    if (window.electronAPI) {
      window.electronAPI
        .startLogStream({
          containerId: container.id,
          tailLines,
        })
        .then((res) => {
          setStreamId(res.streamId);
          activeStream = res.streamId;
          setIsConnecting(false);
        })
        .catch((err) => {
          console.error('Failed to start log stream:', err);
          setIsConnecting(false);
        });
    }

    return () => {
      if (activeStream && window.electronAPI) {
        window.electronAPI.stopLogStream({ streamId: activeStream });
      }
    };
  }, [isOpen, container?.id, tailLines]);

  if (!isOpen || !container) return null;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchAddonRef.current) {
      searchAddonRef.current.findNext(query, { regex: false, caseSensitive: false });
    }
  };

  const handleFindNext = () => {
    if (searchAddonRef.current && searchQuery) {
      searchAddonRef.current.findNext(searchQuery);
    }
  };

  const handleFindPrevious = () => {
    if (searchAddonRef.current && searchQuery) {
      searchAddonRef.current.findPrevious(searchQuery);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <TerminalIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white truncate font-mono">
                  {container.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {container.image}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Container ID: {container.id.substring(0, 12)} • {container.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Streaming
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              title="Close Log Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
          {/* Search Box */}
          <div className="flex items-center gap-1.5 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Find in logs..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={handleFindPrevious}
              disabled={!searchQuery}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-40 transition-colors"
              title="Previous match"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFindNext}
              disabled={!searchQuery}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-40 transition-colors"
              title="Next match"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Actions & Settings */}
          <div className="flex items-center gap-2">
            {/* Tail lines selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Tail:</span>
              <select
                value={tailLines}
                onChange={(e) => setTailLines(parseInt(e.target.value, 10))}
                className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            {/* Auto-scroll toggle */}
            <button
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isAutoScroll
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isAutoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is PAUSED'}
            >
              {isAutoScroll ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
              {isAutoScroll ? 'Follow Logs' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="flex-1 bg-[#090d16] p-3 relative overflow-hidden">
          {isConnecting && (
            <div className="absolute inset-0 bg-slate-950/80 z-20 flex items-center justify-center gap-2 text-xs text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Opening remote SSH log stream...
            </div>
          )}
          {streamId && (
            <TerminalView
              streamId={streamId}
              isAutoScroll={isAutoScroll}
              onRegisterSearchAddon={(addon) => {
                searchAddonRef.current = addon;
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
