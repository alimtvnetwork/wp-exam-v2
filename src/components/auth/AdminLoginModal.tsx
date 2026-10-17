import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const ADMIN_STATUS_ENDPOINT = '/wp-json/wp-exam/v1/auth/admin-status';

interface AdminStatusResponse {
  Results?: { is_admin?: boolean };
  is_admin?: boolean;
}

async function fetchAdminStatus(): Promise<boolean> {
  const response = await fetch(ADMIN_STATUS_ENDPOINT, { credentials: 'same-origin' });
  const payload = (await response.json()) as AdminStatusResponse;
  const nestedFlag = Boolean(payload?.Results?.is_admin);
  const flatFlag = Boolean(payload?.is_admin);

  return nestedFlag || flatFlag;
}

/**
 * WordPress-delegated admin auth.
 *
 * There is no credential form and no client-side secret here by design: the
 * browser asks the server whether the current WordPress session belongs to
 * an administrator (`current_user_can('manage_options')`). See
 * 02-spec/21-app/ui-ux-improvement-for-wp-exam/07-security-hardening-spec.md
 * ("For future AI") for why a plugin-owned login form was deleted.
 */
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const verify = useCallback(async (): Promise<boolean> => {
    setIsVerified(false);

    try {
      const isAdminNow = await fetchAdminStatus();
      setIsAdmin(isAdminNow);
      setIsVerified(true);

      return isAdminNow;
    } catch {
      setIsAdmin(false);
      setIsVerified(true);

      return false;
    }
  }, []);

  useEffect(() => {
    verify();
  }, [verify]);

  const logout = useCallback(() => {
    // Authentication lives in the WordPress session now; the only honest
    // logout is WordPress's own.
    window.location.href = '/wp-login.php?action=logout';
  }, []);

  return { isAuthenticated: isAdmin, isAdmin, isVerified, verify, logout };
}

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isAdmin, isVerified, verify } = useAdminAuth();
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && isVerified && isAdmin) {
      toast.success('Admin access verified. Welcome back.');
      onSuccess();
      onClose();
    }
  }, [isOpen, isVerified, isAdmin, onSuccess, onClose]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await verify();
    setIsRetrying(false);
  };

  const isChecking = !isVerified || isRetrying;

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
            Restricted to WordPress administrators. Access is verified with your
            WordPress session — no separate password is needed or accepted.
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying administrator access…</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-muted/30 border border-border text-sm space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span>Administrator sign-in required</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sign in to WordPress as an administrator, then retry. Your
                WordPress session is the only credential this console accepts.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-xs"
                disabled={isRetrying}
              >
                Retry
              </Button>
              <Button
                type="button"
                size="sm"
                className="text-xs font-semibold px-4"
                onClick={() => {
                  window.location.href = '/wp-login.php';
                }}
              >
                Sign in to WordPress &rarr;
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
