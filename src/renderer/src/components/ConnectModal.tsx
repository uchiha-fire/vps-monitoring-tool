import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Key,
  Eye,
  EyeOff,
  Bookmark,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { SshCredentials, SshProfile } from '../../../common/types/ssh';
import { parseSshCommand } from '../../../../src/main/ssh/SshConfigParser';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials: SshCredentials, saveProfileLabel?: string) => Promise<void>;
  profiles: SshProfile[];
  onDeleteProfile: (id: string) => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  profiles,
  onDeleteProfile,
  isLoading,
  errorMessage,
}) => {
  const [step, setStep] = useState<'input' | 'auth'>('input');
  const [tab, setTab] = useState<'command' | 'manual'>('command');
  const [sshCommand, setSshCommand] = useState('ssh root@192.168.1.100');
  const [host, setHost] = useState('192.168.1.100');
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [saveProfile, setSaveProfile] = useState(false);
  const [profileLabel, setProfileLabel] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<{ exists?: boolean; isRaw?: boolean } | null>(null);

  // Sync command changes to parsed preview
  useEffect(() => {
    if (tab === 'command' && sshCommand.trim()) {
      try {
        const parsed = parseSshCommand(sshCommand);
        setHost(parsed.host);
        setPort(parsed.port);
        setUsername(parsed.username);
        if (parsed.privateKey) {
          setPrivateKey(parsed.privateKey);
          setAuthMethod('key');
        } else {
          setPrivateKey('');
          setAuthMethod('password');
        }
        setParseError(null);
      } catch (err) {
        setParseError((err as Error).message);
      }
    }
  }, [sshCommand, tab]);

  // Check key on disk if available via electron API
  useEffect(() => {
    let isMounted = true;
    if (privateKey && window.electronAPI?.checkPrivateKey) {
      window.electronAPI.checkPrivateKey(privateKey).then((res) => {
        if (isMounted) setKeyStatus(res);
      }).catch(() => {
        if (isMounted) setKeyStatus(null);
      });
    } else {
      setKeyStatus(null);
    }
    return () => {
      isMounted = false;
    };
  }, [privateKey]);

  // Reset step on modal open/close
  useEffect(() => {
    if (!isOpen) {
      setStep('input');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProfile = (p: SshProfile) => {
    setHost(p.host);
    setPort(p.port);
    setUsername(p.username);
    if (p.password) setPassword(p.password);
    if (p.privateKey) {
      setPrivateKey(p.privateKey);
      setAuthMethod('key');
    } else {
      setAuthMethod('password');
    }
    if (p.passphrase) setPassphrase(p.passphrase);
    setSshCommand(p.port !== 22 ? `ssh -p ${p.port} ${p.username}@${p.host}` : `ssh ${p.username}@${p.host}`);
    setProfileLabel(p.label);
  };

  const getTargetCredentials = (): SshCredentials => {
    let targetCreds: SshCredentials;
    if (tab === 'command') {
      targetCreds = parseSshCommand(sshCommand);
    } else {
      if (!host || !username) {
        throw new Error('Host and Username are required');
      }
      targetCreds = { host, port, username };
    }

    if (privateKey) {
      targetCreds.privateKey = privateKey;
      if (passphrase) {
        targetCreds.passphrase = passphrase;
      }
    } else if (password) {
      targetCreds.password = password;
    }

    return targetCreds;
  };

  const handleDirectConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const creds = getTargetCredentials();
      await onConnect(creds, saveProfile ? profileLabel || `${creds.username}@${creds.host}` : undefined);
    } catch (err) {
      setParseError((err as Error).message);
    }
  };

  const handleProceedToAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tab === 'command') {
      try {
        parseSshCommand(sshCommand);
        setStep('auth');
      } catch (err) {
        setParseError((err as Error).message);
      }
    } else {
      if (!host || !username) {
        setParseError('Host and Username are required');
        return;
      }
      setStep('auth');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Connect to Remote VPS</h2>
              <p className="text-xs text-slate-400">Multi-step VPS SSH Connection Wizard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                step === 'input'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 cursor-pointer'
              }`}
              onClick={() => setStep('input')}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-600/40 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Step 1: SSH Destination</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                step === 'auth'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Step 2: Authentication</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {step === 'input' ? 'Destination & Flags' : 'Credentials & Keys'}
          </span>
        </div>

        {/* Saved Profiles Quick Bar */}
        {profiles.length > 0 && (
          <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium whitespace-nowrap">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" /> Bookmarks:
            </span>
            {profiles.map((p) => (
              <div
                key={p.id}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-slate-700/60 text-slate-300 transition-all cursor-pointer whitespace-nowrap"
                onClick={() => handleSelectProfile(p)}
              >
                <span>{p.label || `${p.username}@${p.host}`}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProfile(p.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Destination (Command or Manual) */}
        {step === 'input' && (
          <div className="flex flex-col">
            {/* Tab Switcher */}
            <div className="px-6 pt-4 flex gap-2 border-b border-slate-800/60 pb-3">
              <button
                type="button"
                onClick={() => setTab('command')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  tab === 'command'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Raw Command
              </button>
              <button
                type="button"
                onClick={() => setTab('manual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  tab === 'manual'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Manual Fields
              </button>
            </div>

            <form onSubmit={privateKey ? handleDirectConnect : handleDirectConnect} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Connection Failed</p>
                    <p className="text-rose-300/80 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {tab === 'command' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">
                      SSH Command
                    </label>
                    <span className="text-[11px] text-slate-500">Supports multi-line & flags (-i, -p, -L)</span>
                  </div>
                  <textarea
                    rows={3}
                    value={sshCommand}
                    onChange={(e) => setSshCommand(e.target.value)}
                    placeholder="ssh -i ~/.ssh/id_ed25519 -p 22 root@192.168.1.100"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                  />
                  {parseError ? (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {parseError}
                    </p>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
                      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                        <span>Host: <b className="text-slate-200">{host || '...'}</b></span>
                        <span>Port: <b className="text-slate-200">{port}</b></span>
                        <span>User: <b className="text-slate-200">{username || '...'}</b></span>
                      </div>
                      {privateKey ? (
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                            <Key className="w-3.5 h-3.5 text-emerald-400" />
                            Key: <span className="text-emerald-300">{privateKey}</span>
                          </span>
                          {keyStatus && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {keyStatus.exists ? 'Found on Disk 🟢' : 'File Not Found 🔴'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span>No private key in command. You can enter password in Step 2 or connect now.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-4 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Host IP / Domain</label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="192.168.1.100 or vps.example.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Port</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(parseInt(e.target.value, 10) || 22)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-6 space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">SSH Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="root or ubuntu"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 1 Actions */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  {privateKey ? (
                    <>
                      <button
                        type="button"
                        onClick={handleProceedToAuth}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                      >
                        Options / Passphrase &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectConnect()}
                        disabled={isLoading || Boolean(parseError)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isLoading ? 'Connecting...' : 'Connect Now'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDirectConnect()}
                        disabled={isLoading || Boolean(parseError)}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                      >
                        Connect
                      </button>
                      <button
                        type="button"
                        onClick={handleProceedToAuth}
                        disabled={Boolean(parseError)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Next: Authentication <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Authentication & Options */}
        {step === 'auth' && (
          <form onSubmit={handleDirectConnect} className="p-6 space-y-4">
            {/* Target Destination Summary Card */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Target Host: </span>
                <span className="font-mono text-slate-200 font-semibold">{username}@{host}:{port}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
              >
                Edit Destination
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Connection Failed</p>
                  <p className="text-rose-300/80 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* When Key is detected/specified */}
            {privateKey ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-emerald-400" /> Private Key Authentication
                    </label>
                    {keyStatus && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {keyStatus.exists ? 'Found on Disk 🟢' : 'File Not Found 🔴'}
                      </span>
                    )}
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-xs font-mono text-emerald-300 break-all select-all">
                    {privateKey}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Password is not required when authenticating with a private key.
                  </p>
                </div>

                {/* Passphrase Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">Key Passphrase</label>
                    <span className="text-[11px] text-slate-500">(Optional - only if encrypted)</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassphrase ? 'text' : 'password'}
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Enter passphrase if key is encrypted..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPrivateKey('');
                      setAuthMethod('password');
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-300 underline"
                  >
                    Use password authentication instead
                  </button>
                </div>
              </div>
            ) : (
              /* When No Key in Command: Choose Password vs Key */
              <div className="space-y-3">
                <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      authMethod === 'password'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('key')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      authMethod === 'key'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Private Key
                  </button>
                </div>

                {authMethod === 'password' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">SSH Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-400" /> Private Key Path or PEM
                      </label>
                      <input
                        type="text"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        placeholder="~/.ssh/id_rsa or /home/user/.ssh/vps.pem"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Key Passphrase (optional)</label>
                      <input
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter passphrase if key is encrypted..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Save Profile Checkbox */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={saveProfile}
                  onChange={(e) => setSaveProfile(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                Save this VPS connection as a bookmark
              </label>

              {saveProfile && (
                <input
                  type="text"
                  value={profileLabel}
                  onChange={(e) => setProfileLabel(e.target.value)}
                  placeholder="Bookmark label (e.g. Production Staging, EU Cluster)"
                  className="w-full px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            {/* Step 2 Actions */}
            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>Connecting...</>
                ) : (
                  <>
                    Connect to VPS <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
