import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';

interface TerminalViewProps {
  onRegisterSearchAddon?: (addon: SearchAddon) => void;
  streamId: string;
  isAutoScroll: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  onRegisterSearchAddon,
  streamId,
  isAutoScroll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure clean container
    container.innerHTML = '';

    const term = new Terminal({
      cursorBlink: false,
      disableStdin: true,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
      theme: {
        background: '#090d16',
        foreground: '#e2e8f0',
        cursor: '#6366f1',
        selectionBackground: '#4338ca55',
        black: '#0f172a',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#f1f5f9',
      },
      convertEol: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(searchAddon);

    term.open(container);
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    if (onRegisterSearchAddon) {
      onRegisterSearchAddon(searchAddon);
    }

    // Safely fit terminal dimensions once container has positive dimensions
    const safeFit = () => {
      try {
        if (container && container.clientWidth > 0 && container.clientHeight > 0 && termRef.current) {
          fitAddon.fit();
        }
      } catch {
        // Ignore fit calculation during modal transitions
      }
    };

    // Defer initial fit until the DOM layout is ready
    const rafId = requestAnimationFrame(() => {
      safeFit();
    });

    const resizeObserver = new ResizeObserver(() => {
      safeFit();
    });
    resizeObserver.observe(container);

    term.writeln('\x1b[90m--- Log stream connected. Awaiting stdout/stderr chunks... ---\x1b[0m');

    // Subscribe to IPC log stream chunks
    let cleanupLogListener: (() => void) | undefined;
    if (window.electronAPI && window.electronAPI.onLogData) {
      cleanupLogListener = window.electronAPI.onLogData((data) => {
        if (data.streamId === streamId && termRef.current) {
          termRef.current.write(data.chunk);
          if (isAutoScroll) {
            termRef.current.scrollToBottom();
          }
        }
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (cleanupLogListener) cleanupLogListener();
      try {
        term.dispose();
      } catch {
        // Ignore dispose error on unmount
      }
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [streamId]);

  // Keep scrolled to bottom if isAutoScroll changes to true
  useEffect(() => {
    if (isAutoScroll && termRef.current) {
      termRef.current.scrollToBottom();
    }
  }, [isAutoScroll]);

  return <div ref={containerRef} className="w-full h-full overflow-hidden" />;
};
