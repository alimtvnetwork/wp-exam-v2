# Data Contracts & Navigation Interfaces

Version: 1.0.0
Updated: 2026-09-25
Category: Specification Data Contracts

---

## 1. WordPress Sidebar Navigation Schema

```typescript
export type AdminNavCategory = 'curriculum' | 'delivery' | 'operations' | 'system';

export interface AdminNavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: string;
  category: AdminNavCategory;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'amber';
  tooltip?: string;
}

export interface AdminNavSection {
  title: string;
  category: AdminNavCategory;
  items: AdminNavItem[];
}
```

---

## 2. Field Palette Category Schema

```typescript
export type FieldCategory = 'choice' | 'text' | 'media' | 'verification';

export interface FieldPaletteItem {
  type: FieldType;
  label: string;
  description: string;
  icon: string;
  category: FieldCategory;
  defaultPoints: number;
}
```

---

## 3. Form Field Visual States

```typescript
export interface FieldCardVisualState {
  isDragging: boolean;
  isOver: boolean;
  isExpanded: boolean;
  isAdvancedOpen: boolean;
  isBranchingOpen: boolean;
  hasErrors: boolean;
  errorMessage?: string;
}
```
