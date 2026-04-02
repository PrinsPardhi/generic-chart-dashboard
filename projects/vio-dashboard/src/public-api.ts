/*
 * vio-dashboard — Public API Surface
 */

// Root
export { VioDashboardComponent }  from './lib/vio-dashboard.component';

// Sub-components
export { GenericChartComponent }  from './lib/components/generic-chart/generic-chart.component';
export { ChartBuilderComponent }  from './lib/components/chart-builder/chart-builder.component';
export { ChartCardComponent }     from './lib/components/chart-card/chart-card.component';
export { AddChartModalComponent } from './lib/components/add-chart-modal/add-chart-modal.component';

// Directive (no longer needed externally but kept for compatibility)
export { ChartCanvasDirective }   from './lib/directives/chart-canvas.directive';

// Types
export type {
  DashboardRecord, ChartSegment, ColumnConfig, KpiConfig,
  ChartDefConfig, ParamDescriptor, BuilderChart,
  BuilderApiRow, BuilderApiRequest, VioDashboardConfig,
} from './lib/models/dashboard.models';

// Runtime
export {
  DEFAULT_PALETTES, countBy, applyFilter, generateId, builderRowsToSegments,
} from './lib/models/dashboard.models';
