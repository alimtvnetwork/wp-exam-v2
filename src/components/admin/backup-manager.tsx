import React, { useState } from 'react';
import { Database, Download, Mail, RefreshCw, Trash2, CheckCircle2, ShieldAlert, Archive } from 'lucide-react';
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
    </div>
  );
};
