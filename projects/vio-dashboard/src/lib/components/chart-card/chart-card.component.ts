import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef,
  EventEmitter, HostListener, Input, NgZone,
  OnChanges, OnDestroy, Output, SimpleChanges, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import Chart type only — registration is handled by VioDashboardComponent
import { Chart } from 'chart.js';

import { ChartSegment } from '../../models/dashboard.models';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export type ChartType   = 'bar' | 'doughnut';
export type SortField   = 'label' | 'value';
export type SortDir     = 'asc'   | 'desc';
export type DisplayMode = 'value' | 'percent';

@Component({
  selector: 'vio-chart-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss'],
})
export class ChartCardComponent implements AfterViewInit, OnChanges, OnDestroy {
  // ── Inputs ─────────────────────────────────────────────────────────────
  @Input() cardId!: string;
  @Input() title!: string;
  @Input() subtitle = '';
  @Input() segments: ChartSegment[] = [];
  @Input() chartType: ChartType = 'bar';
  @Input() selectedLabel?: string;
  @Input() showClearBtn = false;
  @Input() activePill?: string;

  // ── Outputs ────────────────────────────────────────────────────────────
  @Output() clearFilter  = new EventEmitter<string>();
  @Output() segmentClick = new EventEmitter<{ cardId: string; label: string }>();

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  // ── UI state ───────────────────────────────────────────────────────────
  currentType: ChartType   = 'bar';
  displayMode: DisplayMode = 'value';
  sortField:   SortField   = 'value';
  sortDir:     SortDir     = 'desc';
  expanded        = false;
  showTableModal  = false;
  showActionsMenu = false;

  private chartInstance: Chart | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private hostRef: ElementRef,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.hostRef.nativeElement.contains(e.target)) {
      this.showActionsMenu = false;
    }
  }

  ngAfterViewInit(): void {
    this.currentType = this.chartType;
    this.zone.runOutsideAngular(() => setTimeout(() => this.initChart(), 0));
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['chartType'] && !ch['chartType'].firstChange) {
      this.currentType = this.chartType;
    }
    if (this.chartInstance) {
      if (!ch['segments']?.firstChange || ch['selectedLabel']) {
        this.rebuildChart();
      }
    }
  }

  ngOnDestroy(): void { this.chartInstance?.destroy(); }

  // ── Computed ────────────────────────────────────────────────────────────
  get sortedSegments(): ChartSegment[] {
    return [...this.segments].sort((a, b) => {
      const m = this.sortDir === 'asc' ? 1 : -1;
      return this.sortField === 'label'
        ? m * a.label.localeCompare(b.label)
        : m * (a.value - b.value);
    });
  }

  get total(): number { return this.segments.reduce((s, r) => s + r.value, 0); }

  pct(v: number): string {
    return this.total ? ((v / this.total) * 100).toFixed(1) + '%' : '0%';
  }

  displayVal(v: number): string {
    return this.displayMode === 'percent' ? this.pct(v) : String(v);
  }

  // ── Chart type change ───────────────────────────────────────────────────
  onTypeChange(t: ChartType): void {
    this.currentType = t;
    this.rebuildChart();
    this.cdr.detectChanges();
  }

  // ── Sort ────────────────────────────────────────────────────────────────
  setSort(f: SortField, d: SortDir): void {
    this.sortField = f;
    this.sortDir   = d;
    this.rebuildChart();
    this.cdr.detectChanges();
  }

  // ── Display mode ────────────────────────────────────────────────────────
  toggleDisplayMode(): void {
    this.displayMode = this.displayMode === 'value' ? 'percent' : 'value';
    this.rebuildChart();
    this.cdr.detectChanges();
  }

  // ── Expand ──────────────────────────────────────────────────────────────
  toggleExpand(): void {
    this.expanded = !this.expanded;
    setTimeout(() => this.chartInstance?.resize(), 60);
  }

  // ── Table modal ─────────────────────────────────────────────────────────
  openTableModal(): void  { this.showTableModal = true;  this.closeMenu(); }
  closeTableModal(): void { this.showTableModal = false; }

  // ── Actions menu ────────────────────────────────────────────────────────
  toggleMenu(e: MouseEvent): void { e.stopPropagation(); this.showActionsMenu = !this.showActionsMenu; }
  closeMenu(): void { this.showActionsMenu = false; }

  // ── Event emitters ──────────────────────────────────────────────────────
  onClearClick(): void { this.clearFilter.emit(this.cardId); }

  onLegendRowClick(seg: ChartSegment): void {
    this.segmentClick.emit({ cardId: this.cardId, label: seg.label });
  }

  // ── Exports ─────────────────────────────────────────────────────────────
  exportExcel(): void {
    const rows = this.sortedSegments.map(s => ({
      Label: s.label, Value: s.value, Percent: this.pct(s.value),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.title.slice(0, 31));
    XLSX.writeFile(wb, `${this.safeFilename}.xlsx`);
    this.closeMenu();
  }

  exportImage(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `${this.safeFilename}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    this.closeMenu();
  }

  exportPdf(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const img = canvas.toDataURL('image/png');
    const pw  = canvas.width  || 800;
    const ph  = canvas.height || 400;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [pw, ph + 50] });
    pdf.setFontSize(14);
    pdf.text(this.title, 12, 22);
    pdf.setFontSize(10);
    pdf.text(this.subtitle, 12, 38);
    pdf.addImage(img, 'PNG', 0, 46, pw, ph);
    pdf.save(`${this.safeFilename}.pdf`);
    this.closeMenu();
  }

  private get safeFilename(): string {
    return this.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  // ── Chart lifecycle ──────────────────────────────────────────────────────
  private initChart(): void {
    const el = this.canvasRef?.nativeElement;
    if (!el) return;
    this.chartInstance?.destroy();
    this.chartInstance = this.buildInstance(el);
  }

  rebuildChart(): void {
    this.zone.runOutsideAngular(() => {
      const el = this.canvasRef?.nativeElement;
      if (!el) return;
      this.chartInstance?.destroy();
      this.chartInstance = this.buildInstance(el);
    });
  }

  private buildInstance(el: HTMLCanvasElement): Chart {
    const segs    = this.sortedSegments;
    const sel     = this.selectedLabel;
    const isBar   = this.currentType === 'bar';
    const showPct = this.displayMode === 'percent';
    const tot     = this.total;

    return new Chart(el, {
      type: this.currentType,
      data: {
        labels: segs.map(s => s.label),
        datasets: [{
          label: this.title,
          data:  segs.map(s => s.value),
          backgroundColor: segs.map(s => (!sel || s.label === sel) ? s.color : s.color + '38'),
          borderColor:     segs.map(s => (!sel || s.label === sel) ? s.color : s.color + '55'),
          borderWidth: 1.5,
          ...(isBar ? { borderRadius: 5 } : {}),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        onClick: (_e, elements) => {
          if (!elements.length) return;
          const label = segs[elements[0].index]?.label;
          if (label) this.zone.run(() => this.segmentClick.emit({ cardId: this.cardId, label }));
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
                const p   = tot ? ((val / tot) * 100).toFixed(1) : '0';
                return showPct ? ` ${p}%` : ` ${val} (${p}%)`;
              },
            },
          },
        },
        ...(isBar ? {
          scales: {
            x: { ticks: { color: '#4a6a8a', font: { size: 10 }, maxRotation: 30 }, grid: { color: '#1a2d47' } },
            y: { ticks: { color: '#4a6a8a' }, grid: { color: '#1a2d47' }, beginAtZero: true },
          },
        } : {}),
      },
    });
  }

  // Public helpers
  getInstance(): Chart | null               { return this.chartInstance; }
  getCanvas():  HTMLCanvasElement | null    { return this.canvasRef?.nativeElement ?? null; }
}
