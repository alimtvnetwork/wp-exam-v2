import React, { useState, useEffect } from 'react';
import { Lock, Shield, KeyRound, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export const ADMIN_AUTH_KEY = 'wp_exam_admin_authenticated';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    }
    return false;
  });

  const login = (usernameInput: string, passwordInput: string): boolean => {
    const isUserValid = usernameInput.trim().toLowerCase() === 'admin';
    const isPassValid = passwordInput.trim() === 'admin';

    if (isUserValid && isPassValid) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = login(username, password);

    if (isSuccess) {
      toast.success('Admin authentication verified! Welcome back.');
      onSuccess();
      onClose();
    } else {
      setErrorMessage('Invalid credentials. Default test credentials are admin / admin.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border shadow-2xl rounded-2xl p-6">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto my-1 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            WP Exam Admin Access
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter administrative credentials to access the curriculum builder, candidate invites, and database engine.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Username</Label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="pl-9 text-xs bg-background h-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Password</Label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••"
                className="pl-9 text-xs bg-background h-9"
                required
              />
            </div>
          </div>

          {/* Test Credentials Hint */}
          <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Default Test Credentials:</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Username: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">admin</code> |
              Password: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">admin</code>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-xs font-semibold px-4">
              Enter Admin Portal &rarr;
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
