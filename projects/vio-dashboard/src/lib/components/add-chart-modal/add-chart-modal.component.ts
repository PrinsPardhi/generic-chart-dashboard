import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BuilderChart, ParamDescriptor, VioDashboardConfig, generateId,
} from '../../models/dashboard.models';

export interface AddChartResult {
  chart: BuilderChart;
}

@Component({
  selector: 'vio-add-chart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-chart-modal.component.html',
  styleUrls: ['./add-chart-modal.component.scss'],
})
export class AddChartModalComponent implements OnInit {
  @Input() config!: VioDashboardConfig;
  @Input() existing?: BuilderChart;
  @Output() confirmed = new EventEmitter<AddChartResult>();
  @Output() cancelled = new EventEmitter<void>();

  title = '';
  selectedXKey = '';
  selectedYKey = '';
  chartType: 'bar' | 'doughnut' = 'bar';
  fromDate = '';
  toDate = '';
  errors: Record<string, string> = {};

  get builderCfg() { return this.config.builder!; }
  get showDateRange() { return this.builderCfg.showDateRange ?? false; }

  ngOnInit(): void {
    if (this.existing) {
      this.title       = this.existing.title;
      this.selectedXKey = this.existing.xParam.key;
      this.selectedYKey = this.existing.yParam?.key ?? '';
      this.chartType   = this.existing.chartType;
      this.fromDate    = this.existing.fromDate ?? '';
      this.toDate      = this.existing.toDate ?? '';
    } else {
      this.selectedXKey = this.builderCfg.xParams[0]?.key ?? '';
    }
  }

  get selectedXParam(): ParamDescriptor | undefined {
    return this.builderCfg.xParams.find(p => p.key === this.selectedXKey);
  }
  get selectedYParam(): ParamDescriptor | null {
    if (!this.selectedYKey) return null;
    return this.builderCfg.yParams.find(p => p.key === this.selectedYKey) ?? null;
  }

  validate(): boolean {
    this.errors = {};
    if (!this.title.trim()) this.errors['title'] = 'Chart name is required.';
    if (!this.selectedXKey) this.errors['x'] = 'Please select an X parameter.';
    if (this.showDateRange && this.fromDate && this.toDate && this.fromDate > this.toDate)
      this.errors['date'] = 'From date must be before To date.';
    return Object.keys(this.errors).length === 0;
  }

  onConfirm(): void {
    if (!this.validate()) return;
    const chart: BuilderChart = {
      id: this.existing?.id ?? generateId(),
      title: this.title.trim(),
      xParam: this.selectedXParam!,
      yParam: this.selectedYParam,
      chartType: this.chartType,
      fromDate: this.fromDate || undefined,
      toDate: this.toDate || undefined,
      loading: true,
    };
    this.confirmed.emit({ chart });
  }

  onCancel(): void { this.cancelled.emit(); }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as Element).classList.contains('modal-overlay')) this.onCancel();
  }
}
