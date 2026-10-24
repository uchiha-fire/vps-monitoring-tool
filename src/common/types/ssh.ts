export interface SshCredentials {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

export interface SshProfile extends SshCredentials {
  id: string;
  label: string;
  createdAt: string;
  lastConnectedAt?: string;
}

export type SshConnectionStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface SshConnectionState {
  status: SshConnectionStatus;
  currentHost?: string;
  currentUsername?: string;
  currentPort?: number;
  error?: string;
}
