import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

const PAGE = '#f3f5f2';
const DOCKET = '#e3ebe6';
const INK = '#17211c';
const PINE = '#0c6b52';

const OPTIONS = [
  { id: 'send', letter: 'A', text: 'Send the document again, and say where it lives.' },
  { id: 'done', letter: 'B', text: 'Mark the task done and move on.' },
  { id: 'search', letter: 'C', text: 'Tell them to search the shared drive.' },
  { id: 'wait', letter: 'D', text: 'Wait until their manager returns.' },
];

export const Version7VelocityStudio: React.FC<LayoutProps> = ({ onAdminClick, onCandidateClick }) => {
  const [selectedId, setSelectedId] = useState('');

  const chosen = OPTIONS.find((option) => option.id === selectedId);
  const answerText = chosen ? chosen.text : 'Not answered yet';

  return (
    <div className="font-v7 w-full" style={{ backgroundColor: PAGE, color: INK }}>
      <div className="grid min-h-[calc(100vh-9rem)] lg:grid-cols-2">
        <section aria-label="Candidate" className="px-5 py-12 sm:px-10 lg:px-14 lg:py-16" style={{ backgroundColor: PAGE }}>
          <div className="mx-auto max-w-xl lg:ml-auto lg:mr-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-55">Candidate · Question 04 of 12</p>
            <h1 className="mt-8 text-[clamp(1.65rem,2.5vw,2.25rem)] font-medium leading-snug tracking-[-0.02em]">
              A new hire cannot find the policy they were asked to read. What do you do first?
            </h1>
            <div className="mt-8 border-t border-[#17211c]/15" role="group" aria-label="Answers">
              {OPTIONS.map((option) => {
                const isSelected = option.id === selectedId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(option.id)}
                    className="flex w-full items-start gap-4 border-b border-[#17211c]/15 py-4 text-left"
                    style={{
                      boxShadow: isSelected ? `inset 3px 0 0 ${PINE}` : 'inset 3px 0 0 transparent',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-sm font-semibold"
                      style={{
                        backgroundColor: isSelected ? PINE : 'transparent',
                        color: isSelected ? '#f3f5f2' : INK,
                        border: isSelected ? `1px solid ${PINE}` : '1px solid rgba(23,33,28,0.35)',
                      }}
                    >
                      {option.letter}
                    </span>
                    <span className="pt-0.5 text-[15px] leading-6">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="features"
          aria-label="Reviewer"
          className="border-t border-[#17211c]/15 px-5 py-12 sm:px-10 lg:border-l lg:border-t-0 lg:px-14 lg:py-16"
          style={{ backgroundColor: DOCKET }}
        >
          <div className="mx-auto max-w-md lg:mr-auto lg:ml-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-55">Reviewer · Onboarding Quiz</p>
            <h2 className="mt-8 text-[clamp(1.65rem,2.5vw,2.25rem)] font-medium leading-snug tracking-[-0.02em]">
              Their answer is written here.
            </h2>
            <p className="mt-4 text-base leading-7 opacity-75">
              You see the choice. The rest of the paper stays the same for every person.
            </p>

            <dl className="mt-8 border-t border-[#17211c]/15">
              <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-[#17211c]/15 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-50">Name</dt>
                <dd className="text-sm font-medium">Priya Shah</dd>
              </div>
              <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-[#17211c]/15 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-50">Paper</dt>
                <dd className="text-sm font-medium">Workplace policies</dd>
              </div>
              <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-[#17211c]/15 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-50">Answer</dt>
                <dd className="text-sm font-medium leading-6">{answerText}</dd>
              </div>
            </dl>

            <p className="mt-5 text-sm leading-6 opacity-60">Sample. A finished paper keeps this answer with the name.</p>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onCandidateClick}
                className="group inline-flex h-11 items-center justify-center gap-2 px-5 text-[13px] font-semibold text-[#f3f5f2]"
                style={{ backgroundColor: INK }}
              >
                Try the paper
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={onAdminClick}
                className="inline-flex h-11 items-center justify-center border border-[#17211c]/30 px-5 text-[13px] font-semibold hover:border-[#17211c]"
              >
                Open the builder
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
