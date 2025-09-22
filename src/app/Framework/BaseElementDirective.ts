import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { Utilities } from 'src/app/services/Utilities'; // custom service you create to replace Services.Utilities

export interface IElementDirective {
  initialize(): void;
  render(): void;
}

/**
 * Base class for custom element directives
 * T = Component-specific data type (if needed)
 */
@Directive()
export abstract class BaseElementDirective<T> implements IElementDirective, OnInit {
  @Input() data!: T; // replacing scope-bound properties

  protected element: HTMLElement;

  constructor(
    protected elRef: ElementRef,
    protected renderer: Renderer2,
    protected utilities: Utilities
  ) {
    this.element = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    this.initialize();
    this.render();
  }

  /**
   * Initialize shared data for directive
   */

  public initialize(): void {
    const enums = this.utilities.getValue(this.utilities.globalData, 'Enums');
    const awaitOn = this.utilities.getValue(this.utilities.globalData, 'awaitOn');
  
    (this as any).Enums = enums;
    (this as any).awaitOn = awaitOn;
  }
  
  /**
   * Must be implemented by child directive
   */
  public abstract render(): void;
}
