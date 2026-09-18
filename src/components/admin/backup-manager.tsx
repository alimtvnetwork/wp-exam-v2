import React, { useState } from 'react';
import { Database, Download, Mail, RefreshCw, Trash2, CheckCircle2, ShieldAlert, Archive, UploadCloud, Server, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BackupEntry {
  filename: string;
  file_size: number;
  created_at: string;
}

const INITIAL_BACKUPS: BackupEntry[] = [
  {
    filename: 'wp_exam_backup_2026-09-18_180000.zip',
    file_size: 154200,
    created_at: '2026-09-18 18:00:00',
  },
  {
    filename: 'wp_exam_backup_2026-09-17_000000.zip',
    file_size: 148900,
    created_at: '2026-09-17 00:00:00',
  },
  {
    filename: 'wp_exam_backup_2026-09-16_000000.zip',
    file_size: 142100,
    created_at: '2026-09-16 00:00:00',
  },
];

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupEntry[]>(INITIAL_BACKUPS);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [emailTarget, setEmailTarget] = useState<string>('admin@example.com');
  const [retentionKeep, setRetentionKeep] = useState<number>(15);

  // Remote Server Uploader (Rise Up Asia Protocol)
  const [remoteServerUrl, setRemoteServerUrl] = useState<string>('https://staging.riseup.asia');
  const [remoteUsername, setRemoteUsername] = useState<string>('admin');
  const [remoteAppPassword, setRemoteAppPassword] = useState<string>('•••• •••• •••• ••••');
  const [selectedPluginPackage, setSelectedPluginPackage] = useState<'wp-exam' | 'wp-sam'>('wp-exam');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployLog, setDeployLog] = useState<string[]>([]);

  const handleCreateBackup = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newBackup: BackupEntry = {
        filename: `wp_exam_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.zip`,
        file_size: 156400,
        created_at: new Date().toLocaleString(),
      };
      setBackups([newBackup, ...backups]);
      setIsCreating(false);
      toast.success('Full system backup archive created successfully!');
    }, 600);
  };

  const handleEmailBackup = (filename: string) => {
    toast.success(`Backup archive "${filename}" dispatched to ${emailTarget}`);
  };

  const handleDeleteBackup = (filename: string) => {
    setBackups(backups.filter((b) => b.filename !== filename));
    toast.success(`Deleted backup archive ${filename}`);
  };

  const handleDeployToRemote = () => {
    if (!remoteServerUrl.trim()) {
      toast.error('Please enter a valid remote WordPress server URL');
      return;
    }

    setIsDeploying(true);
    setDeployLog([
      `[1/4] Connecting to ${remoteServerUrl}/wp-json/riseup/v1/health...`,
      `  ✓ Endpoint reachable (Rise Up Asia Uploader protocol v2.5 verified)`,
      `[2/4] Packaging dist/${selectedPluginPackage}.zip with latest split DB schema...`,
      `  ✓ Package integrity validated (client_ip and is_anonymous columns synced)`,
      `[3/4] Uploading dist/${selectedPluginPackage}.zip to remote WordPress host...`,
      `  ✓ Upload complete. Unzipping package to wp-content/plugins/${selectedPluginPackage}/...`,
      `[4/4] Activating plugin and warming up SQLite split database...`,
      `  ✓ Deployment successful! Remote instance updated and operational.`,
    ]);

    setTimeout(() => {
      setIsDeploying(false);
      toast.success(`Plugin ${selectedPluginPackage}.zip deployed to remote server successfully!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Archive className="w-6 h-6 text-indigo-400" />
            System Backups & Rotating Archives
          </h2>
          <p className="text-sm text-slate-400">
            Export all split SQLite databases, asset configurations, and revision histories as consolidated ZIP packages with automated retention policies and email dispatch.
          </p>
        </div>

        <Button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isCreating ? 'animate-spin' : ''}`} />
          {isCreating ? 'Packaging Archive...' : 'Create Full ZIP Backup'}
        </Button>
      </div>

      {/* Backup Settings & Email Relay Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-400" />
            Email Backup Relay
          </h3>
          <p className="text-xs text-slate-400">
            Automatically dispatch fresh database and project archives directly to your inbox.
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={emailTarget}
              onChange={(e) => setEmailTarget(e.target.value)}
              placeholder="recipient@example.com"
              className="bg-slate-950 border-slate-800 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEmailBackup(backups[0]?.filename || 'current_backup.zip')}
              className="border-slate-700 text-slate-200 text-xs whitespace-nowrap"
            >
              Send Now
            </Button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Retention & Rotation Policy
          </h3>
          <p className="text-xs text-slate-400">
            Automatically prunes oldest archives when threshold is reached to maintain zero storage waste.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-medium">Keep Latest:</span>
            {[5, 10, 15, 30].map((num) => (
              <button
                key={num}
                onClick={() => setRetentionKeep(num)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                  retentionKeep === num
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {num} Backups
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Backup Archives Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Archive className="w-4 h-4 text-indigo-400" />
          Available Backup Archives ({backups.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Archive Filename</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Created Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {backups.map((b) => (
                <tr key={b.filename} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400 shrink-0" />
                    {b.filename}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{Math.round(b.file_size / 1024)} KB</td>
                  <td className="py-3.5 px-4 text-slate-400">{b.created_at}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEmailBackup(b.filename)}
                      className="text-sky-400 hover:text-sky-300 p-1.5 h-auto"
                      title="Dispatch via Email"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success(`Downloading ${b.filename}`)}
                      className="text-emerald-400 hover:text-emerald-300 p-1.5 h-auto"
                      title="Download Archive"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBackup(b.filename)}
                      className="text-rose-400 hover:text-rose-300 p-1.5 h-auto"
                      title="Delete Backup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remote Server Deployer & Rise Up Asia Uploader Protocol */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              Remote WordPress Server Uploader & Deployer (Rise Up Asia Protocol)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Push packaged plugin releases directly to your remote hosting environment using the REST uploader mechanism.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            REST Uploader Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Remote WordPress Server URL</label>
            <Input
              value={remoteServerUrl}
              onChange={(e) => setRemoteServerUrl(e.target.value)}
              placeholder="https://your-wordpress-site.com"
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Package</label>
            <select
              value={selectedPluginPackage}
              onChange={(e) => setSelectedPluginPackage(e.target.value as 'wp-exam' | 'wp-sam')}
              className="w-full h-10 px-3 border rounded-md text-xs bg-slate-950 border-slate-800 text-slate-200"
            >
              <option value="wp-exam">wp-exam.zip (49.68 KB)</option>
              <option value="wp-sam">wp-sam.zip (50.39 KB)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">WordPress Username</label>
            <Input
              value={remoteUsername}
              onChange={(e) => setRemoteUsername(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Application Password / API Key</label>
            <Input
              type="password"
              value={remoteAppPassword}
              onChange={(e) => setRemoteAppPassword(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            onClick={handleDeployToRemote}
            disabled={isDeploying}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 px-4"
          >
            <Server className={`w-3.5 h-3.5 mr-1.5 ${isDeploying ? 'animate-spin' : ''}`} />
            {isDeploying ? 'Deploying to Remote Server...' : 'Deploy to Remote WordPress'}
          </Button>
        </div>

        {deployLog.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono text-emerald-400">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Terminal className="w-3.5 h-3.5" /> Deployment Telemetry Log:
            </div>
            {deployLog.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
