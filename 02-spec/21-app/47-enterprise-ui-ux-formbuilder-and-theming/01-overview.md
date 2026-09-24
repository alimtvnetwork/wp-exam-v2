# Spec [47]: Enterprise UI/UX Overhaul, FormBuilder Google Forms UX & Universal Theming

## 1. Verbatim User Request
> "Each component, each combo, and the overview actually, you will feel that the things that is there is kind of cheap. It does not look very professional. It does not look like a professional person has written it. And also why not the URL when we run the Run PS1 file, why the URL does not open in the browser automatically? Fix it. And, yeah, I don't see that it's quite easy to fill out, and the color and themes has no effect. Has literally no effect on the form. Whatever I choose, there is no effect. So it's very terrible. And you are saying you are very confident, I don't understand. Yeah, let's get into the admin section. So focus quiz. Okay, it looks like literally that's appreciable, but where is the edit option for this? How can I create these type of quizzes so that from there, it should go into this preview? Okay. For example, these buttons, dropdowns, why these are that poor? It feels like it's '90s. Okay. So everything is very cheap. It does not look very good. So this is where my concern is. Candidate invite. Again, you did stupid stuff. How can you, or how could you have this type of coloring? I really do not understand. How can you have this in the invite step? Okay, really terrible. White under gray color, very terrible. Also audit trail, terrible color. It does not have any UI/UX. Okay, let's get into the form builder. Okay. So first of all, if I look into this, there is no consistency. The same thing is going, and then something is very big. And then why there is this button which has no consistency? How this is very high category and how you are very confident, I don't understand. Okay, multiple choice. What is the module and group? I do not understand what that is. Explain and try to fix it. What that is, I really do not get it. And how to add a new field. It's not interactive. I could not figure out how to... It's not very good. Think about how the Google Forms does it, because the fields are fixed, so why it should be on top? It should be right-hand side fixed. Right. And I should be able to drag, drop the item wherever I want, which is not there. Okay, so it has draggable feature. That's nice. Okay. Also add email feature with each one of the fields, email or trigger something. It could be trigger some field, some additional field or email, or WhatsApp notification, or different types of things, okay, so we could add it. Okay, input you have done for WhatsApp. Let's see, what is the WhatsApp looks like? How can I preview it? So let's say I selected something. How can I preview the input and test it? There is no option. So each one of the options should have a preview mode that I could go. Okay. So let's say now I wanted to preview this form which I have created. And you didn't ask for the form's name, form name, form description, just like Google Forms does. It's quite a stupidity, and you're saying like you are very confident. I really do not get it. Really don't. Okay? It does not make any sense. And validation should be with each field. Okay, we can select each one of them, and then we can add additional validation. What we want to add. We can add regex validation. We can use link validation. We can use starts with, ends with, contains. Okay, these are the three common validation. We can do multiple of this. Starts with and end with. Starts with or ends with. Something like this. So it feels very flat. It feels like someone who has no knowledge who has built this UI. The UI is very terrible. I cannot even relate. Cannot even relate. So when we go into the regex section Starts with, usually starts and ends with. It should not be regex. Now, people can add multiple validations, that's all right, and test the data with it. Automatically, people could, yeah, that option you have kept, that's really nice. However, people could also have some default regexes, okay, that would be given. And for example, email, phone number, URL, Google Drive, PDF. Google Drive, and then some common ones. Okay, let's say, I think these are enough to have the validation, and usually the default message should show whatever the field is, it's not valid because of this, and it expects this. It'll be the default message, but if the user wants, they could use the custom message. It's not like they have to do the custom message. That should be optional, but what the heck? We just put the custom message. 'You have no idea.' I really don't get it. Okay, I think we should get started with the fixing. Later on, we can discuss the new stuff. We'll do it later on, but not now."

---

## 2. Ingested Visual Evidence & Screenshots

All user-uploaded screenshots and review points have been ingested into the repository:
1. `![Dracula Theme Ineffective](assets/screenshots/ui-review-01-theme-dracula.png)`: Demonstrates switching to Antigravity Dracula produces no visual change in background or components.
2. `![VS Code Dark Theme Ineffective](assets/screenshots/ui-review-02-theme-vscode.png)`: Demonstrates switching to VS Code Dark leaves canvas and controls identical.
3. `![Native 90s Select](assets/screenshots/ui-review-03-native-select.png)`: Demonstrates unstyled native `<select>` dropdowns in Active Curriculum Project.
4. `![Invites Contrast Flaw](assets/screenshots/ui-review-04-invites-contrast.png)`: Demonstrates jarring white-on-gray card styling and mismatched controls in User Invitations.

---

## 3. Core Architecture Blueprint

```
+------------------------------------------------------------------------------------------------+
|                                    WP EXAM CLIENT / ADMIN                                     |
|                                                                                                |
|  [ run.ps1 ]                                                                                  |
|    |-- Auto-launches default browser at http://127.0.0.1:5173 using Vite --open + fallback    |
|                                                                                                |
|  [ Theme System ]                                                                             |
|    |-- Dynamic CSS variables: --wp-exam-bg, --wp-exam-card, --wp-exam-border, --wp-exam-primary |
|    |-- Presets: Rise Up Asia (Gold), Dracula (Purple), VS Code (Cyan), Letterly (Indigo), Light|
|    |-- FormRunner & WizardRunner dynamically respond to theme selection                        |
|                                                                                                |
|  [ FormBuilder: Google Forms Layout ]                                                          |
|    |-- Header: Prominent Editable Form Title & Description with Rich Status Pills             |
|    |-- Left Canvas: Draggable, Sortable Field Cards with Group/Module Visual Sections          |
|    |-- Right Palette: Sticky / Fixed Field Palette for Instant Click-to-Add or Drag-to-Canvas  |
|    |-- Field Card Enhancements:                                                                |
|    |     |-- Multi-Rule Compound Validation (Starts With, Ends With, Contains, Regex, URL)     |
|    |     |-- Logic Gates: AND / OR between rules with live input testing                      |
|    |     |-- Pre-built Presets: Email, Phone, URL, Google Drive URL, PDF Document URL         |
|    |     |-- Automatic Default Error Messages with Optional Custom Text Override              |
|    |     |-- Per-Field Live Test Preview (e.g. WhatsApp Prefix + Formatting live simulation)  |
|    |     |-- Notification Triggers (Email Alert, WhatsApp Webhook, Conditional Field Trigger) |
|                                                                                                |
|  [ Admin UI Overhaul ]                                                                         |
|    |-- Modern Radix Select Components replacing all raw <select> elements                     |
|    |-- Candidate Invites: Sleek dark glassmorphism, high-contrast typography, refined badges   |
|    |-- Audit Trail: Deep dark table tokens, subtle alternating rows, clear event badges       |
|    |-- Focus Quiz Editor: Dedicated Admin CRUD Studio for sequential stage-based quizzes      |
+------------------------------------------------------------------------------------------------+
```

---

## 4. Extracted Actionable Task List

- `Task-01`: Auto-Open Browser on `run.ps1` Execution & Server Ready.
- `Task-02`: Universal Dynamic Theming Engine & Runner CSS Variable Bindings.
- `Task-03`: Modern Select Component Overhaul (Eliminate '90s Unstyled `<select>`).
- `Task-04`: Admin Contrast Overhaul (Candidate Invites & Audit Trail Restyling).
- `Task-05`: Google Forms Style Builder UX (Editable Header & Right-Hand Sticky Palette).
- `Task-06`: Multi-Rule Compound Validation Engine with Default Presets & Messages.
- `Task-07`: Per-Field Interactive Live Preview Mode & Notification Triggers.
- `Task-08`: Focus Quiz Creator & Authoring Studio in Admin Panel.
