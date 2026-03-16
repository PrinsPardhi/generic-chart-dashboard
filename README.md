# generic-chart-dashboard

> Generic reusable Angular chart dashboard with Chart.js

## Install
```bash
npm install generic-chart-dashboard chart.js
```

## Quick Start
```typescript
import { GenericChartDashboardComponent, DashboardConfig }
  from 'generic-chart-dashboard';

config: DashboardConfig = {
  pageTitle: 'My Dashboard',
  apiUrl: 'api/mydata',
  apiFn: async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  fieldMap: (item) => ({
    status:   item.status,
    customer: item.customerName,
    engineer: item.assignedTo,
  }),
  chartDefs: [
    {
      id: 'c0', title: 'By Status',
      subtitle: 'Open vs Closed',
      dataKey: 'status', chartType: 'doughnut', filterKey: 'status',
    },
  ],
  columns: [
    { key: 'status',   display: 'Status'   },
    { key: 'customer', display: 'Customer' },
  ],
  kpis: [
    { label: 'Total', countAll: true, sub: 'All', color: '#1e6fb5' },
    { label: 'Open',  statusValue: 'Open', sub: 'Pending', color: '#b91c1c' },
  ],
};
```
```html
<app-generic-chart-dashboard [config]="config" />
```

## Peer Dependencies

| Package | Version |
|---|---|
| @angular/core | >= 17 |
| chart.js | >= 4 |
