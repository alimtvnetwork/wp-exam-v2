# Subtask 04: Multi-Mode Rating & Conditional Feedback Triggers

> **/goal** Support Numbers, IMDB Stars, and 5-stage Sentiment Emojis, with score-driven conditional feedback prompts and Google Maps review link + appreciation tags.
> **/learn** Positive booleans only, zero explicit true checks, strict relative paths.

## Target Files
- `src/components/runner/FormRunner.tsx`
- `src/components/forms/sortable-field-card.tsx`

## Tasks
1. 3 Rating Modes:
   - `numbers`: Numeric buttons 1 to N.
   - `stars`: IMDB star sequence 1 to 5 or 1 to 10 with amber glow.
   - `emojis`: 5-stage feeling emojis:
     1. 😢 / 😡 `Cry / Angry`
     2. 🙁 `Sad`
     3. 😐 `Neutral`
     4. 😊 `Happy`
     5. 😍 `Love / Heart Eyes`
2. Conditional Feedback Actions in Runner:
   - If `rating <= (field.ratingFeedbackThreshold || 3)`:
     - Prompt: *"How can we improve your experience?"* with multiline commentary box.
   - If `rating >= (field.ratingReviewThreshold || 4)`:
     - Google Maps Review CTA: button opening `field.ratingReviewUrl || 'https://maps.google.com'` in a new tab.
     - Appreciation Tag Pills: clickable pills (e.g. `⚡ Fast Response`, `🎓 Knowledgeable`, `📚 Great Curriculum`, `🤝 Supportive Mentors`, `✨ Seamless Experience`) toggled into response data.
3. Builder Controls:
   - In `sortable-field-card.tsx`, provide mode selector (`Numbers`, `IMDB Stars`, `Feeling Emojis`), Review URL input, and appreciation tags editor.
