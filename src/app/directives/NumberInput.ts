// number-input.directive.ts

import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    SimpleChanges
  } from '@angular/core';
  import { NgControl } from '@angular/forms';
  
  @Directive({
    selector: '[numberInput]'
  })
  export class NumberInputDirective implements OnChanges {
    @Input('numberInput') numberInput: any;
  
    private previousValue: string = '';
  
    constructor(private el: ElementRef, private control: NgControl) {}
  
    ngOnChanges(changes: SimpleChanges): void {
      // You can watch input-bound value changes here if needed
    }
  
    @HostListener('input', ['$event'])
    onInput(event: Event): void {
      const input = event.target as HTMLInputElement;
      const value = input.value;
  
      // Regex: up to 9 digits before decimal, optional decimal, max 2 digits after decimal
      const reg = /^[0-9]{0,9}(\.[0-9]{0,2})?$/;
  
      if (reg.test(value)) {
        this.previousValue = value;
      } else {
        input.value = this.previousValue;
        if (this.control?.control) {
          this.control.control.setValue(this.previousValue);
        }
      }
    }
  }
  