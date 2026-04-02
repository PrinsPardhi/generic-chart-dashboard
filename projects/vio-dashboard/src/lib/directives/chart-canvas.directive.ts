import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[vioChartCanvas]',
  standalone: true,
})
export class ChartCanvasDirective {
  constructor(public el: ElementRef<HTMLCanvasElement>) {}
}
