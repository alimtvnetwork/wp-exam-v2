import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

const CHALK = '#f4f1ea';
const INK = '#1c1b19';
const MARK = '#e3b505';

const EMPTY_SEATS = ['Maya Rossi', 'Daniel Kim', '', ''];

const NOTES = [
  { title: 'Same paper', text: 'The questions do not change from seat to seat.' },
  { title: 'Same time', text: 'Every seat at this table has the same limit.' },
  { title: 'One list', text: 'When the sitting ends, the scores land in one place.' },
];

export const Version7VelocityStudio: React.FC<LayoutProps> = ({ onAdminClick, onCandidateClick }) => {
  const [seats, setSeats] = useState<string[]>(EMPTY_SEATS);
  const [draft, setDraft] = useState('');

  const hasDraft = draft.trim().length > 0;
  const emptyIndex = seats.findIndex((seat) => seat.length === 0);
  const hasEmptySeat = emptyIndex >= 0;
  const canSeat = hasDraft ? hasEmptySeat : false;

  const seatCandidate = () => {
    if (!canSeat) {
      return;
    }

    const updated = [...seats];
    updated[emptyIndex] = draft.trim();
    setSeats(updated);
    setDraft('');
  };

  const clearSeat = (index: number) => {
    const updated = [...seats];
    updated[index] = '';
    setSeats(updated);
  };

  return (
    <div className="font-v7 w-full" style={{ backgroundColor: CHALK, color: INK }}>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-4 border-b border-[#1c1b19]/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-55">Onboarding Quiz · One table</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCandidateClick}
              className="group inline-flex h-11 items-center justify-center gap-2 bg-[#1c1b19] px-5 text-[13px] font-semibold text-[#f4f1ea] transition-opacity hover:opacity-80"
            >
              Take an open seat
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex h-11 items-center justify-center border border-[#1c1b19]/30 px-5 text-[13px] font-semibold transition-colors hover:border-[#1c1b19]"
            >
              Open the builder
            </button>
          </div>
        </div>

        <h1 className="mt-14 max-w-3xl text-[clamp(2.5rem,5vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.03em]">
          Everyone gets the same seat.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 opacity-75">
          Add a name. The paper in front of them does not change.
        </p>

        <form
          className="mt-10 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            seatCandidate();
          }}
        >
          <label className="sr-only" htmlFor="v7-name">
            Candidate name
          </label>
          <input
            id="v7-name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a name"
            className="h-12 flex-1 border border-[#1c1b19]/25 bg-transparent px-4 text-base outline-none placeholder:text-[#1c1b19]/35 focus:border-[#1c1b19]"
          />
          <button
            type="submit"
            disabled={!canSeat}
            className="h-12 bg-[#1c1b19] px-6 text-sm font-semibold text-[#f4f1ea] disabled:opacity-35"
          >
            Seat them
          </button>
        </form>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Seats at the table">
          {seats.map((seat, index) => {
            const isOccupied = seat.length > 0;

            return (
              <li key={`seat-${index + 1}`} className="border border-[#1c1b19]/15 px-5 py-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] opacity-45">
                    Seat {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5"
                    style={{ backgroundColor: isOccupied ? MARK : 'transparent' }}
                  />
                </div>
                <p className={`mt-8 text-xl font-medium leading-tight ${isOccupied ? '' : 'opacity-35'}`}>
                  {isOccupied ? seat : 'Empty'}
                </p>
                <p className="mt-6 text-sm leading-6 opacity-60">Same paper · 30 minutes</p>
                {isOccupied && (
                  <button
                    type="button"
                    onClick={() => clearSeat(index)}
                    className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-50 hover:opacity-100"
                  >
                    Clear {seat}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <section id="features" className="mt-16 grid gap-8 border-t border-[#1c1b19]/15 pt-10 sm:grid-cols-3">
          {NOTES.map((note) => (
            <div key={note.title}>
              <h2 className="text-base font-semibold">{note.title}</h2>
              <p className="mt-2 text-sm leading-6 opacity-70">{note.text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
