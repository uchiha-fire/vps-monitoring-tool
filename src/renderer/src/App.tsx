import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ConnectModal } from './components/ConnectModal';
import { OverviewCards } from './components/OverviewCards';
import { ComposeStackCard } from './components/ComposeStackCard';
import { ContainerRow } from './components/ContainerRow';
import { LogViewerModal } from './components/LogViewerModal';
import { ActionConfirmModal } from './components/ActionConfirmModal';
import { SshConnectionState, SshCredentials, SshProfile } from '../../common/types/ssh';
import { DockerOverview, DockerContainer, ContainerAction } from '../../common/types/docker';
import { Server, RefreshCw, Layers, Box, AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [connectionState, setConnectionState] = useState<SshConnectionState>({
    status: 'disconnected',
  });
  const [overview, setOverview] = useState<DockerOverview | null>(null);
  const [profiles, setProfiles] = useState<SshProfile[]>([]);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Selected container for logs
  const [activeLogContainer, setActiveLogContainer] = useState<DockerContainer | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    isDestructive: true,
    onConfirm: async () => {},
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProfiles = useCallback(async () => {
    if (window.electronAPI) {
      try {
        const list = await window.electronAPI.listProfiles();
        setProfiles(list);
      } catch (err) {
        console.error('Failed to load profiles:', err);
      }
    }
  }, []);

  const refreshOverview = useCallback(async () => {
    if (connectionState.status !== 'connected') return;
    setIsRefreshing(true);
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.getDockerOverview();
        setOverview(data);
      } catch (err) {
        showToast((err as Error).message || 'Failed to fetch docker overview', 'error');
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [connectionState.status]);

  // Initial connection state & listeners
  useEffect(() => {
    loadProfiles();

    if (window.electronAPI) {
      window.electronAPI.getSshState().then((state) => {
        setConnectionState(state);
      });

      const cleanupListener = window.electronAPI.onSshStateChanged((state) => {
        setConnectionState(state);
        if (state.status === 'connected') {
          refreshOverview();
        } else if (state.status === 'disconnected') {
          setOverview(null);
        }
      });

      return () => {
        cleanupListener();
      };
    }
  }, [loadProfiles]);

  // Periodic polling when connected (every 10s)
  useEffect(() => {
    if (connectionState.status !== 'connected') return;
    const interval = setInterval(() => {
      refreshOverview();
    }, 10000);
    return () => clearInterval(interval);
  }, [connectionState.status, refreshOverview]);

  const handleConnect = async (credentials: SshCredentials, saveProfileLabel?: string) => {
    setIsConnecting(true);
    setConnectError(undefined);

    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.connectSsh(credentials);
        if (!res.success) {
          setConnectError(res.error || 'Connection refused or timed out');
          setIsConnecting(false);
          return;
        }

        if (saveProfileLabel) {
          await window.electronAPI.saveProfile({
            ...credentials,
            label: saveProfileLabel,
          });
          await loadProfiles();
        }

        setIsConnectModalOpen(false);
        showToast(`Connected to ${credentials.username}@${credentials.host}`);
        await refreshOverview();
      }
    } catch (err) {
      setConnectError((err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.electronAPI) {
      await window.electronAPI.disconnectSsh();
      showToast('Disconnected from VPS');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteProfile(id);
      await loadProfiles();
      showToast('Profile deleted');
    }
  };

  const handleContainerAction = (
    containerId: string,
    action: ContainerAction,
    containerName: string
  ) => {
    const isDestructive = action === 'stop' || action === 'kill';
    setConfirmModal({
      isOpen: true,
      title: `${action.toUpperCase()} Container`,
      message: `Are you sure you want to ${action} container "${containerName}"?`,
      confirmLabel: `${action.toUpperCase()} Container`,
      isDestructive,
      onConfirm: async () => {
        if (window.electronAPI) {
          const res = await window.electronAPI.executeContainerAction({ containerId, action });
          if (res.success) {
            showToast(`Container "${containerName}" ${action} successful`);
            await refreshOverview();
          } else {
            showToast(res.error || `Failed to ${action} container`, 'error');
          }
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleStackAction = (projectName: string, action: 'start' | 'stop' | 'restart') => {
    setConfirmModal({
      isOpen: true,
      title: `${action.toUpperCase()} Compose Stack`,
      message: `Are you sure you want to ${action} all services in stack "${projectName}"?`,
      confirmLabel: `${action.toUpperCase()} Stack`,
      isDestructive: action === 'stop',
      onConfirm: async () => {
        if (window.electronAPI) {
          const res = await window.electronAPI.executeComposeAction({ projectName, action });
          if (res.success) {
            showToast(`Stack "${projectName}" ${action} successful`);
            await refreshOverview();
          } else {
            showToast(res.error || `Failed to ${action} stack`, 'error');
          }
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Filtered views based on search query
  const filteredStacks = overview?.composeStacks.filter((stack) => {
    const matchesStackName = stack.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = stack.containers.some(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.image.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesStackName || matchesService;
  }) || [];

  const filteredStandalone = overview?.standaloneContainers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.image.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-medium ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        connectionState={connectionState}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onDisconnect={handleDisconnect}
        onRefresh={refreshOverview}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {connectionState.status !== 'connected' ? (
          /* Empty / Not Connected State */
          <div className="mt-16 max-w-lg mx-auto text-center space-y-5 p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Server className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">No VPS Connected</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect to any remote Linux VPS using an SSH command or credentials to inspect,
                monitor, and stream logs from running Docker and Docker Compose services.
              </p>
            </div>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Server className="w-4 h-4" />
              Connect with SSH Command
            </button>
          </div>
        ) : overview ? (
          /* Connected: Overview & Services Explorer */
          <div className="space-y-6">
            {/* Metric counters and search */}
            <OverviewCards
              overview={overview}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Docker Compose Stacks Section */}
            {filteredStacks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Docker Compose Stacks ({filteredStacks.length})
                </div>
                <div className="space-y-3">
                  {filteredStacks.map((stack) => (
                    <ComposeStackCard
                      key={stack.name}
                      stack={stack}
                      onOpenLogs={setActiveLogContainer}
                      onContainerAction={handleContainerAction}
                      onStackAction={handleStackAction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Standalone Containers Section */}
            {filteredStandalone.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Box className="w-4 h-4 text-indigo-400" />
                  Standalone Containers ({filteredStandalone.length})
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 shadow-md divide-y divide-slate-800/40 overflow-hidden">
                  {filteredStandalone.map((container) => (
                    <ContainerRow
                      key={container.id}
                      container={container}
                      onOpenLogs={setActiveLogContainer}
                      onAction={handleContainerAction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty search results */}
            {filteredStacks.length === 0 && filteredStandalone.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No Docker services matched your search query "{searchQuery}".
              </div>
            )}
          </div>
        ) : (
          /* Loading State */
          <div className="mt-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs">Inspecting remote Docker environment...</p>
          </div>
        )}
      </main>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
        profiles={profiles}
        onDeleteProfile={handleDeleteProfile}
        isLoading={isConnecting}
        errorMessage={connectError}
      />

      {/* Real-time Log Viewer Modal */}
      <LogViewerModal
        container={activeLogContainer}
        isOpen={Boolean(activeLogContainer)}
        onClose={() => setActiveLogContainer(null)}
      />

      {/* Action Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
