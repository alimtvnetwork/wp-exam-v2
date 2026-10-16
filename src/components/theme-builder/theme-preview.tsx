/**
 * Preview canvas — renders representative app components (headers, buttons in
 * sm/md/lg, quiz cards with options, badges, progress, form fields) inside a
 * container painted with the *draft* tokens via CSS variables.
 *
 * Because the draft variables are scoped to this container only, editing a
 * token repaints the preview instantly with no page reload and no effect on
 * the surrounding app — the "before Apply" state of the awansoft semantics.
 */

import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';
import type { ThemeTokens } from './types';
import { paintTokens } from './theme-engine';

interface ThemePreviewProps {
  tokens: ThemeTokens;
}

const SAMPLE_OPTIONS = [
  { id: 'a', label: 'Automated scoring with instant feedback', isSelected: false },
  { id: 'b', label: 'Branching logic for adaptive assessments', isSelected: true },
  { id: 'c', label: 'Timed sections with per-question limits', isSelected: false },
  { id: 'd', label: 'Candidate video answers with playback', isSelected: false },
];

export const ThemePreview: React.FC<ThemePreviewProps> = ({ tokens }) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    if (canvasRef.current) {
      paintTokens(canvasRef.current, tokens);
    }
  }, [tokens]);

  return (
    <div
      ref={canvasRef}
      className="min-h-full bg-background text-foreground transition-colors"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <div
        className="mx-auto max-w-3xl"
        style={{ padding: 'var(--tb-section-gap)', display: 'grid', gap: 'var(--tb-section-gap)' }}
      >
        {/* Header block */}
        <div style={{ display: 'grid', gap: 'var(--tb-gap)' }}>
          <div className="h-0.5 w-16 bg-primary shadow-md" aria-hidden="true" />
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Onboarding Quiz
          </h2>
          <p className="text-sm text-muted-foreground">
            Live preview — every token edit repaints this canvas instantly.
          </p>
        </div>

        {/* Buttons: standardized sm / md / lg */}
        <section style={{ display: 'grid', gap: 'var(--tb-gap)' }}>
          <h3
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Buttons
          </h3>

          <div className="flex flex-wrap items-center" style={{ gap: 'var(--tb-gap)' }}>
            <Button size="sm">Primary sm</Button>
            <Button size="default">Primary md</Button>
            <Button size="lg">Primary lg</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <Separator />

        {/* Quiz question card with options */}
        <section style={{ display: 'grid', gap: 'var(--tb-gap)' }}>
          <h3
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Quiz card &amp; options
          </h3>

          <Card className="shadow-md">
            <CardHeader style={{ padding: 'var(--tb-card-padding)', paddingBottom: 0 }}>
              <div className="flex items-center justify-between" style={{ gap: 'var(--tb-gap)' }}>
                <CardTitle
                  className="text-lg"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Which features ship with the assessment?
                </CardTitle>
                <Badge>Q3 / 12</Badge>
              </div>
              <CardDescription>Select the best answer to continue.</CardDescription>
            </CardHeader>

            <CardContent
              style={{
                padding: 'var(--tb-card-padding)',
                display: 'grid',
                gap: 'var(--tb-gap)',
              }}
            >
              {SAMPLE_OPTIONS.map((option) => {

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`presentation-option-card flex w-full items-center gap-3 rounded-[var(--radius)] border bg-card/75 px-4 py-3 text-left text-sm backdrop-blur-xs transition-all duration-200 ${
                      option.isSelected
                        ? 'border-primary/75 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.35)]'
                        : 'border-border opacity-[0.82] hover:translate-x-[6px] hover:opacity-100 hover:border-primary/75'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        option.isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {option.id.toUpperCase()}
                    </span>
                    <span className={option.isSelected ? 'font-semibold' : undefined}>
                      {option.label}
                    </span>
                    {option.isSelected && (
                      <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}

              <div className="flex items-center" style={{ gap: 'var(--tb-gap)' }}>
                <Progress value={25} className="flex-1" />
                <span className="font-mono text-xs text-muted-foreground">25%</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Form fields */}
        <section style={{ display: 'grid', gap: 'var(--tb-gap)' }}>
          <h3
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Form fields
          </h3>

          <div className="grid gap-4 sm:grid-cols-2" style={{ gap: 'var(--tb-gap)' }}>
            <div className="space-y-2">
              <Label htmlFor="tb-preview-name">Candidate name</Label>
              <Input id="tb-preview-name" placeholder="Ada Lovelace" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tb-preview-email">Work email</Label>
              <Input id="tb-preview-email" placeholder="ada@example.com" />
            </div>
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 'var(--tb-gap)' }}>
            <Badge variant="default">Active</Badge>
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">Archived</Badge>
            <Badge variant="destructive">Failed</Badge>
          </div>
        </section>
      </div>
    </div>
  );
};
