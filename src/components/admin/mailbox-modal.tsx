import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Server, CheckCircle2, ChevronDown, ShieldCheck, Activity } from 'lucide-react';

export interface MailboxConfig {
  email: string;
  pass: string;
  alias: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: 'ssl' | 'tls' | 'none';
  imapHost: string;
  imapPort: number;
}

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MailboxConfig) => void;
  initialConfig?: Partial<MailboxConfig>;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [email, setEmail] = useState(initialConfig?.email || 'ai-agm-tool-v1@hire-seoexperts.com');
  const [alias, setAlias] = useState(initialConfig?.alias || 'ai-agm-tool-v1 (hire-seoexperts.com)');
  const [pass, setPass] = useState(initialConfig?.pass || '');
  const [smtpHost, setSmtpHost] = useState(initialConfig?.smtpHost || 'mail.hire-seoexperts.com');
  const [smtpPort, setSmtpPort] = useState(initialConfig?.smtpPort || 465);
  const [smtpSecure, setSmtpSecure] = useState<'ssl' | 'tls' | 'none'>(initialConfig?.smtpSecure || 'ssl');
  const [imapHost, setImapHost] = useState(initialConfig?.imapHost || 'mail.hire-seoexperts.com');
  const [imapPort, setImapPort] = useState(initialConfig?.imapPort || 993);
  const [isAutoConfigured, setIsAutoConfigured] = useState(true);

  // Live test verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    isSuccess: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.email) setEmail(initialConfig.email);
      if (initialConfig.alias) setAlias(initialConfig.alias);
      if (initialConfig.pass) setPass(initialConfig.pass);
      if (initialConfig.smtpHost) setSmtpHost(initialConfig.smtpHost);
      if (initialConfig.smtpPort) setSmtpPort(initialConfig.smtpPort);
      if (initialConfig.smtpSecure) setSmtpSecure(initialConfig.smtpSecure);
      if (initialConfig.imapHost) setImapHost(initialConfig.imapHost);
      if (initialConfig.imapPort) setImapPort(initialConfig.imapPort);
    }
  }, [initialConfig]);

  // Real-time domain detection and auto-configuration (AGM Engine)
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    const trimmed = newEmail.trim();
    const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (isFormatValid) {
      const parts = trimmed.split('@');
      const user = parts[0];
      const domain = parts[1].toLowerCase();

      setAlias(`${user} (${domain})`);

      if (domain.includes('gmail.com') || domain.includes('google.com')) {
        setSmtpHost('smtp.gmail.com');
        setSmtpPort(587);
        setSmtpSecure('tls');
        setImapHost('imap.gmail.com');
        setImapPort(993);
      } else if (domain.includes('office365.com') || domain.includes('outlook.com')) {
        setSmtpHost('smtp.office365.com');
        setSmtpPort(587);
        setSmtpSecure('tls');
        setImapHost('outlook.office365.com');
        setImapPort(993);
      } else if (domain.includes('zoho.com')) {
        setSmtpHost('smtppro.zoho.com');
        setSmtpPort(465);
        setSmtpSecure('ssl');
        setImapHost('imappro.zoho.com');
        setImapPort(993);
      } else {
        // Custom domain auto-forwarding standard
        setSmtpHost(`mail.${domain}`);
        setSmtpPort(465);
        setSmtpSecure('ssl');
        setImapHost(`mail.${domain}`);
        setImapPort(993);
      }

      setIsAutoConfigured(true);
    } else {
      setIsAutoConfigured(false);
    }
  };

  const handleSmtpPreset = (port: number, secure: 'ssl' | 'tls' | 'none') => {
    setSmtpPort(port);
    setSmtpSecure(secure);
  };

  const handleImapPreset = (port: number) => {
    setImapPort(port);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const response = await fetch('/api/v1/email/verify-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          type: 'smtp',
          user: email,
          pass: pass,
        }),
      });

      const json = await response.json();
      const isSuccess = Boolean(json.is_success);

      setVerifyResult({
        isSuccess,
        message: json.message || (isSuccess ? 'Connection verified!' : 'Connection test failed'),
        latencyMs: json.data?.latency_ms,
      });
    } catch {
      setVerifyResult({
        isSuccess: false,
        message: 'Could not connect to verification endpoint. Verify backend is running on port 8080.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      email,
      alias,
      pass,
      smtpHost,
      smtpPort,
      smtpSecure,
      imapHost,
      imapPort,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl text-slate-100 overflow-hidden my-6 animate-in fade-in duration-150">
        {/* Header Icon & Title */}
        <div className="p-6 pb-2 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 text-blue-400">
            <Server className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Edit Mailbox Configuration</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {/* Email Address with Dropdown Icon */}
          <div className="space-y-1.5">
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="bg-slate-950/80 border-slate-800 text-slate-100 text-sm h-10 pr-9 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="user@domain.com"
                required
              />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {isAutoConfigured && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Valid email detected. Host and port settings auto-configured.</span>
              </div>
            )}
          </div>

          {/* Account Alias */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Account Alias</Label>
            <Input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="bg-slate-950/80 border-slate-800 text-slate-100 text-sm h-10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="alias (domain.com)"
            />
          </div>

          {/* Password / App Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">
              Password / App Password <span className="text-slate-400 font-normal">(Leave blank to keep existing)</span>
            </Label>
            <div className="relative">
              <Input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="bg-slate-950/80 border-slate-800 text-slate-100 text-sm h-10 pr-9 rounded-xl font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••••••"
              />
              <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
              Stored in isolated split database <code className="text-slate-300 font-mono">email_passwords.db</code> with salted SSH RSA identity and machine-bound encryption.
            </p>
          </div>

          {/* Outgoing Server (SMTP Host) and Port */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Outgoing Server (SMTP Host)</Label>
                <Input
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-slate-100 text-sm h-10 font-mono rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">SMTP Port</Label>
                <Input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="bg-slate-950/80 border-slate-800 text-slate-100 text-sm h-10 font-mono rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* SMTP Presets */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-slate-400">Presets:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSmtpPreset(465, 'ssl')}
                  className={`px-3 py-1 rounded-md text-xs transition ${
                    smtpPort === 465 && smtpSecure === 'ssl'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  465 (SSL)
                </button>
                <button
                  type="button"
                  onClick={() => handleSmtpPreset(587, 'tls')}
                  className={`px-3 py-1 rounded-md text-xs transition ${
                    smtpPort === 587 && smtpSecure === 'tls'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  587 (TLS)
                </button>
                <button
                  type="button"
                  onClick={() => handleSmtpPreset(25, 'none')}
                  className={`px-3 py-1 rounded-md text-xs transition ${
                    smtpPort === 25 && smtpSecure === 'none'
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  25 (Plain)
                </button>
              </div>
            </div>
          </div>

          {/* Incoming Server (IMAP Host) and Port */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-slate-300">Incoming Server (IMAP Host)</Label>
                <Input
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-slate-100 text-sm h-10 font-mono rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-300">IMAP Port</Label>
                <Input
                  type="number"
                  value={imapPort}
                  onChange={(e) => setImapPort(Number(e.target.value))}
                  className="bg-slate-950/80 border-slate-800 text-slate-100 text-sm h-10 font-mono rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* IMAP Presets */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-slate-400">Presets:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleImapPreset(993)}
                  className={`px-3 py-1 rounded-md text-xs transition ${
                    imapPort === 993
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  993 (IMAP SSL)
                </button>
                <button
                  type="button"
                  onClick={() => handleImapPreset(143)}
                  className={`px-3 py-1 rounded-md text-xs transition ${
                    imapPort === 143
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  143 (IMAP)
                </button>
                <button
                  type="button"
                  onClick={() => handleImapPreset(995)}
                  className={`px-3 py-1 rounded-md text-xs transition ${
                    imapPort === 995
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  995 (POP3)
                </button>
              </div>
            </div>
          </div>

          {/* Encryption Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Encryption Type</Label>
            <select
              value={smtpSecure}
              onChange={(e) => setSmtpSecure(e.target.value as 'ssl' | 'tls' | 'none')}
              className="w-full h-10 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 font-sans focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ssl">SSL / TLS (Recommended for Custom Domain)</option>
              <option value="tls">STARTTLS (Standard Modern Port 587)</option>
              <option value="none">Plain / Unencrypted (Port 25)</option>
            </select>
          </div>

          {/* Live Verify Status */}
          {verifyResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                verifyResult.isSuccess
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{verifyResult.message}</span>
              {verifyResult.latencyMs !== undefined && (
                <span className="font-mono text-xs bg-slate-900/60 px-2 py-0.5 rounded">
                  {verifyResult.latencyMs}ms
                </span>
              )}
            </div>
          )}

          {/* Verification Ping & Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={isVerifying}
              className="text-xs h-9 gap-1.5 bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>{isVerifying ? 'Testing...' : 'Test Connection'}</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs h-9 px-4 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-9 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25"
              >
                Save Mailbox
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
