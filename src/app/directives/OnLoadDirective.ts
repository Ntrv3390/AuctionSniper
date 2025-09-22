// on-load.directive.ts

import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output
  } from '@angular/core';
  
  @Directive({
    selector: '[onLoad]' // Matches <img onLoad="someFunction($event)">
  })
  export class OnLoadDirective {
    /**
     * Binds a function to the image's load event.
     * You can use it like: <img src="..." (onLoad)="yourMethod($event)" />
     */
    @Output() onLoad = new EventEmitter<Event>();
  
    constructor(private el: ElementRef<HTMLImageElement>) {}
  
    @HostListener('load', ['$event'])
    onImageLoad(event: Event): void {
      this.onLoad.emit(event);
    }
  }
  