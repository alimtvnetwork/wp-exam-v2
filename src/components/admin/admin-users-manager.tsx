import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  Mail,
  Lock,
  User,
  Phone,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Key,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { unifiedFetch } from '@/utils/api-client';

export interface AdminAccount {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  phone?: string;
  is_active: number;
  created_at: string;
}

export const AdminUsersManager: React.FC = () => {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Admin Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = async () => {
    setIsLoading(true);

    try {
      const res = await unifiedFetch('/api/v1/admin/users', '/wp-json/wp-exam/v1/admin/users');
      const isSuccess = res.ok;

      if (isSuccess) {
        const json = await res.json();
        const list = json?.data ?? json;

        if (Array.isArray(list)) {
          setAdmins(list);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await unifiedFetch('/api/v1/admin/users', '/wp-json/wp-exam/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          phone: newPhone,
        }),
      });

      const json = await res.json();
      const isSuccess = res.ok && (json.is_success ?? (json.status === 'success'));

      if (isSuccess) {
        toast.success(`Administrator ${newName} created successfully`);
        setIsAddDialogOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewPhone('');
        fetchAdmins();
      } else {
        toast.error(json.message || 'Failed to create administrator');
      }
    } catch {
      toast.error('Network error creating administrator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: number, name: string) => {
    if (id === 1) {
      toast.error('The primary default administrator account cannot be deleted');

      return;
    }

    try {
      const res = await unifiedFetch(`/api/v1/admin/users/${id}`, `/wp-json/wp-exam/v1/admin/users/${id}`, {
        method: 'DELETE',
      });

      const isSuccess = res.ok;

      if (isSuccess) {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
        toast.success(`Removed administrator: ${name}`);
      } else {
        toast.error('Could not delete administrator');
      }
    } catch {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Removed administrator: ${name}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-heading text-foreground">Administrator Accounts &amp; Roles</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage system administrators, grant studio access, and configure administrative roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdmins}
            disabled={isLoading}
            className="text-xs h-9 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="text-xs h-9 font-semibold cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add Administrator
          </Button>
        </div>
      </div>

      {/* Default Superadmin Credentials Banner */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Key className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-foreground">Default Superadmin Credentials: </span>
            <span className="font-mono bg-background/80 px-2 py-0.5 rounded border border-border text-foreground ml-1">admin</span>
            <span className="text-muted-foreground mx-1.5">/</span>
            <span className="font-mono bg-background/80 px-2 py-0.5 rounded border border-border text-foreground">Admin@1234</span>
          </div>
        </div>
        <Badge variant="secondary" className="text-2xs font-mono">
          Immutable Superadmin ID: #1
        </Badge>
      </div>

      {/* Admin Users Table Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Active Administrators ({admins.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Users with full permissions to author quizzes, manage applicants, and configure settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Administrator</th>
                  <th className="py-2.5 px-3">Username / Handle</th>
                  <th className="py-2.5 px-3">Role &amp; Status</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {admins.map((adm) => {
                  const isSuperadmin = adm.id === 1;

                  return (
                    <tr key={adm.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {adm.name}
                          {isSuperadmin ? (
                            <Badge variant="default" className="text-3xs py-0 px-1.5 h-4 bg-primary text-primary-foreground font-bold">
                              Superadmin
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground text-2xs">{adm.email}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-muted-foreground text-xs">
                        @{adm.username || adm.email.split('@')[0]}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-2xs border-primary/40 text-primary capitalize font-medium">
                            {adm.role}
                          </Badge>
                          <span className="flex items-center gap-1 text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Active
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground text-2xs">
                        {adm.created_at || 'Primary System'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isSuperadmin ? (
                          <span className="text-muted-foreground text-2xs italic">Protected</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Remove Administrator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Administrator Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground border-border shadow-2xl rounded-2xl p-6">
          <DialogHeader className="pb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
              <UserPlus className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Add New Administrator
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create an administrative user with full access to the Onboarding Quiz console.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAdmin} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Full Name
              </label>
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Sarah Jenkins"
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email Address
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="sarah.jenkins@company.com"
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Initial Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs h-9 font-semibold cursor-pointer"
              >
                {isSubmitting ? 'Creating…' : 'Create Administrator'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
