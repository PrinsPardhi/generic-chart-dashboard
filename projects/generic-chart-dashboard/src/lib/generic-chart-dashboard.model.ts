export interface DashboardRecord {
  [key: string]: any;
}

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
}

export interface ChartDefConfig {
  id: string;
  title: string;
  subtitle: string;
  dataKey: string;
  chartType: 'bar' | 'doughnut';
  filterKey: string;
}

export interface KpiConfig {
  label: string;
  statusValue?: string;
  staticValue?: number;
  sub: string;
  color: string;
  countAll?: boolean;
}

export interface ColumnConfig {
  key: string;
  display: string;
  datatype?: 'string' | 'number' | 'date';
}

export interface DashboardConfig {
  pageTitle: string;
  apiUrl: string;
  apiBody?: Record<string, any> | (() => Record<string, any>);

  // Consumer provides their own fetch function
  // Library has zero dependency on any internal service
  apiFn: (url: string, body: any) => Promise<any[]>;

  chartDefs: ChartDefConfig[];
  columns: ColumnConfig[];
  kpis: KpiConfig[];
  fieldMap: (item: any) => DashboardRecord;
  colorPalettes?: Record<string, string[]>;
}

// ── Default palettes ──────────────────────────────────────────────────────────
export const DEFAULT_PALETTES: Record<string, string[]> = {
  default: [
    '#1e6fb5', '#1a7f5a', '#6b4fa8', '#b07d1e', '#2a7f8f',
    '#a84f4f', '#4f7a1e', '#4f5ea8', '#8f5c2a', '#2a6b5e',
    '#7a4fa8', '#5e7a1e', '#a84f7a', '#1e5e8f', '#6b6b1e',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function countBy(
  records: DashboardRecord[],
  key: string,
  palettes: Record<string, string[]> = DEFAULT_PALETTES
): ChartSegment[] {
  const map = new Map<string, number>();
  records.forEach(r => {
    const v = String(r[key] ?? 'Unknown');
    map.set(v, (map.get(v) ?? 0) + 1);
  });
  const palette =
    palettes[key] ?? palettes['default'] ?? DEFAULT_PALETTES['default'];
  let idx = 0;
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      color: palette[idx++ % palette.length],
    }));
}

export function applyFilter(
  records: DashboardRecord[],
  filter: Record<string, string>
): DashboardRecord[] {
  return records.filter(r =>
    Object.entries(filter).every(
      ([key, value]) => String(r[key]) === value
    )
  );
}
