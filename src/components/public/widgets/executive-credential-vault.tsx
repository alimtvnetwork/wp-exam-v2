import React, { useState } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, Lock, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ExecutiveCredentialVault: React.FC = () => {
  const [isVerified, setIsVerified] = useState(true);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel-elevated overflow-hidden gold-foil-border shadow-[0_20px_60px_rgba(232,197,71,0.12)] relative">
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-primary to-amber-400" />

      <div className="p-8 sm:p-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/20 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Cryptographic Credential Issuance Engine</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground font-heading">
              Verifiable Executive Credentials
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs py-1 px-3 rounded-full">
              SHA-256 Authenticated
            </Badge>
          </div>
        </div>

        {/* Certificate Display Card */}
        <div className="rounded-3xl p-8 sm:p-12 border border-primary/30 bg-card/60 backdrop-blur-xl relative overflow-hidden space-y-8 text-center shadow-2xl">
          {/* Subtle watermark seal in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-8 border-primary/5 rounded-full pointer-events-none flex items-center justify-center">
            <Award className="w-32 h-32 text-primary/5" />
          </div>

          <div className="space-y-3 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-primary font-bold block">
              Official Assessment Credential
            </span>
            <h4 className="text-2xl sm:text-4xl font-black text-foreground font-heading tracking-tight">
              Certificate of Technical Mastery
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Awarded to <span className="font-bold text-foreground">Marcus Sterling</span> for demonstrating distinguished competency in Senior Distributed Systems &amp; Concurrency Architecture.
            </p>
          </div>

          {/* Score & Validation Metadata Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-center space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Final Grade</span>
              <span className="text-xl font-black text-primary font-heading">94.8%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-center space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Percentile</span>
              <span className="text-xl font-black text-emerald-500 font-heading">Top 2%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-center space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Proctor Status</span>
              <span className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 Infractions
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-center space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Token ID</span>
              <span className="text-[11px] font-mono font-bold text-foreground truncate block mt-1">
                #CERT-9402
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 relative z-10 border-t border-border/50">
            <Button
              size="sm"
              onClick={() => setIsVerified(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-6 rounded-xl shadow-xs cursor-pointer gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed PDF</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-bold text-xs h-10 px-6 rounded-xl border-border hover:bg-muted/70 cursor-pointer gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              <span>Verify Cryptographic Signature</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
