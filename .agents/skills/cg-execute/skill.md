---
name: cg-execute
description: Executes coding guidelines refactoring across languages following strict micro-batching and zero-tolerance rules.
---

# Coding Guidelines Execution Skill

## Core Enforcements
1. Function length: 8 lines preferred, 15 lines max.
2. Zero nested if: flatten with guard clauses and early returns.
3. Strict booleans: is* and has* prefixes only, no explicit true checks, no mixed polarity.
4. Line gaps: mandatory blank line before return, after }, before if.
5. Parameter structs: group >3 parameters or adjacent same-type params into *Params structs.
6. Enums: PascalCase enum types with Type suffix, no string unions.
