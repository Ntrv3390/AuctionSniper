import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Directive()
export abstract class BasePopoverController<T> implements OnInit, OnDestroy {
  @Input() viewModel!: T;
  @Output() popoverClosed = new EventEmitter<any>();

  protected popoverId?: string;

  constructor(protected popoverCtrl: PopoverController) {}

  ngOnInit(): void {
    this.base_popover_shown();
  }

  ngOnDestroy(): void {
    this.base_popover_hidden();
  }

  /**
   * Equivalent to old base_popover_shown()
   */
  protected base_popover_shown(): void {
    this.popover_shown();
  }

  /**
   * Equivalent to old base_popover_hidden()
   */
  protected base_popover_hidden(): void {
    this.popover_hidden();
  }

  /**
   * Hide the popover
   */
  public async hide(data?: any): Promise<void> {
    this.popoverClosed.emit(data);
    await this.popoverCtrl.dismiss(data, 'close', this.popoverId);
  }

  /**
   * Hooks to override
   */
  protected popover_shown(): void {}
  protected popover_hidden(): void {}
}