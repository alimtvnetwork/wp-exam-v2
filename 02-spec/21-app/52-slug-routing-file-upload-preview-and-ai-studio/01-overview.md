# Spec 52: Slug Routing, File Upload Preview, AI Studio & Theme Engine

## 1. Domain Architecture & System Context
This specification addresses core functional, architectural, and visual deficits in the WP Exam FormBuilder:
1. **Dynamic Slug Management & URL Routing:** Eliminating static `/admin` URLs by introducing explicit slug generation, validation, collision avoidance, and browser route synchronization (`/f/:slug`, `/admin/form/:slug`, `/preview/:slug`).
2. **Field-Type-Aware Interactive Test Preview:** Replacing the broken generic text input in question test preview with authentic, interactive field renderers — specifically building a full-featured drag-and-drop File Upload zone with type restrictions, size limits, simulated progress, and file chips.
3. **Terminology Standardization ("Section"):** Removing confusing dual "Section / Module" terminology, standardizing strictly on "Section" throughout all labels, models, and UI headers.
4. **Modern UI Component Elevating:** Replacing raw browser default HTML checkboxes with modern Radix/shadcn `Switch` components, styled numeric scoring steppers, and glassmorphic card surfaces.
5. **Per-Question AI Instruction Studio & Quick JSON Actions:** Adding an AI prompt and schema studio directly inside each question's Actions menu, enabling 1-click JSON import/export and LLM generation contracts.
6. **Live Theme Engine & Visual Palette Propagation:** Ensuring theme presets (e.g. Purple Theme, Rise Up Asia) dynamically inject CSS variables, accent colors, gradients, button hover states, and glow effects across all builder cards and runners.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  FormBuilder Command Header                                                            │
│  [Title] [Slug: /f/engineering-assessment ✎]   [Health 98% A+] [Tools ▾] [Prev] [Save] │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴──────────────────────────────────────────────────┐
│  2-Column Layout                                                                       │
│  ┌──────────────────────────────────────────────┐ ┌──────────────────────────────────┐ │
│  │ Question Card #2 [File Upload] [HR Section]  │ │ Inspector Dock                   │ │
│  │                                              │ │ [Fields] [Outline] [Audit] [Cfg] │ │
│  │  Live Interactive Preview:                   │ │                                  │ │
│  │  ┌────────────────────────────────────────┐  │ │ • Dynamic Theme Injection        │ │
│  │  │ ☁️ Drag and drop resume / work samples  │  │ │   (Purple Theme / Rise Up Asia)  │ │
│  │  │    PDF, ZIP, DOCX up to 25MB           │  │ │                                  │ │
│  │  │    [ Browse Files ]                    │  │ │ • Section Filtering & Reordering │ │
│  │  └────────────────────────────────────────┘  │ │                                  │ │
│  │                                              │ │ • Slug Management Configuration  │ │
│  │  [Required: Switch (ON)]  [Points: 10]       │ │                                  │ │
│  │  [Actions ▾] -> AI Instruction Studio (JSON) │ │                                  │ │
│  └──────────────────────────────────────────────┘ └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. User Request (Verbatim)
```text
Few serious issues. That's why I always say verify your task. You would have done nothing but, what can I say, stupidity in account. Okay? Why you do that? That's kind of interesting. Now, let's come to the point where you could actually get out of your stupidity. So here, when I say you check and validate, you check the URL as well. The URL does not change. Every time I go to somewhere, it should have its own slug, you stupid fuck. So it should have its own category of the slug. So you should have a slug management, and you can show me at the end what the slug that you are building, how you are building. Every slug needs to be very clear. Okay? So slug is very terrible what you have. Then you have other issues. I selected the file, right? And the test view shows nothing. And why there is a, let's say, section or module, either put section or module. Don't put two, okay? Okay. Now, coming to the point, when I put the validation, where is the file upload? I don't see the file upload. It's stupidity. Things does not work, and you come back and say, "It's working." I asked you several times to make the UI better. You put the required field just like the old raw forms does. You don't have any nice UI template. You are not using any framework properly, just garbage. Why? And the test view looks nothing. Okay? Okay. Now these are there. Okay, fine. Okay, I can drag drop, but drag drop has issues. Drag drop has issues. So if I'm in this section, I should also be drag items out of this section, I believe. Okay, I can. That's all right. Okay. So in each section, I should have each question, I should have AI instruction and AI inputs. What do I mean by that? AI instruction will be an instruction section where all these fields, options, these are available that would be there, and adjacent format that the current system is, and the output format that we seek for that AI can create, which we can import. Okay? So that is like everywhere there should be a short button input/export using action actually in the action section you can keep. And the coloring does not make any sense. The coloring button, the hover over, there is not much of an animation. You can see it's very terrible actually. If you change the color to something else, some other company, like no effect, very terrible. Like it change to literally, there is literally no effect. It's stupid. I asked you several times, and you are playing stupidity with me. Why? What is the main reason?
```

## 3. Visual Reference Assets
- File Upload Preview Defect: `assets/screenshots/file-upload-preview-bug-01.png`
  - `![File Upload Preview Bug](assets/screenshots/file-upload-preview-bug-01.png)`
- Raw Checkbox & Card Styling Defect: `assets/screenshots/card-styling-and-checkbox-bug-02.png`
  - `![Card Styling Bug](assets/screenshots/card-styling-and-checkbox-bug-02.png)`
- Theme Ineffectiveness Defect: `assets/screenshots/theme-color-bug-03.png`
  - `![Theme Color Bug](assets/screenshots/theme-color-bug-03.png)`
