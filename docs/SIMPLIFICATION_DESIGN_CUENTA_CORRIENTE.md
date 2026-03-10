# Diseño de Simplificación: Cuenta Corriente de Cobradores

## Principios Aplicados (del skill `distill` + `frontend-design`)

### ❌ Eliminamos:
- Cards anidadas (cards dentro de cards = ruido visual)
- Grillas de cards idénticas (monotonía, sin jerarquía)
- El mismo espaciado en todos lados (falta de ritmo visual)
- Información repetida (headers que repiten intros)
- Todos los botones primarios (usar ghost/secondary/text links)
- Borders decorativos (`border-l-4`) sin propósito funcional
- Backgrounds con opacidad (`bg-*-50/40`) que no sirven jerarquía

### ✅ Aplicamos:
- Ritmo visual con espaciado variado (tight groupings + generous separations)
- Progressive disclosure (empezar simple, revelar complejidad al interactuar)
- Jerarquía clara de botones (UN primary, pocos secondary, resto ghost/links)
- Left-aligned con layouts asimétricos
- Flatten hierarchy (reducir anidamiento, containers innecesarios)
- Una cosa importante a la vez (no TODO visible de una)

---

## ANTES: Estado Actual

### Estructura Visual (262 + 99 + 251 = 612 líneas)

```
┌─────────────────────────────────────────────────────────┐
│ [Card] Selector de Cobrador                             │
│   ┌─────────────────┐  ┌──────────────────────────┐   │
│   │ Cobrador ▼      │  │ ℹ️ Vista enfocada: ...   │   │
│   └─────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Card] Filtros                          [Restablecer]  │
│ ┌──────────────┐  ┌──────────────┐                     │
│ │ Tipo ▼       │  │ Período ▼    │                     │
│ └──────────────┘  └──────────────┘                     │
│                                                         │
│ ▼ Filtros avanzados por fecha                          │
│   ┌──────────────┐  ┌──────────────┐                   │
│   │ Fecha desde  │  │ Fecha hasta  │                   │
│   └──────────────┘  └──────────────┘                   │
│   [Aplicar rango] [Cancelar] "Tenés cambios pendientes"│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Card Grid: 1 + 1.2 fr]                                 │
│ ┌───────────────────┐  ┌─────────────────────────────┐ │
│ │ Saldo actual      │  │ Resumen del período         │ │
│ │ $15,000           │  │             [12 movimientos] │ │
│ │ Balance total...  │  │ ┌─────────────────────────┐ │ │
│ └───────────────────┘  │ │ Comisión   $5,000      │ │ │
│                        │ │ Pago       $3,000      │ │ │
│                        │ │ Ajuste     $200        │ │ │
│                        │ └─────────────────────────┘ │ │
│                        └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Card] Registrar movimiento                             │
│ ┌────────┐ ┌────────┐ ┌────────┐                       │
│ │ Monto  │ │Ref     │ │Obs     │                       │
│ └────────┘ └────────┘ └────────┘                       │
│ [Registrar pago] [Registrar ajuste]                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Card] Movimientos del Período           [12 movs]     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ ▌ Comisión  [COMISION_GENERADA]                     ││
│ │ │ 📅 09/03/2026 14:30  📄 Ref: #1234               ││
│ │ │ ┌──────────────────────────────────────────────┐ ││
│ │ │ │ Socio: García, María                         │ ││
│ │ │ │ Cuotas: 2026-03, 2026-02                     │ ││
│ │ │ └──────────────────────────────────────────────┘ ││
│ │ │                              $2,500              ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ ▌ Pago  [PAGO_A_COBRADOR]                           ││
│ │ │ ...                                               ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│         [◀] [1] [...] [5] [▶]                         │
└─────────────────────────────────────────────────────────┘
```

### Problemas Visuales:
1. **5 Cards** en vertical = monotonía, sin ritmo
2. **Filtros**: Card completa con collapsible = complejidad innecesaria
3. **Resumen**: 2 cards anidadas + 3 items con bordes = ruido visual
4. **Movimientos**: `border-l-4` + `bg-*-50/40` = decoration sin propósito
5. **Botones**: "Registrar pago" y "Registrar ajuste" = misma jerarquía

---

## DESPUÉS: Diseño Simplificado

### Estructura Visual (~120 líneas menos, 40% reducción)

```
┌─────────────────────────────────────────────────────────┐
│ Cobrador: [García, María ▼]                             │  ← Inline, sin card
└─────────────────────────────────────────────────────────┘

                    ⏸  (solo si NO hay cobrador seleccionado)
                    
┌─────────────────────────────────────────────────────────┐
│ Período: [Este mes ▼]  Tipo: [Todos ▼]  [Fechas custom] │  ← Una línea, sin card
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Saldo actual         Comisiones    Pagos      Ajustes  │  ← Una sección, sin cards
│ $15,000              $5,000        $3,000     $200     │     Números grandes, labels chicos
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Nuevo movimiento                                        │
│ [Monto] [Referencia] [Observación]  [Registrar pago ▼]  │  ← Dropdown con acciones
│                                       └ Registrar ajuste│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 12 movimientos                                          │  ← Título + count inline
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Comisión generada                              +$2,500  │  ← Sin border-l, sin bg
│ 09/03/2026 · Ref #1234                                 │     Info directa
│ García, María · Cuotas: 2026-03, 2026-02               │
│                                                         │
│─────────────────────────────────────────────────────────│
│                                                         │
│ Pago al cobrador                               -$3,000  │  ← Línea divisoria sutil
│ 08/03/2026 · Transferencia bancaria                    │     en lugar de borders
│                                                         │
│─────────────────────────────────────────────────────────│
│                                                         │
│ Ajuste de saldo                                 +$200   │
│ 07/03/2026                                              │
│ Corrección por error en cómputo                        │
│                                                         │
└─────────────────────────────────────────────────────────┘

              [◀] 1 ... 5 [▶]                           ← Paginación minimalista
```

---

## Cambios Específicos por Componente

### 1. Selector de Cobrador
**ANTES**: Card con padding + hint box  
**DESPUÉS**: Label + Select inline (una línea)

```tsx
// ANTES: 113-142 (30 líneas con Card)
<Card className="py-3">
  <CardContent>
    <Label>Cobrador</Label>
    <Select>...</Select>
    <div>hint text</div>
  </CardContent>
</Card>

// DESPUÉS: ~10 líneas
<div className="flex items-center gap-4">
  <Label>Cobrador</Label>
  <Select>...</Select>
</div>
```

### 2. Filtros
**ANTES**: Card completa (262 líneas) con collapsible, pending changes  
**DESPUÉS**: Una línea horizontal (~40 líneas)

```tsx
// ANTES: Card + 2 selects + collapsible + pending changes logic
// DESPUÉS: 
<div className="flex items-center gap-3 flex-wrap">
  <Select value={period} onChange={...}>
    <SelectTrigger className="w-32">Este mes</SelectTrigger>
  </Select>
  
  <Select value={tipo} onChange={...}>
    <SelectTrigger className="w-40">Todos</SelectTrigger>
  </Select>
  
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm">Fechas custom</Button>
    </PopoverTrigger>
    <PopoverContent>date pickers</PopoverContent>
  </Popover>
  
  {hasFilters && (
    <Button variant="ghost" size="sm" onClick={clearFilters}>
      Limpiar
    </Button>
  )}
</div>
```

**Principio**: Progressive disclosure - fechas custom solo cuando se necesitan.

### 3. Resumen
**ANTES**: 2 cards anidadas (99 líneas)  
**DESPUÉS**: Una sección con 4 métricas (~30 líneas)

```tsx
// ANTES: Card grid [1fr + 1.2fr] con items con borders
// DESPUÉS:
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">Saldo actual</p>
    <p className="text-3xl font-bold tabular-nums">$15,000</p>
  </div>
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">Comisiones</p>
    <p className="text-2xl font-semibold text-green-700 tabular-nums">$5,000</p>
  </div>
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">Pagos</p>
    <p className="text-2xl font-semibold text-blue-700 tabular-nums">$3,000</p>
  </div>
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">Ajustes</p>
    <p className="text-2xl font-semibold text-orange-700 tabular-nums">$200</p>
  </div>
</div>
```

**Principio**: Flatten hierarchy - sin containers innecesarios, solo datos.

### 4. Registrar Movimiento
**ANTES**: 2 botones sin jerarquía  
**DESPUÉS**: Dropdown con acciones (1 primary, 1 secondary)

```tsx
// ANTES:
<Button variant="outline">Registrar pago</Button>
<Button>Registrar ajuste</Button>

// DESPUÉS:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>
      Registrar pago
      <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handlePago}>
      <CreditCard className="mr-2 h-4 w-4" />
      Registrar pago
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleAjuste}>
      <RefreshCw className="mr-2 h-4 w-4" />
      Registrar ajuste
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Principio**: Jerarquía clara - una acción principal visible, secundaria en dropdown.

### 5. Lista de Movimientos
**ANTES**: Card con items con `border-l-4` + `bg-*-50/40` + iconos + badges  
**DESPUÉS**: Lista limpia con separadores sutiles

```tsx
// ANTES: border-l-4 + bg-green-50/40 + icon + badge + nested border box
// DESPUÉS:
<div className="space-y-0 divide-y divide-border">
  {movimientos.map((mov) => (
    <div key={mov.id} className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium">{config.label}</p>
            <span className="text-xs text-muted-foreground">
              {formatDate(mov.createdAt)}
            </span>
          </div>
          
          {mov.referencia && (
            <p className="text-sm text-muted-foreground">
              Ref: {mov.referencia}
            </p>
          )}
          
          {mov.observacion && (
            <p className="text-sm text-muted-foreground mt-1">
              {mov.observacion}
            </p>
          )}
          
          {mov.detalleCobro && (
            <p className="text-xs text-muted-foreground mt-1">
              {mov.detalleCobro.socio && `${mov.detalleCobro.socio.apellido}, ${mov.detalleCobro.socio.nombre}`}
              {mov.detalleCobro.cuotas.length > 0 && ` · ${mov.detalleCobro.cuotas.map(c => c.periodo).join(', ')}`}
            </p>
          )}
        </div>
        
        <p className={`text-lg font-semibold tabular-nums shrink-0 ${config.color}`}>
          {config.sign}{formatCurrency(mov.monto)}
        </p>
      </div>
    </div>
  ))}
</div>
```

**Principio**: Remove visual noise - borders y backgrounds sin propósito = eliminar.

---

## Comparación de Líneas de Código

| Componente | ANTES | DESPUÉS | Reducción |
|------------|-------|---------|-----------|
| Selector | 30 | 10 | -67% |
| Filtros | 262 | 40 | -85% |
| Resumen | 99 | 30 | -70% |
| Registrar | 44 | 30 | -32% |
| Lista | 251 | 180 | -28% |
| **TOTAL** | **686** | **290** | **-58%** |

---

## Ritmo Visual (Spacing)

### ANTES (monótono):
```
Card (space-y-6)
  └─ Card (space-y-6)
      └─ Card (space-y-6)
          └─ Card (space-y-6)
              └─ Card (space-y-6)
```
**Problema**: Todo tiene el mismo espaciado = sin jerarquía, monótono

### DESPUÉS (variado):
```
Selector (mb-4)              ← Tight
Filtros (mb-8)               ← Generous
Resumen (mb-12)              ← More generous (sección importante)
Registrar (mb-6)             ← Medium
Lista (mt-8)                 ← Generous
  └─ Items (divide-y)        ← Tight (relacionados)
```
**Principio**: Ritmo visual con espaciado variado crea jerarquía implícita.

---

## Paleta de Colores Simplificada

### ANTES:
- Verde: `text-green-700`, `bg-green-50/40`, `border-l-green-600`
- Azul: `text-blue-700`, `bg-blue-50/40`, `border-l-blue-600`
- Naranja: `text-orange-700`, `bg-orange-50/40`, `border-l-orange-500`

### DESPUÉS:
- Verde: `text-green-700` (solo texto, sin bg/border)
- Azul: `text-blue-700` (solo texto)
- Naranja: `text-orange-700` (solo texto)

**Principio**: Reducir paleta = menos ruido visual. Colores en texto, no en containers.

---

## Tipografía (Jerarquía Clara)

### ANTES:
- Labels: `text-sm font-medium`
- Valores: `text-lg font-semibold`
- Todo con badges y borders

### DESPUÉS:
- Labels: `text-xs uppercase tracking-wide text-muted-foreground` (más pequeño, más contraste)
- Valores principales: `text-3xl font-bold tabular-nums` (grande, impactante)
- Valores secundarios: `text-2xl font-semibold tabular-nums`
- Montos en lista: `text-lg font-semibold tabular-nums`

**Principio**: Jerarquía tipográfica fuerte = no necesita borders/badges.

---

## Próximos Pasos

¿Este diseño te parece bien? Si sí, procedo a implementar:

1. ✅ **Selector** → Inline sin card
2. ✅ **Filtros** → Una línea con progressive disclosure
3. ✅ **Resumen** → Sección simple con 4 métricas
4. ✅ **Registrar** → Dropdown con jerarquía
5. ✅ **Lista** → Clean con divide-y, sin borders decorativos

¿Algún ajuste antes de implementar?
