import {
  ChangeDetectorRef, Component, Input,
  NgZone, OnDestroy, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { AddChartModalComponent, AddChartResult } from '../add-chart-modal/add-chart-modal.component';
import {
  BuilderChart, BuilderApiRequest, BuilderApiRow, ChartSegment,
  VioDashboardConfig, DEFAULT_PALETTES, builderRowsToSegments,
} from '../../models/dashboard.models';

// Note: NO Chart.register() here — registration is centralised in VioDashboardComponent.

@Component({
  selector: 'vio-chart-builder',
  standalone: true,
  imports: [CommonModule, ChartCardComponent, AddChartModalComponent],
  templateUrl: './chart-builder.component.html',
  styleUrls: ['./chart-builder.component.scss'],
})
export class ChartBuilderComponent implements OnInit, OnDestroy {
  @Input() config!: VioDashboardConfig;
  @Input() apiFn!: (url: string, body: BuilderApiRequest) => Promise<BuilderApiRow[]>;

  charts: BuilderChart[] = [];
  segments: Map<string, ChartSegment[]> = new Map();
  showModal    = false;
  editingChart?: BuilderChart;

  get builderCfg() { return this.config.builder!; }
  get palette()    { return this.config.colorPalettes ?? DEFAULT_PALETTES; }

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.builderCfg.initialCharts?.forEach(c => this.addChartInternal({ ...c }));
  }

  ngOnDestroy(): void {}

  openAddModal(): void { this.editingChart = undefined; this.showModal = true; }
  openEditModal(chart: BuilderChart): void { this.editingChart = { ...chart }; this.showModal = true; }
  onModalCancelled(): void { this.showModal = false; this.editingChart = undefined; }

  onModalConfirmed(result: AddChartResult): void {
    this.showModal = false;
    if (this.editingChart) {
      const idx = this.charts.findIndex(c => c.id === this.editingChart!.id);
      if (idx >= 0) {
        this.charts[idx] = { ...result.chart, loading: true };
        this.fetchChartData(result.chart.id);
      }
    } else {
      this.addChartInternal(result.chart);
    }
    this.editingChart = undefined;
    this.cdr.detectChanges();
  }

  removeChart(id: string): void {
    this.segments.delete(id);
    this.charts = this.charts.filter(c => c.id !== id);
  }

  refreshChart(id: string): void {
    const chart = this.charts.find(c => c.id === id);
    if (chart) { chart.loading = true; this.fetchChartData(id); }
  }

  private addChartInternal(chart: BuilderChart): void {
    chart.loading = true;
    chart.data    = [];
    this.charts.push(chart);
    this.fetchChartData(chart.id);
  }

  private async fetchChartData(chartId: string): Promise<void> {
    const chart = this.charts.find(c => c.id === chartId);
    if (!chart) return;
    chart.loading = true;
    chart.error   = undefined;
    this.cdr.detectChanges();
    try {
      const base = typeof this.builderCfg.baseApiBody === 'function'
        ? this.builderCfg.baseApiBody()
        : (this.builderCfg.baseApiBody ?? {});
      const body: BuilderApiRequest = {
        ...base,
        xParam:   chart.xParam.key,
        yParam:   chart.yParam?.key ?? null,
        fromDate: chart.fromDate,
        toDate:   chart.toDate,
      };
      const rows = await this.apiFn(this.builderCfg.apiUrl, body);
      chart.data = rows;
      this.segments.set(chartId, builderRowsToSegments(rows, this.palette));
    } catch (err: any) {
      chart.error = err?.message ?? 'Failed to load chart data.';
      this.segments.set(chartId, []);
    } finally {
      chart.loading = false;
      this.cdr.detectChanges();
    }
  }

  getSegs(id: string): ChartSegment[] { return this.segments.get(id) ?? []; }

  builderSubtitle(chart: BuilderChart): string {
    return `${chart.xParam.label} · ${chart.yParam?.label ?? 'Count'}`;
  }
}
