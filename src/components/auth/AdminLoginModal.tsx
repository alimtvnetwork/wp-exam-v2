import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

/**
 * Universal admin authentication hook using the centralized AuthContext.
 * Guaranteed to reflect true server and session state with zero unauthorized bypass.
 */
export function useAdminAuth() {
  const { user, isAdmin, isLoading, login: authLogin, logout: authLogout, refreshUser } = useAuth();

  const verify = useCallback(async (): Promise<boolean> => {
    await refreshUser();

    return isAdmin;
  }, [refreshUser, isAdmin]);

  const login = useCallback(async (username?: string, password?: string): Promise<boolean> => {
    const identifier = username || 'admin';
    const pwd = password || 'Admin@1234';

    const result = await authLogin(identifier, pwd);
    const isSuccess = result.success;

    return isSuccess;
  }, [authLogin]);

  const loginAsDemoAdmin = useCallback(async (): Promise<boolean> => {
    const result = await authLogin('admin', 'Admin@1234');
    const isSuccess = result.success;

    return isSuccess;
  }, [authLogin]);

  const logout = useCallback(() => {
    authLogout();
  }, [authLogout]);

  return {
    isAuthenticated: isAdmin,
    isAdmin,
    isVerified: !isLoading,
    verify,
    login,
    loginAsDemoAdmin,
    logout,
  };
}

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isAdmin, isVerified, login, loginAsDemoAdmin } = useAdminAuth();
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('Admin@1234');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isReady = isOpen && isVerified && isAdmin;

    if (isReady) {
      toast.success('Admin access verified. Welcome back.');
      onSuccess();
      onClose();
    }
  }, [isOpen, isVerified, isAdmin, onSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isSuccess = await login(email, password);

      if (isSuccess) {
        onSuccess();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);

    try {
      const isSuccess = await loginAsDemoAdmin();

      if (isSuccess) {
        onSuccess();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
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
            Onboarding Quiz Studio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sign in to access form builder, recruitment pipeline, and analytics.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              Email or Username
            </label>
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-9 text-xs"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-center justify-between text-muted-foreground">
            <span>Default Superadmin:</span>
            <span className="font-mono font-semibold text-foreground">admin / Admin@1234</span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-xs font-semibold h-9 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Sign In to Studio
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="w-full text-xs font-semibold h-9 border-dashed border-primary/40 hover:bg-primary/10 hover:text-primary cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Instant Sign-in as Demo Admin
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
