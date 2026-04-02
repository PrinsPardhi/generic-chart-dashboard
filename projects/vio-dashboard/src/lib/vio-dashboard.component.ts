import {
  ChangeDetectorRef, Component, Input, OnChanges,
  SimpleChanges, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ── Register ALL Chart.js components ONCE at the library root ─────────────────
// This is the single source of truth. No other file in this library should call
// Chart.register(). Doing it here ensures registration happens when the consumer
// imports VioDashboardComponent, before any chart card tries to render.
import {
  Chart,
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
} from 'chart.js';

Chart.register(
  BarController, BarElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
);

import { GenericChartComponent } from './components/generic-chart/generic-chart.component';
import { ChartBuilderComponent }  from './components/chart-builder/chart-builder.component';
import {
  VioDashboardConfig, DashboardRecord, BuilderApiRequest, BuilderApiRow,
} from './models/dashboard.models';

@Component({
  selector: 'vio-dashboard',
  standalone: true,
  imports: [CommonModule, GenericChartComponent, ChartBuilderComponent],
  template: `
    @if (config.drillEnabled) {
      <vio-generic-chart
        [config]="config"
        [records]="drillRecords"
        #drillChart>
      </vio-generic-chart>
    } @else {
      <vio-chart-builder
        [config]="config"
        [apiFn]="resolvedApiFn"
        #builderChart>
      </vio-chart-builder>
    }
  `,
})
export class VioDashboardComponent implements OnChanges {
  @Input() config!: VioDashboardConfig;
  @Input() drillRecords: DashboardRecord[] = [];
  @Input() apiFn?: (url: string, body: BuilderApiRequest) => Promise<BuilderApiRow[]>;

  @ViewChild('drillChart')   drillChart?:   GenericChartComponent;
  @ViewChild('builderChart') builderChart?: ChartBuilderComponent;

  resolvedApiFn: (url: string, body: BuilderApiRequest) => Promise<BuilderApiRow[]> =
    async () => [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apiFn'] && this.apiFn) {
      this.resolvedApiFn = this.apiFn;
    }
    if (changes['drillRecords'] && !changes['drillRecords'].firstChange && this.drillChart) {
      this.drillChart.setRecords(this.drillRecords);
    }
  }

  reloadDrill(records: DashboardRecord[]): void {
    this.drillChart?.setRecords(records);
  }
}
