# Specification 19: Color Contrast, Multi-Layer Email Triggers, Citation Parser & Cinematic Presentation Runner

## 1. Overview & System Context

This specification defines the comprehensive architecture and UI/UX standards for:
1. **Zero-Defect Dark Theme Contrast & Clean MCQ Option Controls**: Elimination of low-contrast dark-on-dark hover states, replacement of bulky MCQ option buttons with compact checkmark icons (`CheckCircle2`/`Circle`), and removal of redundant configuration buttons.
2. **Standardized REM Typography Scale**: Reduction of question titles to standard REM `text-base` (1rem / 16px) using Poppins for body/labels and Ubuntu exclusively for top headings.
3. **Responsive Card Footer Layout**: Single-row `flex-nowrap` footer with automatic left-hand overflow dropdown `[ ⚙️ Options ▾ ]` on reduced viewports (< 1536px / `2xl`).
4. **Advanced Multi-Layer Email Trigger Engine**: Dynamic variable recipient mapping (`{{candidate_email}}`), rule preset management, cascading multi-stage dispatch, CC/BCC, and disabled-by-default activation.
5. **Universal 5-Format Citation Links Parser**: Lossless auto-detection and extraction of reference links across 5 user formats (Double-line, Colon-separated, Markdown hyperlinks, Raw URLs with JavaScript domain fallback, and structured JSON arrays), auto-expanding rows, single clean deletion, Poppins typography, and enlarged modal interface.
6. **Optimized FormBuilder Top Header**: Compact slug button with popover editor, streamlined format selector, `Globe` icon access badge, and collision-free secondary utility bar.
7. **Cinematic 2-Column Presentation Slide Runner**: 50/50 split presentation slide, configurable answer placement (Left vs Right), compact top runner bar (`Copy`, `[ ⚡ Auto | 🛠️ Debug | ✕ Exit ]`), omission of redundant "Mandatory" badge text, and collapsible left-hand question navigation drawer.

---

## 2. User Request (Verbatim)

```text
https://prnt.sc/523VbeRJwxqK
https://prnt.sc/btY6prYnY8ZL

https://prnt.sc/MnYYw0GNLGO2
https://prnt.sc/hpNqYMRuXg-c
https://prnt.sc/38zhz5umVJYQ

https://prnt.sc/38zhz5umVJYQ

https://prnt.sc/U9zDHc3GM8R2

https://prnt.sc/wQ3cv-9bTxpL

https://prnt.sc/_1TkWbySDRjx

https://prnt.sc/bdZKLpS6FreS

https://prnt.sc/c4TwSmTbMYNH

Preview Issues
https://prnt.sc/otB6yUCPfaud



format 1

Example Domain
https://example.com/

alimkarim.com
https://alimkarim.com/

format 2

Example Domain: https://example.com/
alimkarim.com: https://alimkarim.com/

format 3

[Example Domain](https://example.com/)

[alimkarim.com](https://alimkarim.com/)

format 4

https://example.com/
https://alimkarim.com/

format 5

[
  {
    "title": "Example Domain",
    "url": "https://example.com/"
  },
  {
    "title": "alimkarim.com",
    "url": "https://alimkarim.com/"
  }
]




Yeah, I think so many color issues right now. And you can see if the space size is reduced, things gets broken. And there are blended in colors, which actually looks very poor. Okay. And things are broken and continue broken. So if we go into the, let's say, smaller section, like the correct answer. There is no need to mention correct answer. Just mention correct or... I think the best way to do is just a check mark, and people can hover over and can see what the check mark means. And the text can be a little bit less dark, like the designer have to keep it like hypertext marker. You can see too much dark color. Also, if you focus on this, you can see two correct answer configure. Okay, so this one also looks very poor, not professional, not UI/UX friendly. So you need to work on that as well. Okay. Now, if I click on email trigger, it also looks terrible if I click on it. You did not grasp the concept. You just try to make the design. So that's what I'm afraid of. So that's why I say check your work, verify your work. Is it done correctly? You do not put attention again. The email notification section should be a complicated stuff. It should ask what I'm looking for. Am I going to add a existing email rule or going to click, I mean add new one? If I use existing one, click on it, see an empty existing one. If I don't use the existing one, then I have to create the rule. How the rule will be created? The rule will have different segments like... The rules will have different segments and ideas like, if we go to any email trigger, what happens is that we can set up the from and to. Who is sending, sending to whom. Now set to whom, that can be variable. That could be a field from the form. That could be a field name, so that field name can be input field that we can customize from the form, like which field it would take. So that means the rules of email trigger is very powerful. It can handle a variable mechanism. So any form or field that we connect to, we can input any field with it, and that will work. And it can have the ... I think you need to make things compact when the size is reduced. You need to make it fluid and reduce the button size to drop-down button. So for email, that's just one step, the calculator, right? So from, to, how it's going to behave like, which input fields we can take or fixed fields, things like that. Or default email field, if we're using that, it take automatically. So these are there. But we should have a option to figure out the field. That's one way, that's one layer. But a single email rule can have multiple layers. So after sending the first layer, it could go to the second layer that may send the same way to other people or other groups. Okay? And how it's going to send? Is it going to send as BCC or CCC? Who would be the sending person? Who would be the name of the person? So this type of thing. Email is very complicated setup. Okay? It requires several things, I think you know. Then and only then it would make more sense. Otherwise, it would be a complicated stuff Okay, so the title of the questions, make these fonts a little bit smaller. Currently, the font size is too much big, I think. You are using Pixel, I don't know. So you are using REM, that's the best practice. Good. Can we reduce the REM for the font size a little bit less? I think that that would be good. Not sure. Are you using the Pixel for the font or the... I'm a bit confused. If you could confirm what you're using. If you're using REM, then it's the best. Okay, are you using any front-end frameworks? You can confirm which are the frameworks you are using. You can let me know at the end of your work while working. Okay? Coming to the point when we have these type of things. The email, you should disable the email section. Email should be added if we click on the right-hand side and try to add the email. Email is not like we need it for every one of them. When we need them, then we add in. Okay? There is that part. Also, there is this problem with this alignment issue when there is lesser space, actually. We could not figure it out yet. So we need to fix it for the lesser space as well. Lots of design issues. Now coming to the point, let's say we don't have the design issue. Let's say, okay? But we do have, so you have to fix it. Okay. When the spaces are reduced, I requested you to combine the bottom buttons to your left-hand side, one drop-down. You have not done it. As a sample. Okay, now the problem is in the review mode. So if we go to the presentation preview mode, single one. I don't understand why it says, "Live Preview" and then the text, I don't understand. So it should be directly visible how it would show up there, right? And where the checkbox should be. Is it the right-hand side or left-hand side that we should have the control over? I don't see the control. And these controls can also be given as defaults. So on top of the form, we should have the control, but internally for each question, we can also customize this. Reference to-do list. Okay, let me see how it looks like. Okay, that's all right. So you have a nice view. I appreciate that. The heading of this, I have highlighted with red. It says item #1. It is written in Ubuntu. Ubuntu, of course, does not look good if you have smaller text. Okay? Ubuntu looks good if you have bigger text. So for smaller text, use Poppins. Okay? Remember that. So this one is nice what you have done, but I think you need to make more fancy UI. What do I mean by that? Let's say when I fill out the first one, the next plus will be automatically there. If the next item is not there, I mean empty, it will not be added. So there is no need to have this button that actually does the add to-do. That's just additional stuff. Okay, and this is the citation adding section, right? So why do we need an additional cross? I do not know. We have a cross on top. Why do we need an additional cross? I don't know. But yes, there could be a cross in the left-hand side to remove that to-do. That I understand. Okay, that can be there. Also, there can be another option, like I can paste the links only, and it will automatically refill the title by reading the website's title using the JavaScript. Can you do that? That's one way to go. Another could be, I could actually do a paste of the list of links and titles, and I will give you a format. It could be two, three different formats. One could be markdown. So there can be an option to markdown paste. There could be an option to just direct copy-paste. So I'm going to give you three samples based on the links, and based on these three samples. So I'm going to give you alinkedIn.com, an example, these two sites in a few different formats. Okay? So I'm going to write as format one, format two. So different formats I'm going to use. You can figure it out what is good for you. You should be able to copy-paste From these formats to directly in those fields automatically. Okay, understood. And anytime I refer to the links copy-paste, try to have these formats ready. Try to make sure that all these formats can be understood and extracted from the title and the text. Is it clear? Also, after you understood, I want you to create a spec for this, and also I want you to add this spec to the coding guideline. Before adding to the coding guideline, make sure you do a pull for the coding guideline. Okay? You give all these examples, and you also mention how it can read from the memory and try to put things and separate the title and the link automatically. If the link is not given on the URL, it will automatically give URL the title by using the JavaScript. Okay? Yeah, so I tried five different formats. Okay. And you can use these five different formats to make sure that we... Extraction and reading. Anywhere that we provide the links, you can reuse this code to extract the link from anywhere, link and title, even from text, copy-paste, or anywhere. These five different formats. It will automatically try to figure out which format is given. Okay? If the JSON is there, it will automatically try to figure out it's a JSON. If it is just links, it will figure out link. If it's a markdown, it will figure out the markdown. So many different ways. Also, user can select which type that they are providing. So you can also provide these format samples with the help, so that user can open the tab and see how it looks like, and make the citations UI bigger, so the fonts and everything is bigger. User can focus. Because there is nothing, so why we are reducing the size, I do not understand. So make sure that you focus on this. Okay? The next problem is actually in the preview mode. Okay, so if we go into the presentation preview mode. Presentation preview mode. So in the header section of the quiz, there are two, three problems. One, we are still showing the link here, where you can just put the link symbol and copy button. If user clicks on Edit, they will open up a dialogue. That's a different thing. Okay? Minimize the space. And I expect you to minimize this place where you have standard UI and the presentation slides. You optimize this. Probably the standard one, you can optimize it. Okay? Yeah, also combine these three buttons together. So this will save some space. Okay? For the public, use the public icon. So that would reduce a lot of space. And probably you can bring some of these things close to the down place so that you don't have a problem. Okay? So for example, Health and Bars, you can just put it to the below, so that way you don't have a colliding problem. I think the tools and also the options that I've selected, I've highlighted properly. So you can just move these down to this place and make them compact. Make them compact. I have added and highlighted it. I think this way you don't have any problem. Okay? Please do that. Okay, now when we go to the presentation mode, I mean view mode, there is this CS problem. So first of all, I wanted to have like, if I take a screenshot, then you would understand. The left-hand side, you can have a menu-type thing which can be collapsed, or by default it will be collapsed, right? So this is where you can have a choice of questions. So basically here you have the choice of question with the project titles. That means I could preview and bring the questions. Some questions can be viewed all together, and some questions can be, this can be set up from the quiz thing, that it can be only viewed if the previous ones are answered. Okay? And then come back and forth. Remember that Okay. Now, why do we have the URL here? I don't see a point of providing a URL here. So I think you should remove the URL section. If it needs to be copied, you can just add a Copy button. That would be all right. Okay? Also, you can compact these three buttons together, which I have highlighted: Autofill, Debug, and Exit. Okay? Now, coming to the point, what that is, I don't understand why we have a title section in the middle. I don't understand. So for the presentation mode, I want you to look into the global presentation or also the wide presentation, like how the architectural view and other slides are created. The left-hand side is the bigger title where the question will be appearing, and then little bit of detail, subtext, and description in the below. And then right-hand side, the choices, question choices, or writing option should be there, very fluid way. Okay? Which I'm visualizing, which you don't have. Why we have the next section, I have no idea what the purpose of it. Okay. Also, in the question section, there is no need to mention mandatory, because mandatory is going to come up in the question part, because otherwise you cannot do it. Now here, in the color, I have selected the question one, sample, sequential question, quiz. Why it is there? That's the first thing. Second, the color is actually just blended in. It has no value. I don't understand. Also, why do we have the header section? I don't understand. This section can be there, which you have provided like sample, sequential quiz question, but that could be the full page, like a presentation. And there user says, "Assessment start." They go to the next page, and the full page would be on the same question. So you take the full space like a presentation, and for the reference, you can just check the global presentation PPT and also the wide presentation, how the left side presentations are created. Do you understand? Do you have any question and concern?
```

---

## 3. Data Contracts & Architecture Boundaries

### 3.1 Five-Format Reference Link Parser

Supported parsing schemas:
1. **Format 1 (Double-Line)**:
   ```text
   Title Line
   https://url.com/
   ```
2. **Format 2 (Colon-Separated)**:
   ```text
   Title Line: https://url.com/
   ```
3. **Format 3 (Markdown Hyperlink)**:
   ```markdown
   [Title Line](https://url.com/)
   ```
4. **Format 4 (Raw URL List)**:
   ```text
   https://example.com/
   https://alimkarim.com/
   ```
   *Auto-extract title from URL domain (`alimkarim.com` -> `Alimkarim.com`)*
5. **Format 5 (JSON Array)**:
   ```json
   [
     { "title": "Example Domain", "url": "https://example.com/" }
   ]
   ```

### 3.2 Multi-Layer Notification Trigger Model

```typescript
export interface NotificationRecipientLayer {
  layerId: string;
  layerName: string; // e.g. "Candidate Acknowledgment", "Admin Escalation"
  recipientType: 'form_field' | 'fixed_email';
  recipientField?: string; // Form field key e.g. "email", "applicant_email"
  fixedEmail?: string;
  cc?: string[];
  bcc?: string[];
  fromName?: string;
  fromEmail?: string;
  delayMinutes?: number;
}

export interface NotificationTriggerRule {
  id: string;
  name: string;
  event: 'form_submitted' | 'score_threshold' | 'time_expired';
  isPreset: boolean;
  layers: NotificationRecipientLayer[];
  subjectTemplate: string;
  bodyTemplate: string;
}
```

### 3.3 Answer Placement & Presentation Layout

```typescript
export type AnswerPlacement = 'right' | 'left'; // Default 'right'

export interface FormPresentationSettings {
  defaultQuestionLayout: 'standard' | 'presentation_split';
  defaultAnswerPlacement: AnswerPlacement;
  showQuestionDrawer: boolean;
  isSequentialLocked: boolean;
}
```

---

## 4. Verification Gates & Acceptance Criteria

1. **Gate 1: High Contrast & Option Checkmark**:
   - In Purple Theme and Dracula Theme, hover states on cards and buttons must maintain > 7:1 contrast ratio (`hover:text-foreground`, `hover:bg-accent`).
   - MCQ option rows render a single compact circular checkmark icon button with tooltip.
   - Zero duplicate configuration buttons in option rows.
2. **Gate 2: REM Typography Scale**:
   - Question titles use REM-based `text-base` (1rem / 16px).
   - Body labels and micro-text use Poppins (`font-sans`).
   - Headings `h1`–`h6` use Ubuntu (`font-heading`).
3. **Gate 3: Responsive Card Footer**:
   - Viewports < 1536px collapse secondary footer buttons into left-hand dropdown `[ ⚙️ Options ▾ ]`.
   - CardFooter maintains `flex-nowrap` single row.
4. **Gate 4: Multi-Layer Email Engine**:
   - User can switch between "Create New Rule" and "Use Existing Rule Preset".
   - Recipient `To:` field supports form variable mapping from available form fields.
   - Cascading recipient layers can be added and configured.
5. **Gate 5: Universal Citation Parser**:
   - Successfully parses all 5 formats and auto-detects formats.
   - Unit tests pass for all 5 formats with 100% coverage.
   - Citation modal UI has Poppins font for item labels, single clean deletion, auto-expanding rows, and enlarged viewport.
6. **Gate 6: Compact FormBuilder Header**:
   - Compact slug button with copy and popover editor.
   - Compact format selector (Standard vs Presentation).
   - Secondary tools bar prevents collisions and wrapping.
7. **Gate 7: Cinematic Presentation Runner**:
   - 2-Column split view (50% left for question title/description/citations; 50% right for answer options).
   - Answer placement toggle (Left vs Right) supported both in header and per-question.
   - Compact top runner bar (`Copy`, `[ ⚡ Auto | 🛠️ Debug | ✕ Exit ]`).
   - Collapsible left-hand question navigation drawer.
   - Zero "Mandatory" badge text in question card header.
