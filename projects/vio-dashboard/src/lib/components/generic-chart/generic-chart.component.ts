import {
  ChangeDetectorRef, Component, Input,
  NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import {
  DashboardRecord, ChartSegment, VioDashboardConfig,
  applyFilter, countBy, DEFAULT_PALETTES,
} from '../../models/dashboard.models';

// Note: NO Chart.register() here — registration is centralised in VioDashboardComponent.

@Component({
  selector: 'vio-generic-chart',
  standalone: true,
  imports: [CommonModule, ChartCardComponent],
  templateUrl: './generic-chart.component.html',
  styleUrls: ['./generic-chart.component.scss'],
})
export class GenericChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() config!: VioDashboardConfig;
  @Input() records: DashboardRecord[] = [];

  filter: Record<string, string>   = {};
  selections: Record<string, string> = {};
  chartSegments: ChartSegment[][]  = [];
  tableRows: DashboardRecord[]     = [];
  kpis: { label: string; value: number; sub: string; color: string }[] = [];
  activeTab: 'charts' | 'table'   = 'charts';
  showTable = true;

  get drillCfg() { return this.config.drill!; }
  get palette()  { return this.config.colorPalettes ?? DEFAULT_PALETTES; }

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.chartSegments = Array.from({ length: this.drillCfg.chartDefs.length }, () => []);
    this.recompute();
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['records'] && !ch['records'].firstChange) this.setRecords(this.records);
  }

  ngOnDestroy(): void {}

  setRecords(records: DashboardRecord[]): void {
    this.filter     = {};
    this.selections = {};
    this.records    = records;
    this.recompute();
    this.cdr.detectChanges();
  }

  private recompute(): void {
    const recs = applyFilter(this.records, this.filter);
    this.tableRows     = recs;
    this.chartSegments = this.drillCfg.chartDefs.map(def =>
      countBy(recs, def.dataKey, this.palette)
    );
    this.kpis = this.drillCfg.kpis.map(k => ({
      label: k.label, sub: k.sub, color: k.color,
      value: k.countAll
        ? this.records.length
        : k.staticValue !== undefined
          ? k.staticValue
          : this.records.filter(r => r['status'] === k.statusValue).length,
    }));
  }

  onSegmentClick(defId: string, label: string): void {
    const def = this.drillCfg.chartDefs.find(d => d.id === defId);
    if (!def) return;
    if (this.selections[defId] === label) {
      delete this.filter[def.filterKey];
      delete this.selections[defId];
    } else {
      this.filter[def.filterKey] = label;
      this.selections[defId]     = label;
    }
    this.recompute();
    this.cdr.detectChanges();
  }

  clearOneFilter(chartId: string): void {
    const def = this.drillCfg.chartDefs.find(d => d.id === chartId);
    if (!def) return;
    delete this.filter[def.filterKey];
    delete this.selections[chartId];
    this.recompute();
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    this.filter     = {};
    this.selections = {};
    this.recompute();
    this.cdr.detectChanges();
  }

  onTabChange(tab: 'charts' | 'table'): void {
    this.activeTab = tab;
    this.showTable = false;
    setTimeout(() => { this.showTable = true; }, 0);
  }

  get activeFilterCount(): number { return Object.keys(this.filter).length; }

  get activeSelections(): { id: string; title: string; label: string }[] {
    return Object.entries(this.selections).map(([id, label]) => ({
      id, label,
      title: this.drillCfg.chartDefs.find(d => d.id === id)?.title ?? id,
    }));
  }
}
