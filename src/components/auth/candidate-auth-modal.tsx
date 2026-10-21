import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, UserPlus, LogIn, Mail, Lock, User, Phone, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';

interface CandidateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: 'login' | 'register';
}

export const CandidateAuthModal: React.FC<CandidateAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login',
}) => {
  const { login, registerCandidate } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const result = await login(loginEmail, loginPassword);
      const isSuccess = result.success;

      if (isSuccess) {
        onSuccess?.();
        onClose();
        navigate('/portal');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const result = await registerCandidate(regName, regEmail, regPassword, regPhone);
      const isSuccess = result.success;

      if (isSuccess) {
        onSuccess?.();
        onClose();
        navigate('/portal');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDemoCandidateLogin = async () => {
    setIsLoggingIn(true);

    try {
      const result = await login('demo-candidate@example.com', 'candidate123');
      const isSuccess = result.success;

      if (isSuccess) {
        onSuccess?.();
        onClose();
        navigate('/portal');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card text-card-foreground border-border shadow-2xl rounded-2xl p-6">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto my-1 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <UserCheck className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Candidate Access Portal
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sign in or create your candidate account to access assessments and track your application.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'login' | 'register')} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="login" className="text-xs font-semibold flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="text-xs font-semibold flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="candidate@example.com"
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full text-xs font-semibold h-9 cursor-pointer"
                >
                  {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Sign In to Candidate Portal
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDemoCandidateLogin}
                  disabled={isLoggingIn}
                  className="w-full text-xs font-semibold h-9 border-dashed border-primary/40 hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Quick Demo Candidate Sign-In
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Alex Rivera"
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
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="alex.rivera@example.com"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Phone (Optional)
                </label>
                <Input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  Password
                </label>
                <Input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="h-9 text-xs"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full text-xs font-semibold h-9 cursor-pointer"
                >
                  {isRegistering ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Create Account &amp; Access Portal
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
