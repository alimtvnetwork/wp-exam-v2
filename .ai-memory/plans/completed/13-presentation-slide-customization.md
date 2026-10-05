# Parent Plan: 13-presentation-slide-customization

**Slug:** `13-presentation-slide-customization`  
**Status:** completed  
**Steps:** 3  
**Spec Reference:** `02-spec/21-app/04-presentation-slide-customization/01-overview.md`  
**Detailed Technical Spec:** `02-spec/21-app/04-presentation-slide-customization/02-centered-layout-and-animations.md`  

---

## User Request (Verbatim)

```text
the title and the MCQ, everything needs to be in center
it feels like the animation and things are not proper. It's actually slowing down. Please check, are we using the CSS3 animation?
the line that we have, it needs to go up very close to the top level. It will feel like the line is close to the top level.
and also in between, if we have the numbers like one, two, like the slides, that would be nice. And that could be enabled, disabled from the back end section or the slide section for the quizzes.
and also we should have different type of previews for each one of the quiz display. Then we can check out which type of display we want. For example, the MCQ is correct. By default, it's going to have the default behavior. But we can have a selection of how it's going to be viewed or portrayed in the UI. We can have that settings for the specific question as well. That would be in the drop down. From the drop down, we can select whichever way that we wanted to.
if the text is bigger, then we make the title a bit of reduced text. If the text is more, remember that.
the owner of the slide can also get into the slide mode and can change the preview of the question as well, how he or the person wanted to preview this stuff. They could save it, save the settings during the preview. So that would also reflect back in the question quiz.
```

---

## Completed Implementations & Verification

1. [x] **Centered Alignment:** Question title, subtitle, hints, and MCQ options stack are centered on the vertical axis (`mx-auto text-center`).
2. [x] **Width Containment:** Outer container bounded by `max-w-3xl`, title bounded by `max-w-2xl`, options bounded by `max-w-xl`.
3. [x] **Dynamic Title Scaling:**
   - Long questions (> 80 chars) receive `text-2xl sm:text-3xl lg:text-4xl leading-snug`.
   - Medium questions (46–80 chars) receive `text-3xl sm:text-4xl lg:text-5xl leading-[1.2]`.
   - Short questions (<= 45 chars) receive `text-4xl sm:text-5xl lg:text-6xl leading-[1.15]`.
4. [x] **CSS3 GPU Acceleration:** `cardEntrance` uses pure `translate3d(0, 10px, 0)` with no `scale` transform.
5. [x] **Micro-Staggers:** Option card entrance delays run in 30ms increments, settling within 380ms total latency.
6. [x] **Hover Class De-confliction:** `hover:translate-x-2` removed from `FormRunner.tsx` choiceMotionClass; `.presentation-option-card:hover` handles glide.
7. [x] **Universal Transition Scoped:** `* { transition: ... 250ms }` removed from `src/index.css` and scoped strictly to interactive elements (`button, input, select, textarea, a`).
8. [x] **Ceiling-Flush Progress Line:** Progress line anchored at `fixed top-0 left-0 right-0 z-50 h-1 sm:h-1.5` at the viewport root, unaffected by container transforms and remaining mounted across steps.
9. [x] **Slide Numbering System:** Configurable `showSlideNumbers?: boolean` added to `FormSettings`, toggles in `FormBuilder` header bar & settings tab, and rendered in the top runner area.
10. [x] **Question Display Preview Types:** Extended `QuestionLayoutMode` to `'standard' | 'centered' | 'presentation_split' | 'split_right' | 'split_left' | 'cards_grid'` with dropdown selector in `SortableFieldCard`.
11. [x] **PresenterHUD Live In-Preview Persistence:** Extended `PresenterHUD` in `floating-controls.tsx` with live layout picker, slide numbers toggle, and persistence synchronization to `useQuizStore` and draft storage.
