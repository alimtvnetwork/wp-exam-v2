# Spec 50: Visual Hierarchy, Fluid Animations & UX Layout

Spec Reference: [01-overview.md](./01-overview.md)

## 1. Visual Hierarchy & Spacing Rhythm

### 1.1. Top Command Header
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [FormBuilder]  My Engineering Assessment   ● Live URL   [Copy]  [Open]                  │
│                                                                                        │
│                             [Health: 98% A+]  [Tools ▾]  [Preview ▾]  [Save Form]      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
- **Tools ▾ Dropdown Items:**
  - 📥 Import from Google Forms
  - 🌿 Branching Flow & Logic DAG
  - 📄 Schema JSON Studio
  - 🤖 AI Section Generator
  - 📋 Copy Live Share Link

### 1.2. Senior-Grade Right-Hand Inspector Dock
```text
┌──────────────────────────────────────────┐
│  [  Fields  ]  [  Outline  ]  [ Config ] │
├──────────────────────────────────────────┤
│  🔍 Filter components...                 │
│  [All] [Choice] [Text] [Media]           │
├──────────────────────────────────────────┤
│  Choice & Multi-Select                   │
│  ┌────────────────┐ ┌────────────────┐   │
│  │ ☑️ Multi Choice│ │ 🔘 Single Choice│  │
│  └────────────────┘ └────────────────┘   │
│  ┌────────────────┐ ┌────────────────┐   │
│  │ ⚡ True / False │ │ ▾ Dropdown     │  │
│  └────────────────┘ └────────────────┘   │
│                                          │
│  Text & Inputs                           │
│  ┌────────────────┐ ┌────────────────┐   │
│  │ ✍️ Short Answer│ │ 📝 Paragraph   │  │
│  └────────────────┘ └────────────────┘   │
│  ┌────────────────┐ ┌────────────────┐   │
│  │ ✉️ Email Input │ │ 📞 WhatsApp    │  │
│  └────────────────┘ └────────────────┘   │
│                                          │
│  Media & Advanced                        │
│  ┌────────────────┐ ┌────────────────┐   │
│  │ 🛡️ Regex Text  │ │ 📎 File Upload │  │
│  └────────────────┘ └────────────────┘   │
└──────────────────────────────────────────┘
```

---

## 2. Micro-Interactions & Transitions

1. **Card Hover & Focus:** Palette cards elevate slightly with subtle shadow, primary border accent, and smooth scale (`hover:scale-[1.01] active:scale-[0.99]`).
2. **Tabs Transition:** Radix tabs with clean pill highlight, no jarring layout jumps, smooth height adaptation.
3. **Outline Item Actions:** Hovering an outline item exposes quick move triggers (`↑`, `↓`) and highlights the target index.
4. **Fluid Responsiveness:** On mobile/tablet, the right-hand sidebar flows below the main canvas or collapses into a floating bottom bar. On desktop (`lg:`), it pins cleanly to `sticky top-6`.
