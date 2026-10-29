import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

type RoleId = 'frontend' | 'support' | 'sales' | 'design';

interface RoleLink {
  id: RoleId;
  slug: string;
  name: string;
  minutes: number;
  paper: string;
}

const OXBLOOD = '#241014';
const IVORY = '#f4efe6';
const BRASS = '#c6a15b';

const ROLES: RoleLink[] = [
  {
    id: 'frontend',
    slug: 'frontend',
    name: 'Frontend developer',
    minutes: 30,
    paper: 'Multiple choice, code reading, and a harder section for strong answers.',
  },
  {
    id: 'support',
    slug: 'support',
    name: 'Customer support',
    minutes: 20,
    paper: 'Product questions, a written reply, and an audio prompt of an upset caller.',
  },
  {
    id: 'sales',
    slug: 'sales',
    name: 'Sales',
    minutes: 25,
    paper: 'Discovery questions, a written objection, and a short pitch on video.',
  },
  {
    id: 'design',
    slug: 'design',
    name: 'Product designer',
    minutes: 30,
    paper: 'A visual critique, an accessibility check, and an open design brief.',
  },
];

const NOTES = [
  { title: 'Same questions', text: 'Everyone who opens the link sits the same paper.' },
  { title: 'Same time', text: 'The limit is shown first. Progress saves if someone steps away.' },
  { title: 'Same mark', text: 'Every paper is scored the same way, then placed on one list.' },
];

export const Version5CinematicShowcase: React.FC<LayoutProps> = ({ onAdminClick, onCandidateClick }) => {
  const [activeRoleId, setActiveRoleId] = useState<RoleId>('frontend');
  const [hasCopied, setHasCopied] = useState(false);
  const activeRole = ROLES.find((role) => role.id === activeRoleId) ?? ROLES[0];
  const linkText = `onboardingquiz/${activeRole.slug}`;

  const chooseRole = (roleId: RoleId) => {
    setActiveRoleId(roleId);
    setHasCopied(false);
  };

  const copyLink = () => {
    const writeText = navigator.clipboard?.writeText;

    if (writeText) {
      void writeText(linkText).catch(() => undefined);
    }

    setHasCopied(true);
  };

  return (
    <div className="font-v5 w-full" style={{ backgroundColor: OXBLOOD, color: IVORY }}>
      <div className="h-0.5 w-full" style={{ backgroundColor: BRASS }} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#f4efe6]/55">
            Onboarding Quiz · One link per role
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCandidateClick}
              className="group inline-flex h-11 items-center justify-center gap-2 px-5 text-[13px] font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: IVORY, color: OXBLOOD }}
            >
              Open this link
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex h-11 items-center justify-center border border-[#f4efe6]/35 px-5 text-[13px] font-semibold transition-colors hover:border-[#f4efe6]"
            >
              Open the builder
            </button>
          </div>
        </div>

        <div className="mt-16 grid items-start gap-12 lg:mt-24 lg:grid-cols-12">
          <div className="lg:col-span-4" role="group" aria-label="Choose a role">
            {ROLES.map((role) => {
              const isActive = role.id === activeRoleId;

              return (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => chooseRole(role.id)}
                  className="flex w-full items-center gap-4 border-t border-[#f4efe6]/15 py-4 text-left last:border-b"
                >
                  <span
                    aria-hidden="true"
                    className="h-px w-8 shrink-0"
                    style={{ backgroundColor: isActive ? BRASS : 'transparent' }}
                  />
                  <span className={isActive ? 'text-lg font-semibold' : 'text-lg text-[#f4efe6]/40'}>{role.name}</span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#f4efe6]/50">Sample link</p>
            <p className="font-v5-display mt-4 text-[clamp(3.2rem,8vw,7rem)] font-medium leading-[0.86] tracking-[-0.03em]">
              onboardingquiz
            </p>
            <p
              key={activeRole.slug}
              className="v5-fade font-v5-display mt-2 text-[clamp(2.2rem,5vw,4.25rem)] italic leading-none"
              style={{ color: BRASS }}
            >
              / {activeRole.slug}
            </p>
            <div key={`${activeRole.slug}-rule`} className="v5-rule mt-8 h-px origin-left" style={{ backgroundColor: BRASS }} />
            <p className="mt-8 max-w-md text-lg leading-8 text-[#f4efe6]/80">{activeRole.paper}</p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#f4efe6]/45">
              {activeRole.minutes} minutes · sample paper
            </p>
            <button
              type="button"
              onClick={copyLink}
              className="mt-8 text-[13px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: hasCopied ? BRASS : IVORY }}
            >
              {hasCopied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        <section id="features" className="mt-24 grid gap-10 border-t border-[#f4efe6]/15 pt-10 sm:grid-cols-3">
          {NOTES.map((note) => (
            <div key={note.title}>
              <h2 className="text-base font-semibold">{note.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#f4efe6]/65">{note.text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
