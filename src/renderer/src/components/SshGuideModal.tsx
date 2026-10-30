import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Terminal,
  Key,
  HelpCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface SshGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal?: () => void;
}

export const SshGuideModal: React.FC<SshGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenConnectModal,
}) => {
  const [activeTab, setActiveTab] = useState<'examples' | 'keys' | 'troubleshooting'>('examples');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleOpenConnect = () => {
    onClose();
    if (onOpenConnectModal) {
      onOpenConnectModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">SSH Connection Guide</h2>
              <p className="text-xs text-slate-400">Everything you need to connect to your remote VPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex gap-2 border-b border-slate-800/80 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'examples'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Command Examples
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'keys'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            SSH Keys
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('troubleshooting')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'troubleshooting'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Troubleshooting
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-xs leading-relaxed flex-1">
          {/* TAB 1: Command Examples */}
          {activeTab === 'examples' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Paste Any OpenSSH Command</h3>
                <p className="text-slate-400">
                  DockMon automatically parses standard terminal SSH commands into host, port, username, and key parameters.
                </p>
              </div>

              {/* Basic Command */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">1. Standard Connection</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ssh root@example.com', 'basic')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {copiedSnippet === 'basic' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSnippet === 'basic' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                  ssh root@example.com
                </pre>
                <p className="text-[11px] text-slate-400">
                  Connects to <code className="text-slate-300">example.com</code> on standard port 22 as user <code className="text-slate-300">root</code>.
                </p>
              </div>

              {/* Custom Port */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">2. Custom Port (-p)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ssh -p 2222 admin@example.com', 'port')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {copiedSnippet === 'port' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSnippet === 'port' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                  ssh -p 2222 admin@example.com
                </pre>
                <p className="text-[11px] text-slate-400">
                  Both separated flags (<code className="text-slate-300">-p 2222</code>) and attached flags (<code className="text-slate-300">-p2222</code>) are supported.
                </p>
              </div>

              {/* Identity Key */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">3. Private Key Identity (-i)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ssh -i ~/.ssh/id_ed25519_sample user@example.com', 'key')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {copiedSnippet === 'key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSnippet === 'key' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                  ssh -i ~/.ssh/id_ed25519_sample user@example.com
                </pre>
                <p className="text-[11px] text-slate-400">
                  Tilde (<code className="text-slate-300">~</code>) is automatically resolved to your OS user home directory. When a key is detected, remote password is not required.
                </p>
              </div>

              {/* Port Forwarding & Multi-Line Flags */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">4. Port Forwarding & Flags (-L, -R, line continuations)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ssh -i ~/.ssh/id_ed25519_sample -p 448 \\\n    -L 4000:localhost:4000 \\\n    -L 8085:localhost:8085 \\\n    admin@example.com', 'multiline')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {copiedSnippet === 'multiline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSnippet === 'multiline' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto whitespace-pre">
{`ssh -i ~/.ssh/id_ed25519_sample -p 448 \\
    -L 4000:localhost:4000 \\
    -L 8085:localhost:8085 \\
    admin@example.com`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  Paste multi-line script commands directly. DockMon gracefully cleans backslashes (<code className="text-slate-300">\</code>) and ignores local port forwarding tunnels while preserving target credentials.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SSH Keys */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Finding & Generating Keys</h3>
                <p className="text-slate-400">
                  SSH keys provide cryptographic authentication without transmitting passwords over the network.
                </p>
              </div>

              {/* Standard Locations */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <span className="font-semibold text-slate-200">Default Key Locations on Disk</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Linux / macOS:</span>
                    <span className="text-emerald-300">~/.ssh/id_ed25519 or ~/.ssh/id_rsa</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Windows:</span>
                    <span className="text-emerald-300">C:\Users\&lt;username&gt;\.ssh\id_ed25519</span>
                  </div>
                </div>
              </div>

              {/* Generating Keys */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Generate an Ed25519 Key Pair</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ssh-keygen -t ed25519 -C "admin@example.com"', 'keygen')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {copiedSnippet === 'keygen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSnippet === 'keygen' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                  ssh-keygen -t ed25519 -C "admin@example.com"
                </pre>
                <p className="text-[11px] text-slate-400">
                  Generates an Ed25519 private key (<code className="text-slate-300">~/.ssh/id_ed25519</code>) and public key (<code className="text-slate-300">~/.ssh/id_ed25519.pub</code>).
                </p>
              </div>

              {/* Copying Key to VPS */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Copy Public Key to Remote VPS</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('ssh-copy-id -i ~/.ssh/id_ed25519.pub user@example.com', 'copyid')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    {copiedSnippet === 'copyid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSnippet === 'copyid' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                  ssh-copy-id -i ~/.ssh/id_ed25519.pub user@example.com
                </pre>
                <p className="text-[11px] text-slate-400">
                  Appends your public key to the remote server's <code className="text-slate-300">~/.ssh/authorized_keys</code> automatically.
                </p>
              </div>

              {/* Permissions Tip */}
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Private Key Permissions</p>
                  <p className="text-indigo-200/80 mt-0.5">
                    SSH requires strict private key file permissions. If using Linux or macOS, run <code className="font-mono text-white">chmod 600 ~/.ssh/id_ed25519</code> if you see permission errors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Troubleshooting */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Common Connection Issues</h3>
                <p className="text-slate-400">
                  Diagnostic steps when a remote connection cannot be established.
                </p>
              </div>

              {/* Permission denied (publickey) */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Permission denied (publickey)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pl-1">
                  <li>Verify your public key is added to <code className="text-slate-300">~/.ssh/authorized_keys</code> on the remote server.</li>
                  <li>Check server permissions: <code className="text-slate-300">chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys</code>.</li>
                  <li>If your private key is protected by a passphrase, enter the passphrase in Step 2 of the Connect Wizard.</li>
                </ul>
              </div>

              {/* Connection timed out / refused */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Connection timed out or refused</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pl-1">
                  <li>Verify the remote IP address or domain is online and reachable.</li>
                  <li>Check your VPS cloud firewall / security group (e.g. AWS Security Group, DigitalOcean Firewall, Hetzner Firewall) allows inbound traffic on port 22 (or your custom port).</li>
                  <li>Check UFW on your server: <code className="text-slate-300">sudo ufw status</code> and <code className="text-slate-300">sudo ufw allow 22/tcp</code>.</li>
                </ul>
              </div>

              {/* Password vs Key */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Why is password not required when using an SSH key?</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  When you specify a private key with <code className="text-slate-300">-i</code>, OpenSSH uses public key cryptography to authenticate directly. Many cloud VPS providers disable password authentication entirely (<code className="text-slate-300">PasswordAuthentication no</code>) for safety.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Guide"
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Close Guide
          </button>
          <button
            type="button"
            onClick={handleOpenConnect}
            aria-label="Open Connect Modal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Open Connect Modal <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
