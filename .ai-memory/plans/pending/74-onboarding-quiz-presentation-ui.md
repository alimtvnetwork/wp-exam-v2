# Onboarding Quiz presentation UI

Slug: onboarding-quiz-presentation-ui
Status: in-progress
Steps: 12
Branch: main
Tree at start: clean
Latest: `git pull --rebase origin main` already up to date (exit 0)
Run: `.ai-memory/temp-agents/58-onboarding-quiz-presentation-ui/`

## User Request (Verbatim)

Preview Issues
https://prnt.sc/otB6yUCPfaud

# High Priority Instruction

Okay, let's start with the UI issues in the WB exam. Okay, so first, let's get the latest for all. That's the first thing. Once we have the latest, then I think we can get into the WB exam, what we can improve. Okay. So if we open the UI, the green theme is nice. I like it. But if you look into this, the above portion had too much green. Okay? The border color, what I do, I mean. Before the health, there is a green border, right? It's too much green. Just reduce this, okay, so that it feels nice. It could be on top, it could be bottom also. We can try it out, which one looks nice. And a little bit of shadow. Little shadow at the sections would make it little bit nicer. Okay. Now, coming to the problem, the health, quiz, config, trigger, tools, share, all this, I think, needs to be combined to a dropdown, okay, so that the title is displayed. So many issues when we look into this. So many broken down the UI components, as you can see. Okay, I've given the screenshot. The next problem is also the logo. It'll be Onboarding Quiz, something like this, the name of the application in the future. So based on that, you can actually create a logo and update the logo there as well. Now, coming to the point, green I do like, so it's nice. Okay? But there are broken UI components, as you can see in the UI. Right-hand side, the fields, outline, audit, and config broken. Okay? Also, the all choice and stuff is broken out of it. And then also the item options where the blocks, where the questions actually appear, these sections also broken, you can see. So as I have asked you before, try to have icons so that you can reduce the stuff automatically. Okay? Try to have icons. For example, save and preview have two icons on the top. Try to have icons that would make things a lot more better. Okay. For example, you can have a dropdown config that would actually have this share, copy, update URL, things like that. So it can have a dropdown section that would extend, and then that would show other buttons that these are there. So apply the modern UI/UX concept. Okay? That is missing. Now, if we go into the preview mode, that is very much cracked. Okay? So I've been saying this for a long time, and I want you to write the suspect, write the differences for the other AI-made mistakes. Okay? So this preview should look like a view from white presentation. So you go inside the white presentations or the white presentation repo and see how they present in the left-hand side. The question would be bigger left-hand side, a little bit of subtitle, and then right-hand side, very professional options should be visible. And every time I hover over, I should see nice animation, very nice CSS3 animation sliding in or showcasing what's going on, and probably show an hint as well, every section if we want. Okay, so this is how it needs to be presented, like full screen. Okay? And based on questions, there could be a section where I would have a video, full page, a video on top and bottom. It could ask a question, a small question, and give two options to pick. And based on the option or direction I pick, I would go to another conditional route to proceed further. Okay? So these are the things I want. When the preview is there, some of the buttons you can have, like quiz presentation, you can have in the config section. Try to combine all these two icons and dropdowns buttons so that it actually combines together like a slide view, okay, or presentations view, which you learn from the white presentation. Also, the global PPT, how to present. So all kinds of presentation options we need to have. Okay? The quizzes needs to be very bigger in the screen so that anyone can focus. They could understand their checklist. So I want you to go through the code base and also the previous conversation, try to understand. I complained several times. It didn't follow through. So first, create a big plan. Write this exact what I'm saying into the task, into the plan folders, okay? And then start doing it. Okay, and also the colors. Colors looks terrible. If you see the what does HTML stands for, the preview mode, the above level, the question hash one, it is purple under purple. It's like fully same thing. Sample sequential knowledge quiz, right-hand side. Live preview. Why this is there, I don't know. Okay? The UI/UX concept is terrible. And why the button exactly looks like the background, no idea. Okay? So need to fix all these UI/UX issues. If we go into the golden color of the Rise Up Asia. Again, the Rise Up Asia name should not be there. And again, the name is wrong because Rise Up needs to be written as together, okay? So many mistakes. Now the color that we have, it's like too much of the yellow, which actually makes too much brain fog, okay? The yellow color is very sensitive. It needs to be handled with care and needs to be found on specific cases where we're going to highlight. There could be a lighter yellow color that can be used, which is not used. And also with the Rise Up Asia, there could be other variants. Like this is a little bit navy color we see, right? We can have a VS Code type color where the background is kind of dark like VS Code, but also the color is yellow. So that could be another theme. So think about this, make these themes, okay? Make the UI/UX concept so that there is no overlapping. Try to understand this. Most of the complicated buttons like help, quiz config, these should be combined to one buttons. If we click on it, that would actually expand to other buttons and other stuff. And yellow color, be respectful, do not put it everywhere. It's a highlighter color, so it would use as a brain training where we want people to focus in. Okay, now the buttons part in the Rise Up Asia color. You can see left-hand side from quiz builder, that is a highlighted, selected item. That is again yellow inside yellow. That really looks very terrible, okay? You need to understand the color concept, how the contrast needs to be played, which you can see inside the PowerPoint presentations like global PPT, the BSRM presentation, all the other presentation, you can look into this, how it's presented. Okay? So these are the things we want, okay? But things are not going very well. Okay. Also the presentation, like if you have multiple projects, then how the multiple projects would be displayed. The preview should not be opening like a tab or reducing the space. It should be like a presentation full view if we are in presentation mode. Think about that. Okay? We should be able to change theme and other part. That's correct. But use logo, like theme and then logo. That's it. Don't write too much text, okay? And try to use the tool tip so that everything is professional. Hover over, user can understand what's going on. Think about how to display the quiz question and stuff properly. Is it clear? Can you please follow through all of these items, also I want you to update every decisions you make so that I can share and train other AI models , so write those decisions and learning in the ai-memory and put it reference in what-to-read

# Actionable Items Must Follow Non-Negotiable

1. Write a plan and spec first
2. Get the latest updates for the WB exam UI
3. Reduce excessive green in the UI and add shadows
4. Combine health, quiz, config, trigger, tools, share into a dropdown
5. Create and update the logo for Onboarding Quiz
6. Fix broken UI components and add icons for better navigation
7. Apply modern UI/UX concepts and animations
8. Ensure preview mode is professional and follows presentation standards
9. Address color issues, especially with yellow and purple
10. Combine complex buttons into expandable sections
11. Ensure presentation mode is full view and professional
12. Use tooltips for better user understanding

## Screenshots

![Green builder overflow](assets/screenshots/74-builder-green-overflow.png)

![Purple preview contrast](assets/screenshots/74-preview-purple-contrast.png)

![Riseup yellow builder](assets/screenshots/74-builder-riseup-yellow.png)

![Health toolbar overflow](assets/screenshots/74-health-toolbar-overflow.png)

![Sidebar yellow on yellow](assets/screenshots/74-sidebar-yellow-on-yellow.png)

![Preview Riseup theme](assets/screenshots/74-preview-riseup-theme.png)

## Tasks

| Task-ID | Title | Status |
|---|---|---|
| Task-01 | Pull latest | DONE (already up to date, exit 0) |
| Task-02 | Verbatim plan, spec, decision memory | IN PROGRESS |
| Task-03 | Reduce green bar, add section shadow | PENDING |
| Task-04 | One config menu for health, quiz config, triggers, tools, share | PENDING |
| Task-05 | Onboarding Quiz logo | PENDING |
| Task-06 | Repair right rail and question-type chips with icons | PENDING |
| Task-07 | Full-canvas presentation preview, contrast, yellow restraint, Riseup spelling, VS Code navy theme | PENDING |
| Task-08 | Tooltips on icon controls | PENDING |

## Decisions (training record)

1. Green Choice stays. The thick green rule above Health is reduced to a thin accent, tried on the top edge first, with a light section shadow.
2. Health, Quiz Config, Triggers, Tools, and Share collapse into one config menu so the form title stays visible. Share, copy, and URL update live inside that menu.
3. The product mark in the console is Onboarding Quiz. Theme switching is an icon plus a tooltip, not a long theme name in the header.
4. The brand string is Riseup, one word. "Rise Up" is a mistake.
5. Yellow is a highlighter for the one thing the candidate should focus on. It is not a fill for nav selection, borders, and buttons at the same time.
6. Selected navigation uses a contrasting surface, never yellow text on a yellow fill.
7. Preview presentation is a full view. The question is large on the left with a short subtitle. Options sit on the right. Hover uses a short CSS slide. Optional hints are per section.
8. Purple-on-purple and button-matches-background are contrast defects, not theme features.
9. A second dark theme uses a VS Code-like navy surface with yellow only as the accent.
10. Video-on-top with two choices that branch is in scope as a presentation question layout, wired to the existing branching route.

## Follow-ups

- Multiple-project presentation index is specified with the preview, then implemented in the same run if the runner already has a project list.
