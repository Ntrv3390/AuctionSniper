import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { BaseDialogController } from 'src/app/Framework/BaseDialogController';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { ModalController } from '@ionic/angular';

export interface ErrorDialogData {
  title: string;
  message: string;
  errorDetails?: string;
  isRetryable?: boolean;
}

export interface ErrorDialogResult {
  action: 'retry' | 'close';
}

@Component({
  selector: 'app-error-dialog',
  templateUrl: 'ErrorDialog.html',
  styleUrls: ['ErrorDialog.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon]
})
export class ErrorDialogController extends BaseDialogController<any, ErrorDialogData, ErrorDialogResult> {
  @Input() override dialogData!: ErrorDialogData;

  constructor(modalController: ModalController) {
    super(modalController);
    // Add icons asynchronously to avoid blocking
    try {
      addIcons({ close });
    } catch (error) {
      console.warn('Failed to add icons to error dialog:', error);
    }
  }

  protected createViewModel(): any {
    return {};
  }

  // Getter methods to safely access dialogData properties
  get title(): string {
    return this.dialogData?.title || 'Error';
  }

  get message(): string {
    return this.dialogData?.message || 'An unexpected error occurred.';
  }

  get errorDetails(): string | undefined {
    return this.dialogData?.errorDetails;
  }

  get isRetryable(): boolean | undefined {
    return this.dialogData?.isRetryable;
  }

  async retry(): Promise<void> {
    try {
      await this.close({ action: 'retry' });
    } catch (error) {
      console.error('Error closing dialog with retry action:', error);
      // Fallback: just dismiss the modal
      await this.modalCtrl.dismiss({ action: 'retry' }, 'close', this.dialogId);
    }
  }

  async closeDialog(): Promise<void> {
    try {
      await this.close({ action: 'close' });
    } catch (error) {
      console.error('Error closing dialog:', error);
      // Fallback: just dismiss the modal
      await this.modalCtrl.dismiss({ action: 'close' }, 'close', this.dialogId);
    }
  }
}