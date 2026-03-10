# Plan: Reusable Motion Modernization

## TL;DR

> **Quick Summary**: Modernize the admin UI with restrained, reusable motion on shared primitives instead of feature pages.
>
> **Deliverables**:
> - Reusable motion tokens and keyframes in `app/globals.css`
> - Refined motion for shared `Button`, `Card`, `Table`, and `ResponsiveTable` primitives
> - Better feedback for shared loading and empty states
> - Full respect for `prefers-reduced-motion`
>
> **Estimated Effort**: Medium
> **Critical Path**: Motion tokens -> shared primitives -> shared states -> verification

---

## Context

### Product Context
- Internal Club La Victoria admin panel for staff managing members, payments, and pool seasons
- Tone confirmed as restrained, professional, and task-oriented
- Existing motion is CSS-only and subtle (`page-fade`, Radix open/close transitions, loading spinners)

### Why This Scope
- Shared primitives in `components/ui/` propagate improvements across the app
- The app already has several one-off transitions, so the missing piece is consistency rather than more novelty
- Motion must stay professional and non-disruptive for frequent internal use

---

## Objectives

### Core Objective
Make the system feel more modern and responsive through purposeful, low-intensity motion that improves feedback and perceived quality without changing the visual language.

### Concrete Deliverables
- Add timing/easing/motion utility tokens in `app/globals.css`
- Upgrade `components/ui/button.tsx` with better hover/press/focus feedback
- Upgrade `components/ui/card.tsx` with subtle hover lift and surface response
- Upgrade `components/ui/table.tsx` and `components/ui/responsive-table.tsx` with smoother row/card feedback
- Refine `components/ui/loading-state.tsx` and `components/ui/empty-state.tsx` with restrained reveal/delight

### Must Have
- Motion remains transform/opacity/shadow based
- Reduced-motion users get simplified or effectively disabled motion
- Changes stay reusable and centered on shared primitives
- No new runtime animation library
- No redesign of feature pages required to see benefit

### Must NOT Have
- No bounce/elastic easing
- No layout-property animation (`width`, `height`, `top`, `left`, `padding`, `margin`)
- No playful or overly expressive brand animation
- No feature-specific motion pass across many screens

---

## Execution Strategy

1. Add reusable motion tokens in `app/globals.css`
2. Update high-impact shared primitives (`button`, `card`, `table`, `responsive-table`)
3. Refine shared system states (`loading-state`, `empty-state`)
4. Verify changed files with diagnostics and targeted lint

### Task-Level QA Scenarios

#### Task 1 - Motion Tokens
- **Tool**: Read + browser/dev inspection if needed
- **Steps**:
  1. Verify `app/globals.css` defines shared easing, duration, and keyframe tokens
  2. Confirm reduced-motion overrides still exist and remain compatible with new motion utilities
  3. Review new keyframes to ensure they only animate transform and opacity
- **Expected Result**:
  - Motion tokens are centralized and reusable
  - Reduced-motion support still suppresses non-essential animation
  - No layout-property animation is introduced

#### Task 2 - Shared Primitive Motion
- **Tool**: Playwright or browser QA
- **Steps**:
  1. Interact with screens that expose shared buttons, cards, tables, and responsive table cards
  2. Hover and press buttons/cards and inspect table row feedback
  3. Confirm focus visibility remains clear and interaction is not blocked by animation
  4. Confirm motion feels restrained and consistent across shared primitives
- **Expected Result**:
  - Buttons provide subtle hover/press feedback
  - Cards and rows feel more responsive without theatrical movement
  - Focus and usability remain unchanged or improved

#### Task 3 - Shared States
- **Tool**: Playwright or browser QA
- **Steps**:
  1. Trigger loading and empty states in screens using shared state components
  2. Verify loading placeholders reveal cleanly without distracting effects
  3. Verify empty states gain slight polish without competing with page content
  4. Re-test with reduced motion enabled
- **Expected Result**:
  - Loading and empty states feel smoother and more modern
  - Motion remains secondary to content clarity
  - Reduced-motion mode removes or simplifies those effects appropriately

---

## Verification Strategy

- Run `lsp_diagnostics` on all changed files
- Run `npm run lint` after code changes
- Run manual QA for button/card/table/loading/empty states in both normal and reduced-motion modes
- Check that all new motion uses transform/opacity/shadow and does not cause visible layout shift

## Definition of Done

- Shared primitives visibly feel more modern but still restrained
- Hover, press, and reveal behaviors are consistent across core reusable components
- Reduced-motion support remains intact
- Diagnostics are clean and lint passes
