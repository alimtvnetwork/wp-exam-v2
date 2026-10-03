# 02. Presentation FormRunner Spec

## 1. Overview
This specification details the presentation layout improvements for the `FormRunner` component in the Onboarding Quiz. The objective is to maximize visual impact during presentations by introducing full-screen layouts, heavy typography, and non-intrusive floating controls.

## 2. Layout & Typography Requirements
- **Top Progress Bar**: The "Question X of Y" floating pill section must be removed. It will be replaced with a full-width top `<Progress />` bar indicating completion status across the top edge of the screen.
- **Typography Scale**: The `presentation_split` title size must be increased from `text-5xl` to `text-6xl` (or larger) to provide a high-impact, bold visual hierarchy.
- **Full-Screen Presentation**: The container should occupy the entire viewport smoothly without unnecessary padding reducing the visual area for the content.

## 3. Floating Presenter HUD
- **Draggable Controls**: The header containing Theme, Timer, and View options must be extracted into a draggable "HUD" (Heads-Up Display) widget.
- **Implementation Mechanism**: Use `framer-motion` (`<motion.div drag>`) or native HTML5 draggable APIs to ensure the presenter can move the controls out of the way of the primary content.
- **Z-Index Strategy**: The HUD must have a sufficiently high z-index to always float above quiz content.
