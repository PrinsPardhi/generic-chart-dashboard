# vio-dashboard — Angular 19 Library

ERP-style analytics dashboard library with two modes + rich per-card toolbars.

## Quick Start

```bash
npm install          # install all dependencies
npm run build:lib    # build the library (required once before serving)
npm start            # serve demo app → http://localhost:4200
```

> **Note:** Always run `npm run build:lib` at least once (or after any library change)
> before `npm start`. The demo app imports from `dist/vio-dashboard`.

---

## Modes

| Mode | `drillEnabled` | Description |
|------|---------------|-------------|
| **Drill** | `true` | Pre-defined charts, cascading cross-filter, table view tab |
| **Builder** | `false` | User adds charts dynamically via modal |

---

## Per-Card Toolbar Features (both modes)

Every chart card has a rich toolbar in the header:

| Feature | Description |
|---------|-------------|
| **Chart type switcher** | Toggle Bar ↔ Doughnut inline — no data refetch |
| **Sort: Label A→Z / Z→A** | Icon buttons to sort legend + chart by label |
| **Sort: Value High→Low / Low→High** | Icon buttons to sort by value |
| **Value / Percent toggle** | `#` / `%` pill button — switches legend + tooltip display |
| **Table view popup** | Modal with full data table, sortable columns, Export Excel button |
| **Expand to full width** | Expands card to span full grid width (col-12), taller canvas |
| **Export Excel** | Downloads `.xlsx` with Label, Value, Percent columns |
| **Save as Image** | Downloads chart canvas as `.png` |
| **Save as PDF** | Downloads chart + title as landscape `.pdf` |

---

## Usage

### DRILL mode

```typescript
config: VioDashboardConfig = {
  drillEnabled: true,
  drill: {
    apiUrl: 'your/api',
    fieldMap: (item) => ({ ...item }),
    chartDefs: [
      { id:'c1', title:'Brand', subtitle:'HPI vs HPE',
        dataKey:'brand', chartType:'doughnut', filterKey:'brand' },
    ],
    columns: [{ key:'brand', display:'Brand', datatype:'string' }],
    kpis: [{ label:'Total', countAll:true, sub:'All records', color:'#1a7f5a' }],
  }
};
```

```html
<vio-dashboard [config]="config" [drillRecords]="records" />
```

### BUILDER mode

```typescript
config: VioDashboardConfig = {
  drillEnabled: false,
  builder: {
    apiUrl: '/api/chart-data',
    showDateRange: true,
    xParams: [{ key:'prodName', label:'Product Name' }],
    yParams: [{ key:'cost',     label:'Repair Cost'  }],
  }
};

apiFn = (url: string, body: any) =>
  this.http.post<{ xValue: string; yValue: number }[]>(url, body).toPromise()!;
```

```html
<vio-dashboard [config]="config" [apiFn]="apiFn" />
```

### Backend contract (Builder mode)

**POST** to `builder.apiUrl`:
```json
{ "xParam": "prodName", "yParam": "cost", "fromDate": "2024-01-01", "toDate": "2024-12-31" }
```
**Response:**
```json
[{ "xValue": "LaserJet Pro", "yValue": 42 }, { "xValue": "OfficeJet", "yValue": 17 }]
```

---

## File Structure

```
vio-workspace/
├── projects/
│   ├── vio-dashboard/src/lib/
│   │   ├── components/
│   │   │   ├── chart-card/          ← Shared card with full toolbar (ALL features here)
│   │   │   ├── generic-chart/       ← DRILL mode (uses chart-card)
│   │   │   ├── chart-builder/       ← BUILDER mode (uses chart-card)
│   │   │   └── add-chart-modal/     ← Builder add/edit modal
│   │   ├── directives/
│   │   ├── models/                  ← All types + utilities
│   │   ├── styles/                  ← Shared design tokens SCSS
│   │   └── vio-dashboard.component.ts  ← Root, switches modes
│   └── demo-app/                    ← Demo with 20 mock records, no backend
```
