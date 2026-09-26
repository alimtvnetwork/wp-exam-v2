# UI/UX Overhaul: Google Forms Layout, Typography, Sections & Multi-Select Correctness

## User Request (Verbatim)
Let's retry again, the work is not good yet. You need to work on UI/UX. It's still not there. The reason I'm saying this because you have very small text. So small text does not comply with UI/UX. Okay? So that is a big hurdle. Yeah, I think we need to focus on this. And the correct button is better, but also you can add multiple correct buttons, okay, for the section text. So we should be able to type the sections which is already created in that quiz. Okay? It will also suggest to type the existing one. Also, if we hover over, we can also see a dropdown, but also we can type a new section as well. The AI Studio button, when I hover over, it just blends it in. So this is the problem with you. You do not understand the UI/UX. You just create trash, okay? Which is the biggest problem. Big problem. You don't understand this. So all these things you are changing, I want you to create the spec. I want you to write the correctness into the spec, okay, so that any AI that is going to follow through will understand, respect, and make good things. Is it clear? Do you understand this? Also, the tool section buttons, these are really terrible work because your buttons are getting blended in. It does not make any sense. And when you start on the page, why there is a big gap? I highlighted the gap. Why there is this gap? I don't understand. And if I go into the test preview, okay, it's fine. The items are showing on, let's say, A, B, C, D column. Okay, that's all right. That's good. But also at the same time, add better animation. Don't use the zoom-in animation. I really hate it. Probably a hover animation, that would make more sense, okay? And when you display it, the first thing I wanted to see the question. You should see the question, and it could be an image as well, right? A question. And also the FAQ, sorry, MCQ section, the answer can be a paragraph, answer can be a link, answer can be others. So you don't have that programming option, I believe. So add that Others option where we could add others, and also in the Others, we can also suggest few, and others can be enhanced by the user type. That means whatever the most people are typing, and we can select that option. So that means the other options can be powerful that will have enhanced control that we can select... You don't have a wide theme. You should work on more for the wide themes, okay? And the text, rather than having everything in one place. For example, you have question, field type, and it looks really bad. When we select the field type, the field type should be on top position where you have required grading. In this position, you should have field type, okay? So we can drop down. And then we have-- Yeah, number is correct. Then we can have a little bit of summary at the end, like it's a required grading, things like, not like here, okay, the top position. And we can take out the field. So we have to think of this, how we can present this better, okay, because we need to have more space for the questions. Just try to understand the Google Forms, how they do it, and we can have different type of UI that I could like, okay? You need to create more white UI as well.

## Architecture Blueprint & Design Decision Ledger

### 1. Google Forms Layout Paradigm
- **Header:** Question number chip, Drag Handle, and on the right side: Field Type Selector (`<Select>` for Multiple Choice, Short Answer, etc.) allowing users to switch types instantly without crowding the card body.
- **Body:** Large Question input (`text-base font-semibold`) taking maximum width, optional question image upload / preview right below the question title.
- **Options Area:** Clean vertical choices with letter chips (A, B, C, D). Each choice has:
  - Radio/Checkbox indicator
  - Editable option label (`text-sm`)
  - "Mark as correct" toggle button (allowing multiple correct answers when type is multiple_choice)
  - Delete option button
- **Section Management:** Combobox dropdown with existing sections from the form + ability to type a new section name directly.
- **Card Footer:** Bottom toolbar containing:
  - Required switch
  - Points input
  - Allow "Other" option toggle
  - Duplicate question button
  - Delete question button

### 2. Typography Standard
- Banned `text-[10px]` and `text-[9px]` for interactive controls and labels.
- Standard body/inputs: `text-sm` (14px).
- Question titles and prominent headers: `text-base` (16px) or `text-lg` (18px) with medium/semibold weights.
- Badges/meta: minimum `text-xs` (12px).

### 3. Animations & Micro-Interactions
- Banned `zoom-in-95` and disruptive scale springs.
- Permitted: subtle `fade-in duration-150 ease-out` and smooth hover transitions (`hover:border-primary/40 hover:shadow-sm transition-all duration-150`).

### 4. Wide White Theme
- `theme-clean-wide`: Pure white surface (`#ffffff`), soft slate borders (`#e2e8f0`), deep slate typography (`#0f172a`), refined indigo/violet primary accent, spacious container layout (`max-w-5xl`).

### 5. Multi-Select Correctness & MCQ Others Enhancements
- Support `correctAnswers?: string[]` alongside legacy `correctAnswer?: string`.
- Multiple options can be marked correct when `type === 'multiple_choice'`.
- "Others" choice renders with popular suggestion pills (e.g. "Bachelor in E-commerce", "Remote Freelance", "Self-Taught") clickable into the input field.
