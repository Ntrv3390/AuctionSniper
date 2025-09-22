
import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * Generic Base Dialog Component
 * V = ViewModel type (if needed)
 * D = Data passed to dialog
 * R = Result type returned from dialog
 */
@Directive()
export abstract class BaseDialogController<V, D, R> implements OnInit, OnDestroy {
  @Input() dialogId!: string;
  @Input() dialogData!: D;

  @Output() dialogClosed = new EventEmitter<R | undefined>();

  protected viewModel!: V;

  constructor(protected modalCtrl: ModalController) {}

  // Equivalent to modal_shown()
  ngOnInit(): void {
    this.viewModel = this.createViewModel();
    this.dialog_shown();
  }

  // Equivalent to modal_hidden()
  ngOnDestroy(): void {
    this.dialog_hidden();
  }

  /**
   * Create the ViewModel instance
   * Similar to passing ViewModelType in constructor in Ionic 1
   */
  protected abstract createViewModel(): V;

  /**
   * Get data passed to the dialog
   */
  public getData(): D {
    return this.dialogData;
  }

  /**
   * Close the dialog with optional result
   */
  public async close(result?: R): Promise<void> {
    this.dialogClosed.emit(result);
    await this.modalCtrl.dismiss(result, 'close', this.dialogId);
  }

  /**
   * Called when dialog is shown
   */
  protected dialog_shown(): void {
    // Override in subclass
  }

  /**
   * Called when dialog is hidden
   */
  protected dialog_hidden(): void {
    // Override in subclass
  }
}
