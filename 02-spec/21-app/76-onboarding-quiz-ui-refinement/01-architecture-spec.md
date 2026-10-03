# 76 Onboarding Quiz UI Refinement - Architecture Spec

## 1. FormBuilder Layout Alignment
The Section Filter Toolbar currently pushes the question list down, causing a visual misalignment between the top of the questions and the top of the right dock tabs. 
**Resolution**: The Section Filter Toolbar layout must be adjusted. Apply CSS/flex alignment fixes so that the top edge of the questions list perfectly aligns with the top edge of the right dock tabs.

## 2. Iconography
The option deletion icon currently uses an `<X>` component in `src/components/sortable-field-card.tsx`.
**Resolution**: Replace `<X>` icons with `<Trash2>` from `lucide-react` in the option mappings. Ensure the stroke width and size match the surrounding aesthetic.

## 3. CSS3 Animation
The option boxes need smooth interactive feedback.
**Resolution**: Apply the following Tailwind utility classes for CSS3 transitions to option box containers:
`transition-all duration-300 transform hover:scale-[1.02]`

## 4. Dynamic Suggestions
For MCQ and Single Choice fields, the form builder must support dynamic suggestions.
**Resolution**: Configure `suggestedOtherOptions` in `src/components/FormBuilder.tsx` to provide users with context-aware default choices when adding new options to a field.
