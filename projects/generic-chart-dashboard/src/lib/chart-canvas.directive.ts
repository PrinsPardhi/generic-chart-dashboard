import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[chartCanvas]', standalone: true })
export class ChartCanvasDirective {
  constructor(public el: ElementRef<HTMLCanvasElement>) { }
}
