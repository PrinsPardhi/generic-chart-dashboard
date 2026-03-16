import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericChartDashboardComponent } from './generic-chart-dashboard.component';
import { ChartCanvasDirective } from './chart-canvas.directive';

@NgModule({
  imports: [
    CommonModule,
    GenericChartDashboardComponent,
    ChartCanvasDirective,
  ],
  exports: [
    GenericChartDashboardComponent,
    ChartCanvasDirective,
  ],
})
export class GenericChartDashboardModule { }
