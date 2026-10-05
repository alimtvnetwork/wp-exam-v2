# Specification 05: Presentation Slide Deck Motion, Default Text-Shadow, Layout Centering & Dynamic Timer

**Status:** Approved  
**Priority:** High  
**Parent Epic:** Onboarding Quiz Presentation & Admin UI Modernization  
**Specification Root:** `02-spec/21-app/05-presentation-slide-deck-motion-and-timer/`  

---

## User Request (Verbatim)

```text
default text shadow
text-shadow: rgb(0 0 0) 1px 0.7px 0px;

The UI looks better than before. However, it is not down. The top-level things actually fixed that I really appreciate. The text needs to be in the center of the screen, and the options on the right-hand side need to go down. The timer and the full screen button need to go into the top right corner a little bit and make the clock a little bit bigger and more professional. When it goes to the ending part, it should have the red color. It should have this coloring and be a little bit bigger. Every time a minute passes, the font should be bigger in red color and then smooth into the current segment. This animation should indicate that one minute has passed and will start happening when there are last five minutes or three minutes. It can be configurable for each quiz. By default, for the system, it would be less than five minutes. This will start to happen so that they know they have only five minutes. Respect that and make this bigger and better. For the options, I like the checkboxes color and how the UI/UX is displayed. With the white, it would be nice to have a little bit of text shadow. I'm sharing a text shadow sample. Try to put this as a default text shadow example in the spec, so that if I say default text shadow, you will figure it out where that is. By default, this is not the color. Usually, this would be the hover color, but when not hovering, it should have a lighter and spreaded behavior. When hovering, the spread behavior, CSS3 animation goes to this text shadow. There will be a CSS3 animation overall on the whole page. When going to the next question, it should feel like moving a slide from one page to another. It could have different views like sliding, fading in, or cutting off like a wall. Default animations that other presentations have. Get some ideas from the flat slides and global PPT and DSRM slides. Inject those slides. For the Rise Up Asia team, be influenced by the global PPT slide. Understand their background, spec, and things like that, and then implement in your system.
```

---

## Problem Statement & Visual Analysis

Visual inspection of the presentation runner interface and the user's explicit design directives reveal four primary visual and motion deficiencies:

| Dimension | Current State | Defect & Visual Analysis | Target Solution |
| :--- | :--- | :--- | :--- |
| **Default Text Shadow & Hover Spread** | Option choice labels render with flat or muddy text shadows without a formal token standard. | When rendered in white/light text across dark themes (Riseup `#0A0A14`, Purple `#0F0E1E`, Dracula `#282A36`), flat text lacks depth. When hovering, there is no crisp transition from soft ambiance to sharp focus. | Establish canonical token `default text shadow`: `text-shadow: rgb(0 0 0) 1px 0.7px 0px;`. At rest, option text uses a lighter and spreaded text shadow (`--option-text-shadow-rest: 0 1px 4px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)`). On hover, CSS3 smoothly animates into the canonical focused text shadow via `transition: text-shadow 200ms ease`. |
| **Question Canvas Centering & Downward Offset** | Question prompt sits near the top edge of a fixed min-height container (`min-h-[55vh]`), and options are nudged only slightly (`pt-4 lg:pt-8`). | The question text is not vertically centered in the viewport canvas, and the options column sits too close to the top baseline, clashing with the user's optical center. | Re-anchor canvas to full viewport height (`min-h-[calc(100dvh-4rem)] flex flex-col justify-center`). Align left question column to vertical center (`lg:self-center`). Push right options column downward intentionally with `pt-3 lg:pt-16 xl:pt-20` for balanced optical hierarchy. |
| **Slide Deck Motion (Global PPT / DSRM)** | Question transitions are abrupt or purely instant without presentation deck spatial flow. | Presentation mode feels like a web form step rather than an executive slide deck (PowerPoint, Keynote, DSRM, Rise Up Asia global PPT). Slides do not convey direction or slide deck depth. | Implement hardware-accelerated CSS3 slide transitions with directional awareness: forward navigation (`animate-ppt-slide-forward` from right +60px), backward navigation (`animate-ppt-slide-backward` from left -60px), and seamless fade/wall cutoffs. |
| **Timer Urgency & Top-Right Header Layout** | Timer and fullscreen icons sit close to navigation content with compact, non-urgent font typography. | Clock lacks executive presence, does not sit snugly in the top-right corner, and fails to communicate critical time urgency in the final minutes. | Shift timer and fullscreen controls into the top-right edge with enhanced padding. Enlarge clock typography and badge styling. Introduce configurable urgent warning threshold (default: `< 5 minutes`, or 3 minutes). Animate a prominent red pulse every time a full minute elapses during urgency. |

---

## Architectural Scope & Non-Negotiables

### 1. Canonical Default Text Shadow Mandate
- Whenever "default text shadow" is referenced across the codebase or specs, it strictly refers to:
  ```css
  text-shadow: rgb(0 0 0) 1px 0.7px 0px;
  ```
- This shadow represents the focused, crisp hover state. The resting state is lighter, diffused, and spreaded. Transitions between rest and hover must use fluid CSS3 easing (`transition: text-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)`).

### 2. Viewport-Anchored Canvas & Optical Downward Offset
- The presentation container in `src/components/runner/FormRunner.tsx` must fill the available presentation viewport (`min-h-[calc(100dvh-4rem)]`).
- The 2-column grid layout uses `items-start` with the left column vertically centered (`lg:self-center`) and the right column pushed downward by `pt-3 lg:pt-16 xl:pt-20`.
- Mobile screens (`< lg`) gracefully collapse to single-column flow with modest padding (`pt-3 sm:pt-4`) to prevent excessive scrolling on small viewports.

### 3. Direction-Aware Global PPT / DSRM Slide Motion
- Navigation state tracks navigation intent (`slideDirection: 'forward' | 'backward'`).
- Advancing to the next question slides in from the right edge with subtle opacity ramp.
- Returning to the previous question slides in from the left edge.
- Smooth ease-out bezier curves (`cubic-bezier(0.22, 1, 0.36, 1)`) deliver the professional cadence of enterprise presentation decks (Rise Up Asia PPT, DSRM slides).
- Respect `prefers-reduced-motion` media queries repository-wide.

### 4. Dynamic Urgent Timer Pulse & Corner Docking
- Timer clock badge moves into the top-right corner toolbar (`top-4 right-4 lg:top-6 lg:right-8`).
- Urgent threshold is configurable per quiz via `FormSettings.urgentTimerThresholdMinutes` with a system default of 5 minutes (300 seconds).
- In urgent mode (`remainingSeconds <= thresholdSeconds`):
  - Base timer color shifts to warning red (`#EF4444` / Crimson).
  - Clock typography increases in scale and font weight (`font-mono text-base lg:text-lg font-bold`).
  - Upon each minute boundary tick (e.g., crossing from 4:01 to 4:00, 3:01 to 3:00):
    - Triggers an expanding, larger red font pulse (`animate-timer-minute-pulse`).
    - Smoothly eases back to the current urgent segment without jarring jumps.

### 5. Repository Guidelines & Theming Parity
- **Riseup Theme Rule 9:** Background `#0A0A14`, cream primary text `#F7F1E6`. Gold `#E8C547` is strictly reserved for active indicator marks (e.g., selected radio dot, checkbox check, active progress notch), NEVER dominant text or title highlights.
- **Purple Theme Rule 9:** Background `#0F0E1E`, primary text `#FFFFFF`, luminous borders `#3A3568`, action buttons `#5C45FD`.
- **Dracula Theme:** Muted text `#BAC7E8`, surface `#282A36`, selection `#44475A`.
- **Strict Relative Git Paths:** Zero absolute paths or `file:///` URIs in any file.
- **Boolean Principles:** Implicit evaluation only (`if (isUrgent) { ... }`). Never `== true` or mixed polarity.

---

## Acceptance Criteria

### A. Default Text Shadow & Hover Spread
- [ ] Canonical CSS declaration `text-shadow: rgb(0 0 0) 1px 0.7px 0px;` is documented and mapped to `--option-text-shadow-hover` and `--wp-exam-text-shadow-default`.
- [ ] Resting option text shadow uses `--option-text-shadow-rest: 0 1px 4px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)` on dark themes (`#0A0A14`, `#0F0E1E`, `#282A36`).
- [ ] Hovering over option choices triggers a smooth 200ms transition into `text-shadow: rgb(0 0 0) 1px 0.7px 0px;` accompanied by subtle horizontal translation (`translateX(6px)`).
- [ ] Light themes use subtle, low-opacity shadow tokens (`0 1px 2px rgba(0,0,0,0.06)`) that transition cleanly without dark halo artifacts.

### B. Canvas Centering & Downward Offset
- [ ] The presentation runner container utilizes `min-h-[calc(100dvh-4rem)] flex flex-col justify-center`.
- [ ] On desktop (`lg` and above), the question column (left side) is vertically centered (`lg:self-center`).
- [ ] On desktop, the options column (right side) applies an intentional downward offset (`pt-3 lg:pt-16 xl:pt-20`).
- [ ] On mobile viewports (`< lg`), options stack naturally below question context with `pt-3` spacing, ensuring zero awkward dead space.
- [ ] Unconditional verification that zero `Candidate Response` text or headers appear in the DOM.

### C. Global PPT / DSRM Slide Motion Transitions
- [ ] Navigation state in `FormRunner.tsx` accurately sets `slideDirection: 'forward' | 'backward'`.
- [ ] Moving forward applies `animate-ppt-slide-forward` (starting at `+60px` X offset, fading from 0 to 1 over 320ms).
- [ ] Moving backward applies `animate-ppt-slide-backward` (starting at `-60px` X offset, fading from 0 to 1 over 320ms).
- [ ] Keyframe definitions are registered in `src/styles/theme.css` and `src/styles/theme.less` with GPU compositing (`will-change: transform, opacity; transform: translate3d(0, 0, 0)`).
- [ ] Slide deck feel reflects enterprise decks (Rise Up Asia PPT, DSRM slides) with silky cubic-bezier deceleration.

### D. Dynamic Urgent Timer Pulse & Corner Toolbar
- [ ] Timer clock and fullscreen toggle are pinned to top-right corner with balanced visual padding (`top-4 right-4 lg:top-6 lg:right-8`).
- [ ] Urgent threshold is configurable per quiz via `FormSettings.urgentTimerThresholdMinutes`, defaulting to 5 minutes (`300` seconds), with selectable 3-minute or custom options.
- [ ] When time remaining drops below threshold, clock styling shifts to high-visibility red (`#EF4444`) with enlarged font (`text-base lg:text-lg font-mono font-bold`).
- [ ] Upon crossing every minute boundary within the urgent window (e.g., 4:00, 3:00, 2:00, 1:00), an enlarged red pulse animation fires (`scale(1.18)` red highlight) and smoothly settles into the running segment over 1200ms.
