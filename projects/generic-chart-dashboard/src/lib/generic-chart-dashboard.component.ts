import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ChangeDetectorRef, NgZone, Input,
  QueryList, ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart,
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
} from 'chart.js';
import {
  DashboardRecord, DashboardConfig, ChartDefConfig,
  ChartSegment, countBy, applyFilter,
} from './generic-chart-dashboard.model';
import { ChartCanvasDirective } from './chart-canvas.directive';
import { FormsModule } from '@angular/forms';

Chart.register(
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend
);

@Component({
  selector: 'app-generic-chart-dashboard',
  standalone: true,
  imports: [CommonModule, ChartCanvasDirective, FormsModule],
  templateUrl: './generic-chart-dashboard.component.html',
  styleUrl: './generic-chart-dashboard.component.scss',
})
export class GenericChartDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @Input() config!: DashboardConfig;

  @ViewChildren(ChartCanvasDirective)
  canvases!: QueryList<ChartCanvasDirective>;

  // ── State ─────────────────────────────────────────────────────────────────
  private allRecords: DashboardRecord[] = [];
  private instances: (Chart | null)[] = [];

  filter: Record<string, string> = {};
  selections: Record<string, string> = {};
  chartSegments: ChartSegment[][] = [];
  tableRows: DashboardRecord[] = [];
  tableData: DashboardRecord[] = [];
  kpis: { label: string; value: number; sub: string; color: string }[] = [];

  kpiOpen = true;
  showTable = true;
  isLoading = false;
  activeTab: 'charts' | 'table' = 'charts';

  searchTerm: string = '';
  sortKey: string = '';
  sortDir: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  pageSize: number = 10;
  private filteredRows: DashboardRecord[] = [];


  // ── Lifecycle ─────────────────────────────────────────────────────────────
  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) { }

  ngOnInit(): void {
    this.instances = Array(this.config.chartDefs.length).fill(null);
    this.chartSegments = Array.from(
      { length: this.config.chartDefs.length }, () => []
    );
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.canvases.changes.subscribe(() => {
      this.zone.runOutsideAngular(() => this.initCharts());
    });
  }

  ngOnDestroy(): void {
    this.instances.forEach(c => c?.destroy());
    this.instances = [];
  }

  // ── API ───────────────────────────────────────────────────────────────────
  loadData = async () => {
    this.isLoading = true;
    this.showTable = false;

    try {
      const body = typeof this.config.apiBody === 'function'
        ? this.config.apiBody()
        : (this.config.apiBody ?? {});

      // Caller provides apiFn — library has no HTTP dependency
      const raw = await this.config.apiFn(this.config.apiUrl, body);

      this.allRecords = Array.isArray(raw)
        ? raw.map((item: any) => this.config.fieldMap(item))
        : [];

      this.recompute();
      this.showTable = true;
      this.isLoading = false;
      this.cdr.detectChanges();

      this.zone.runOutsideAngular(() => {
        setTimeout(() => this.initCharts(), 0);
      });

    } catch (err) {
      console.error('[GenericChartDashboard] loadData error:', err);
      this.isLoading = false;
      this.showTable = true;
      this.cdr.detectChanges();
    }
  }

  // ── Recompute ─────────────────────────────────────────────────────────────
  private recompute(): void {
    const recs = applyFilter(this.allRecords, this.filter);
    this.tableRows = recs;
    this.tableData = recs;
    this.chartSegments = this.config.chartDefs.map(def =>
      countBy(recs, def.dataKey, this.config.colorPalettes)
    );
    this.kpis = this.config.kpis.map(k => ({
      label: k.label,
      sub: k.sub,
      color: k.color,
      value: k.countAll
        ? this.allRecords.length
        : k.staticValue !== undefined
          ? k.staticValue
          : this.allRecords.filter(r => r['status'] === k.statusValue).length,
    }));

    // ← Reset table state on every filter change
    this.searchTerm = '';
    this.currentPage = 1;
    this.sortKey = '';
    this.sortDir = 'asc';
    this.filteredRows = [...recs];
  }

  // ── Chart init ────────────────────────────────────────────────────────────
  private initCharts(): void {
    this.config.chartDefs.forEach((def, i) => {
      if (this.instances[i]) return;
      const el = this.canvasEl(i);
      if (el) this.instances[i] = this.createChart(el, def, i);
    });
  }

  private createChart(
    el: HTMLCanvasElement,
    def: ChartDefConfig,
    idx: number
  ): Chart {
    const segs = this.chartSegments[idx] ?? [];
    const isBar = def.chartType === 'bar';

    return new Chart(el, {
      type: def.chartType,
      data: {
        labels: segs.map(s => s.label),
        datasets: [{
          label: def.title,
          data: segs.map(s => s.value),
          backgroundColor: segs.map(s => s.color),
          borderColor: segs.map(s => s.color),
          borderWidth: 1.5,
          ...(isBar ? { borderRadius: 5 } : {}),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        onClick: (_e, elements) => {
          if (!elements.length) return;
          this.zone.run(() =>
            this.onSegmentClick(idx, elements[0].index)
          );
        },
        plugins: {
          legend: {
            display: !isBar,
            labels: { color: '#7a99c2', font: { size: 11 }, padding: 14 },
          },
          tooltip: {
            callbacks: {
              label: (ctx): string => {
                const val = Number(isBar ? ctx.parsed.y : ctx.parsed);
                const data = ctx.chart.data.datasets[0].data as number[];
                const total = data.reduce(
                  (a, b) => a + (b as number), 0
                );
                const pct = total
                  ? ((val / total) * 100).toFixed(1)
                  : '0';
                return ` ${val} (${pct}%)`;
              },
            },
          },
        },
        ...(isBar ? {
          scales: {
            x: {
              ticks: {
                color: '#4a6a8a',
                font: { size: 10 },
                maxRotation: 30,
              },
              grid: { color: '#e5e9ef' },
            },
            y: {
              ticks: { color: '#4a6a8a' },
              grid: { color: '#e5e9ef' },
              beginAtZero: true,
            },
          },
        } : {}),
      },
    });
  }

  private refreshChart(idx: number): void {
    const chart = this.instances[idx];
    if (!chart) return;
    const segs = this.chartSegments[idx] ?? [];
    const def = this.config.chartDefs[idx];
    const selected = this.selections[def.id];
    const ds = chart.data.datasets[0];
    chart.data.labels = segs.map(s => s.label);
    ds.data = segs.map(s => s.value);
    ds.backgroundColor = segs.map(s =>
      !selected || s.label === selected ? s.color : s.color + '38'
    );
    ds.borderColor = segs.map(s =>
      !selected || s.label === selected ? s.color : s.color + '55'
    );
    chart.update('none');
  }

  private refreshAllCharts(): void {
    this.config.chartDefs.forEach((_, i) => this.refreshChart(i));
  }

  // ── Interactions ──────────────────────────────────────────────────────────
  onSegmentClick(chartIdx: number, segIdx: number): void {
    const def = this.config.chartDefs[chartIdx];
    const segment = this.chartSegments[chartIdx]?.[segIdx];
    if (!segment) return;
    if (this.selections[def.id] === segment.label) {
      delete this.filter[def.filterKey];
      delete this.selections[def.id];
    } else {
      this.filter[def.filterKey] = segment.label;
      this.selections[def.id] = segment.label;
    }
    this.recompute();
    this.refreshAllCharts();
    this.cdr.detectChanges();
  }

  onLegendClick(chartIdx: number, segment: ChartSegment): void {
    const idx = this.chartSegments[chartIdx]
      ?.findIndex(s => s.label === segment.label);
    if (idx !== undefined && idx >= 0) {
      this.onSegmentClick(chartIdx, idx);
    }
  }

  clearOneFilter(chartId: string): void {
    const def = this.config.chartDefs.find(d => d.id === chartId);
    if (!def) return;
    delete this.filter[def.filterKey];
    delete this.selections[chartId];
    this.recompute();
    this.refreshAllCharts();
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.filter = {};
    this.selections = {};
    this.recompute();
    this.refreshAllCharts();
    this.cdr.detectChanges();
  }

  onTabChange(tab: 'charts' | 'table'): void {
    this.activeTab = tab;
    this.showTable = false;
    setTimeout(() => { this.showTable = true; }, 0);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private canvasEl(i: number): HTMLCanvasElement | null {
    return this.canvases?.toArray()[i]?.el?.nativeElement ?? null;
  }

  get activeFilterCount(): number {
    return Object.keys(this.filter).length;
  }

  get activeSelections(): { id: string; title: string; label: string }[] {
    return Object.entries(this.selections).map(([id, label]) => ({
      id, label,
      title: this.config.chartDefs.find(d => d.id === id)?.title ?? id,
    }));
  }

  get allRecordsCount(): number {
    return this.allRecords.length;
  }

  get pagedRows(): DashboardRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const pages: number[] = [];

    for (let i = Math.max(1, current - delta);
      i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  get paginationInfo(): string {
    const total = this.filteredRows.length;
    if (total === 0) return '0 records';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `${start}–${end} of ${total} records`;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyTableFilter();
  }

  sortBy(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
    this.applyTableFilter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  private applyTableFilter(): void {
    let rows = [...this.tableRows];

    // Search across all columns
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      rows = rows.filter(r =>
        this.config.columns.some(col =>
          String(r[col.key] ?? '').toLowerCase().includes(term)
        )
      );
    }

    // Sort
    if (this.sortKey) {
      rows.sort((a, b) => {
        const av = String(a[this.sortKey] ?? '');
        const bv = String(b[this.sortKey] ?? '');
        return this.sortDir === 'asc'
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      });
    }

    this.filteredRows = rows;
  }

}
