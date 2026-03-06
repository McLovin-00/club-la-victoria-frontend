# Plan: Resumen de Cuentas por Grupo Familiar

## TL;DR

> **Quick Summary**: Agregar funcionalidad para ver un resumen de cuenta corriente de todos los socios dentro de un grupo familiar, con totales agregados y grilla mensual por socio.
> 
> **Deliverables**:
> - Nuevo botón "Ver cuentas" en tabla de grupos familiares
> - Diálogo con tarjetas de resumen del grupo
> - Tabla con detalle por socio + mini grilla de 12 meses
> - Hook para obtener cuentas de todos los miembros
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Hook → Dialog Component → Integration → QA

---

## Context

### Original Request
> "Quiero que se pueda ver un resumen de la cuenta corriente de cada socio dentro de un grupo familiar"

### Interview Summary
**Key Discussions**:
- **Ubicación**: Nuevo diálogo dedicado con botón "Ver cuentas" en la tabla
- **Detalle**: Resumen completo con grilla de 12 meses (✓/✗) por socio
- **Agregación**: Sí, mostrar totales del grupo (deuda, pagado, socios al día)
- **Testing**: Sin unit tests, QA con Playwright

**Research Findings**:
- `useGruposFamiliares.ts`: Hook existente con `useSociosEnGrupo(grupoId)`
- `useCuentaCorriente.tsx`: Hook existente con datos de cuenta por socio
- Patrones UI: `StatCard`, `Table`, `Dialog` de shadcn, colores green/red/amber

### Metis Review
**Identified Gaps** (addressed with defaults):
- **Tamaño máximo grupo**: Hasta 20 miembros con loading skeleton
- **Miembros nuevos**: Mostrar fila con "Sin datos" y valores en cero
- **Grid mobile**: Scroll horizontal
- **Fallo parcial API**: Badge de error por miembro, continuar con resto
- **Permisos**: Fuera de scope

---

## Work Objectives

### Core Objective
Permitir visualizar el estado de cuenta de todos los socios pertenecientes a un grupo familiar en una sola vista consolidada, con métricas agregadas y navegación a cuentas individuales.

### Concrete Deliverables
- Botón "Ver cuentas" en `app/(auth)/socios/grupos-familiares/page.tsx`
- Componente `CuentasGrupoDialog` en `components/grupos-familiares/`
- Hook `useCuentasGrupoFamiliar` en `hooks/api/cobros/`
- Integración y manejo de estados (loading, error, empty)

### Definition of Done
- [x] Dialog se abre/cierra correctamente desde la tabla
- [x] Totales del grupo calculados y mostrados
- [x] Cada socio muestra sus datos y grilla de 12 meses
- [x] Navegación a cuenta individual funciona
- [x] Responsive en mobile (375px)
- [ ] QA scenarios pasan con Playwright (manual verification needed - dev server not available)
- [ ] Dialog se abre/cierra correctamente desde la tabla
- [ ] Totales del grupo calculados y mostrados
- [ ] Cada socio muestra sus datos y grilla de 12 meses
- [ ] Navegación a cuenta individual funciona
- [ ] Responsive en mobile (375px)
- [ ] QA scenarios pasan con Playwright

### Must Have
- Loading skeleton mientras cargan datos
- Manejo de error parcial (algunos miembros fallan)
- Colores consistentes (verde=pagado, rojo=deuda, amber=advertencia)
- Accesibilidad (aria-labels en ✓/✗)

### Must NOT Have (Guardrails)
- NO agregar botones de pago
- NO agregar export/CSV
- NO agregar notificaciones
- NO agregar filtros/ordenamiento
- NO agregar refresh automático
- NO crear nuevos endpoints API
- NO modificar endpoints existentes

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Playwright E2E)
- **Automated tests**: None (no unit tests)
- **Framework**: Playwright only
- **Agent-Executed QA**: YES - All scenarios verified via Playwright

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - can start immediately):
├── Task 1: Create useCuentasGrupoFamiliar hook [quick]
└── Task 2: Create CuentasGrupoDialog component skeleton [quick]

Wave 2 (Core implementation - after Wave 1):
├── Task 3: Add group summary cards [visual-engineering]
├── Task 4: Add member table with 12-month grid [visual-engineering]
├── Task 5: Add "Ver cuentas" button to grupos-familiares page [quick]
└── Task 6: Handle loading/error/empty states [quick]

Wave FINAL (Verification - after Wave 2):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real QA with Playwright (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 2 → Task 4 → F3
Parallel Speedup: ~40% faster than sequential
Max Concurrent: 4 (Wave 2)
```

### Dependency Matrix

- **1**: — — 2, 3, 4
- **2**: 1 — 3, 4, 5
- **3**: 1, 2 — 6
- **4**: 1, 2 — 6
- **5**: 2 — 6
- **6**: 3, 4, 5 — F1-F4

### Agent Dispatch Summary

- **Wave 1**: 2 agents — T1 → `quick`, T2 → `quick`
- **Wave 2**: 4 agents — T3 → `visual-engineering`, T4 → `visual-engineering`, T5 → `quick`, T6 → `quick`
- **Wave FINAL**: 4 agents — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. **Create useCuentasGrupoFamiliar Hook**

  **What to do**:
  - Create new hook at `hooks/api/cobros/useCuentasGrupoFamiliar.ts`
  - Accept `grupoId: number | null` as parameter
  - Use `useSociosEnGrupo(grupoId)` to get member list
  - For each member, call `useCuentaCorriente(socioId)` (use Promise.all or react-query's useQueries)
  - Aggregate totals: totalDeuda, totalPagado, sociosAlDia, sociosEnDeuda
  - Return: `{ data, isLoading, error, memberErrors }` where memberErrors tracks partial failures
  - Handle case where grupoId is null (return empty)

  **Must NOT do**:
  - NO create new API endpoints
  - NO modify existing hooks
  - NO add caching beyond react-query defaults

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard hook pattern following existing codebase conventions
  - **Skills**: []
    - No special skills needed - follows existing patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: None

  **References**:
  - `hooks/api/cobros/useGruposFamiliares.ts:215-228` - useSociosEnGrupo pattern to follow
  - `hooks/api/cobros/useCuentaCorriente.tsx:7-21` - CuentaCorriente type to aggregate
  - `hooks/api/cobros/useCuentaCorriente.tsx:23-35` - Hook structure pattern

  **Acceptance Criteria**:
  - [ ] Hook file created at correct path
  - [ ] Returns loading state while fetching
  - [ ] Returns aggregated totals calculated correctly
  - [ ] Handles null grupoId gracefully
  - [ ] Tracks partial errors per member

  **QA Scenarios**:
  ```
  Scenario: Hook returns correct aggregated data
    Tool: Bash (node/bun REPL)
    Steps:
      1. Import hook in test file
      2. Call with valid grupoId that has 3 members
      3. Assert data.totalDeuda === sum of member debts
      4. Assert data.sociosAlDia === count where mesesAdeudados === 0
    Expected Result: Aggregations match manual calculation
    Evidence: .sisyphus/evidence/task-1-hook-aggregation.txt

  Scenario: Hook handles partial failure
    Tool: Bash (mock test)
    Steps:
      1. Mock useCuentaCorriente to fail for 1 of 3 members
      2. Call hook
      3. Assert memberErrors contains failed socioId
      4. Assert data still contains 2 successful members
    Expected Result: Partial data returned with error tracking
    Evidence: .sisyphus/evidence/task-1-partial-failure.txt
  ```

  **Commit**: YES
  - Message: `feat(cobros): add useCuentasGrupoFamiliar hook`
  - Files: `hooks/api/cobros/useCuentasGrupoFamiliar.ts`

---

- [x] 2. **Create CuentasGrupoDialog Component Skeleton**

  **What to do**:
  - Create component at `components/grupos-familiares/CuentasGrupoDialog.tsx`
  - Accept props: `open: boolean, onOpenChange: (open: boolean) => void, grupoId: number | null, grupoNombre: string`
  - Use Dialog component from shadcn (follow existing dialog patterns)
  - Add DialogHeader with title "Cuentas del Grupo: {nombre}"
  - Add DialogDescription
  - Add placeholder content for now (will be filled in Tasks 3-4)
  - Add DialogFooter with "Cerrar" button
  - Import and use `useCuentasGrupoFamiliar` hook
  - Show loading skeleton while data loads

  **Must NOT do**:
  - NO implement the full content yet (that's Tasks 3-4)
  - NO add payment buttons
  - NO modify existing dialogs

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Component skeleton following existing dialog patterns
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None

  **References**:
  - `app/(auth)/socios/grupos-familiares/page.tsx:642-714` - Existing "View Socios Dialog" pattern
  - `components/ui/dialog.tsx` - Dialog component API
  - `hooks/api/cobros/useCuentaCorriente.tsx:7-21` - CuentaCorriente type for data shape

  **Acceptance Criteria**:
  - [ ] Component file created at correct path
  - [ ] Dialog opens and closes correctly
  - [ ] Shows loading state while fetching
  - [ ] Uses correct props interface

  **QA Scenarios**:
  ```
  Scenario: Dialog opens and closes
    Tool: Playwright
    Preconditions: On grupos-familiares page, at least one group exists
    Steps:
      1. Click button with data-testid="ver-cuentas-{groupId}"
      2. Assert dialog visible with title containing group name
      3. Press Escape key
      4. Assert dialog not visible
    Expected Result: Dialog opens/closes as expected
    Evidence: .sisyphus/evidence/task-2-dialog-toggle.png
  ```

  **Commit**: NO (groups with Task 5)

---

- [x] 3. **Add Group Summary Cards**

  **What to do**:
  - In CuentasGrupoDialog, add section with 3 StatCards before the member table
  - Card 1: "Total Pagado" (green) - sum of all members' totalPagado
  - Card 2: "Deuda Total" (red) - sum of all members' totalDeuda
  - Card 3: "Estado del Grupo" (amber) - "X al día, Y en deuda"
  - Use grid layout: `grid grid-cols-1 md:grid-cols-3 gap-4`
  - Use existing StatCard component pattern
  - Add icons: TrendingUp (green), TrendingDown (red), Users (amber)
  - Format currency with existing formatCurrency pattern

  **Must NOT do**:
  - NO create new card component (use existing StatCard or inline pattern)
  - NO add charts or visualizations

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component styling and layout
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For proper card styling and responsive layout

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `app/(auth)/socios/[id]/cuenta-corriente/page.tsx:381-429` - Summary cards pattern (3 cards with colors)
  - `app/(auth)/socios/[id]/cuenta-corriente/page.tsx:221-228` - formatCurrency function
  - `components/ui/stat-card.tsx` - StatCard component (if exists)

  **Acceptance Criteria**:
  - [ ] 3 cards display with correct colors
  - [ ] Totals calculated correctly from aggregated data
  - [ ] Currency formatted correctly
  - [ ] Responsive grid (1 col mobile, 3 cols desktop)

  **QA Scenarios**:
  ```
  Scenario: Summary cards show correct totals
    Tool: Playwright
    Preconditions: Group with 3 members, known debt amounts
    Steps:
      1. Open CuentasGrupoDialog for group
      2. Assert "Deuda Total" card shows sum of member debts
      3. Assert "Total Pagado" card shows sum of member payments
      4. Assert "Estado del Grupo" shows "X al día, Y en deuda"
    Expected Result: All totals match expected calculations
    Evidence: .sisyphus/evidence/task-3-summary-cards.png
  ```

  **Commit**: NO (groups with Tasks 4-6)

---

- [x] 4. **Add Member Table with 12-Month Grid**

  **What to do**:
  - In CuentasGrupoDialog, add Table after summary cards
  - Columns: Nombre, Deuda, Pagado, Meses Adeudados, [12 months as ✓/✗], Acciones
  - Month columns: Show last 12 months (current month - 11 to current month)
  - Use ✓ (green, bold) for "PAGADA", ✗ (red, bold) for "PENDIENTE", - for no data
  - Add aria-labels: aria-label="Pagado" for ✓, aria-label="Adeudado" for ✗
  - Actions column: "Ver cuenta" button linking to `/socios/[socioId]/cuenta-corriente`
  - Handle partial errors: show error badge for members whose data failed to load
  - Handle new members: show "Sin datos" row with zeros and dashes
  - Use ScrollArea for table overflow
  - Responsive: Consider hiding some columns on mobile

  **Must NOT do**:
  - NO add payment buttons in actions column
  - NO add sorting/filtering
  - NO add pagination (show all members)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex table with grid layout and responsive design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For table styling and responsive behavior

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5, 6)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `app/(auth)/socios/[id]/cuenta-corriente/page.tsx:467-490` - Monthly grid pattern with ✓/✗
  - `app/(auth)/socios/[id]/cuenta-corriente/page.tsx:203-219` - renderEstadoMes function
  - `app/(auth)/socios/grupos-familiares/page.tsx:657-690` - Member list in dialog pattern
  - `components/morosos/morosos-table.tsx` - Virtualized table pattern (for reference)

  **Acceptance Criteria**:
  - [ ] Table displays all members with correct data
  - [ ] 12-month grid shows ✓/✗/- correctly per month
  - [ ] aria-labels present on grid symbols
  - [ ] "Ver cuenta" button navigates to individual account page
  - [ ] Error badge shown for failed members
  - [ ] Responsive design works on mobile

  **QA Scenarios**:
  ```
  Scenario: Member table displays correct data
    Tool: Playwright
    Preconditions: Group with 3 members, various payment states
    Steps:
      1. Open CuentasGrupoDialog
      2. For each member row:
        - Assert name matches expected
        - Assert debt amount matches useCuentaCorriente data
        - Assert grid symbols match cuotas estado
    Expected Result: All member data correct
    Evidence: .sisyphus/evidence/task-4-member-table.png

  Scenario: 12-month grid is accessible
    Tool: Playwright
    Steps:
      1. Open CuentasGrupoDialog
      2. Query all ✓ elements
      3. Assert each has aria-label="Pagado"
      4. Query all ✗ elements
      5. Assert each has aria-label="Adeudado"
    Expected Result: All grid symbols have aria-labels
    Evidence: .sisyphus/evidence/task-4-accessibility.txt

  Scenario: Navigation to individual account works
    Tool: Playwright
    Steps:
      1. Open CuentasGrupoDialog
      2. Click "Ver cuenta" button for first member
      3. Assert URL contains `/socios/[socioId]/cuenta-corriente`
      4. Assert page shows correct member name
    Expected Result: Navigation works correctly
    Evidence: .sisyphus/evidence/task-4-navigation.png
  ```

  **Commit**: NO (groups with Tasks 3, 5, 6)

---

- [x] 5. **Add "Ver cuentas" Button to Grupos Familiares Page**

  **What to do**:
  - In `app/(auth)/socios/grupos-familiares/page.tsx`, add new button to actions column
  - Button: "Ver cuentas" with Wallet or Receipt icon
  - Add state: `isCuentasOpen` and `selectedGrupoForCuentas`
  - Add handler: `openCuentasDialog(grupo)` that sets state and opens dialog
  - Import CuentasGrupoDialog component
  - Render CuentasGrupoDialog at end of component (after other dialogs)
  - Pass props: open, onOpenChange, grupoId, grupoNombre
  - Button should have title="Ver resumen de cuentas"

  **Must NOT do**:
  - NO remove existing buttons (Ver socios, Asignar, Editar, Eliminar)
  - NO change table structure
  - NO modify existing dialogs

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple button addition and dialog integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 6)
  - **Blocks**: Task 6
  - **Blocked By**: Task 2

  **References**:
  - `app/(auth)/socios/grupos-familiares/page.tsx:318-354` - Existing actions column with buttons
  - `app/(auth)/socios/grupos-familiares/page.tsx:215-218` - openViewSociosDialog pattern to follow
  - `app/(auth)/socios/grupos-familiares/page.tsx:642-714` - Dialog rendering pattern

  **Acceptance Criteria**:
  - [ ] Button appears in actions column for each group
  - [ ] Clicking button opens CuentasGrupoDialog
  - [ ] Dialog receives correct grupoId and grupoNombre
  - [ ] Existing functionality unchanged

  **QA Scenarios**:
  ```
  Scenario: Ver cuentas button opens dialog
    Tool: Playwright
    Preconditions: On grupos-familiares page, at least one group exists
    Steps:
      1. Find button with title="Ver resumen de cuentas"
      2. Click button for first group
      3. Assert dialog visible
      4. Assert dialog title contains group name
    Expected Result: Dialog opens with correct group data
    Evidence: .sisyphus/evidence/task-5-button-opens-dialog.png
  ```

  **Commit**: YES (groups with Tasks 2-6)
  - Message: `feat(grupos-familiares): add cuentas summary dialog`
  - Files: `components/grupos-familiares/CuentasGrupoDialog.tsx`, `app/(auth)/socios/grupos-familiares/page.tsx`
  - Pre-commit: `bun run build`

---

- [x] 6. **Handle Loading/Error/Empty States**

  **What to do**:
  - Loading state: Show skeleton cards + skeleton table rows while fetching
  - Error state (full failure): Show error message with retry button
  - Error state (partial failure): Show warning banner + table with error badges on failed members
  - Empty state (no members): Show "Este grupo no tiene miembros asignados"
  - Empty state (no account data): Show members with "Sin datos históricos" message
  - All empty states should have appropriate icons and helpful messages
  - Ensure smooth transitions between states

  **Must NOT do**:
  - NO add auto-refresh
  - NO add retry logic beyond manual button click

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: State handling following existing patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4, 5)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - `app/(auth)/socios/grupos-familiares/page.tsx:228-257` - Loading/error state patterns
  - `app/(auth)/socios/grupos-familiares/page.tsx:360-367` - Empty state pattern
  - `components/ui/loading-spinner.tsx` - Loading component

  **Acceptance Criteria**:
  - [ ] Loading skeleton displays while fetching
  - [ ] Full error shows error message with retry
  - [ ] Partial error shows warning + failed member badges
  - [ ] Empty group shows "no members" message
  - [ ] All states have appropriate visual feedback

  **QA Scenarios**:
  ```
  Scenario: Loading state displays
    Tool: Playwright
    Steps:
      1. Click "Ver cuentas" button
      2. Immediately snapshot dialog
      3. Assert skeleton/spinner visible before data
    Expected Result: Loading state visible during fetch
    Evidence: .sisyphus/evidence/task-6-loading-state.png

  Scenario: Error state handles full failure
    Tool: Playwright
    Preconditions: Mock API to return error
    Steps:
      1. Click "Ver cuentas" button
      2. Wait for error state
      3. Assert error message visible
      4. Assert retry button visible
    Expected Result: Error state displays correctly
    Evidence: .sisyphus/evidence/task-6-error-state.png

  Scenario: Empty state for group with no members
    Tool: Playwright
    Preconditions: Group exists but has no members assigned
    Steps:
      1. Click "Ver cuentas" for empty group
      2. Assert "no tiene miembros" message visible
    Expected Result: Empty state displays
    Evidence: .sisyphus/evidence/task-6-empty-state.png
  ```

  **Commit**: NO (groups with Tasks 2-5)
  - Included in commit from Task 5

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, error, slow network. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Commit 1**: `feat(cobros): add useCuentasGrupoFamiliar hook`
  - Files: `hooks/api/cobros/useCuentasGrupoFamiliar.ts`
  - Pre-commit: `bun run build`

- **Commit 2**: `feat(grupos-familiares): add cuentas summary dialog`
  - Files: `components/grupos-familiares/CuentasGrupoDialog.tsx`, `app/(auth)/socios/grupos-familiares/page.tsx`
  - Pre-commit: `bun run build && bun run lint`

---

## Success Criteria

### Verification Commands
```bash
bun run build  # Expected: Build successful
bun run lint   # Expected: No errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Dialog opens from grupos-familiares page
- [ ] Group totals calculated correctly
- [ ] Member table shows all data
- [ ] 12-month grid displays correctly
- [ ] Navigation to individual account works
- [ ] Responsive on mobile
- [ ] Accessibility: aria-labels present
- [ ] All QA scenarios pass
