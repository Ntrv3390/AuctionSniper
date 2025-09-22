import { Injectable, Inject } from '@angular/core';
import { LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';
import { PluginsService } from 'src/app/services/Plugins';
import { PreferencesService } from 'src/app/services/Preferences';
import { ConfigurationService } from 'src/app/services/Configuration';
import { SnackbarService } from 'src/app/services/Snackbar';
import moment from 'moment';
import { DialogOptions } from 'src/app/Framework/DialogOptions';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private static openDialogIds: string[] = [];
  private isPinEntryOpen = false;
  private _isSpinnerShown = false;
  private _spinnerHideTimeoutReference: any = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private plugins: PluginsService,
    private preferences: PreferencesService,
    private config: ConfigurationService,
    private snackbar: SnackbarService
  ) {}
  private dialogCloseSubject = new Subject<string | null>();

  /**
   * Observable for dialog components to subscribe to close events.
   */
  dialogClose$ = this.dialogCloseSubject.asObservable();

  async showDialog<TModel, TResult>(component: string, options: DialogOptions<TModel, TResult>): Promise<TResult> {
    // Map component names to actual components
    const componentMap: { [key: string]: any } = {
      'AddWatchController': (await import('../Views/Dialogs/Add-Watch/AddWatchController')).AddWatchComponent,
      'EditSnipeController': (await import('../Views/Dialogs/Edit-Snipe/EditSnipeController')).EditSnipeController,
      'EditSnipe': (await import('../Views/Dialogs/Edit-Snipe/EditSnipeController')).EditSnipeController,
      'PinEntryPage': (await import('../Views/Dialogs/Pin-Entry/PinEntryController')).PinEntryPage,
      'EbayTokenComponent': (await import('../Views/Dialogs/Ebay-Token/EbayTokenController')).EbayTokenController,
      'ErrorDialogController': (await import('../Views/Dialogs/Error/ErrorDialogController')).ErrorDialogController
    };

    const componentClass = componentMap[component];
    if (!componentClass) {
      throw new Error(`Component ${component} not found in component map`);
    }

    // Create modal with the component
    const modal = await this.modalCtrl.create({
      component: componentClass,
      componentProps: options.dialogData as any,
      cssClass: 'error-dialog-modal', // Add CSS class for styling
      breakpoints: [0, 0.5, 0.8, 1], // Configure breakpoints for dialog appearance
      initialBreakpoint: 0.8, // Start at 80% height
      backdropDismiss: options.backdropClickToClose ?? true,
      backdropBreakpoint: 0.5
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    return data;
  }

  activityStart(labelText: string = 'Please Wait...') {
    if (this._isSpinnerShown) {
      const element = this.document.querySelector(".loading-container > .loading > span") as HTMLElement;
      if (element) element.innerText = labelText;
    }

    if (this._spinnerHideTimeoutReference != null) {
      clearTimeout(this._spinnerHideTimeoutReference);
      this._spinnerHideTimeoutReference = null;
      return;
    }

    if (this._isSpinnerShown) return;

    this._isSpinnerShown = true;

    this.loadingCtrl.create({
      message: labelText,
      spinner: 'crescent'
    }).then(loader => loader.present());
  }

  activityStop() {
    if (this._spinnerHideTimeoutReference !== null) return;
    if (!this._isSpinnerShown) return;

    this._spinnerHideTimeoutReference = setTimeout(() => {
      this._spinnerHideTimeoutReference = null;
      this._isSpinnerShown = false;
      this.loadingCtrl.dismiss();
    }, 1000);
  }

  async alert(message: string, title?: string, buttonName: string = 'OK'): Promise<void> {
    try {
      await this.plugins.modals.alert({
        title: title || 'Alert',
        message,
        buttonTitle: buttonName,
      });
    } catch (error) {
      console.error('Failed to show alert dialog, falling back to console:', error);
      // Fallback to console alert
      alert(`${title ? title + ': ' : ''}${message}`);
    }
  }

  async confirm(message: string, title?: string, okBtn = 'Yes', cancelBtn = 'No'): Promise<boolean> {
    try {
      const result = await this.plugins.modals.confirm({
        title: title || 'Confirm',
        message,
        okButtonTitle: okBtn,
        cancelButtonTitle: cancelBtn
      });
      return result.value;
    } catch (error) {
      console.error('Failed to show confirm dialog, falling back to console:', error);
      // Fallback to console confirm
      return confirm(`${title ? title + ': ' : ''}${message}`);
    }
  }

  async prompt(message: string, title?: string, okBtn = 'OK', cancelBtn = 'Cancel', defaultText = '') {
    try {
      return this.plugins.modals.prompt({
        title: title || 'Prompt',
        message,
        okButtonTitle: okBtn,
        cancelButtonTitle: cancelBtn,
        inputPlaceholder: defaultText
      });
    } catch (error) {
      console.error('Failed to show prompt dialog, falling back to console:', error);
      // Fallback to console prompt
      const result = prompt(`${title ? title + ': ' : ''}${message}`, defaultText);
      return {
        value: result || '',
        cancelled: result === null
      };
    }
  }

  async showActions(
    message: string,
    title?: string,
    actions: any[] = []
  ) {
    if (actions.length === 0) {
      actions.push({ title: 'Yes'});
      actions.push({ title: 'No'});
    }
  
    // Ensure actions have the correct structure for Capacitor Dialog plugin
    const formattedActions = actions.map(action => ({
      title: action.title,
      style: action.style || 'DEFAULT'
    }));

    try {
      const result = await this.plugins.modals.showActions({
        title: title || 'Choose',
        message,
        options: formattedActions,
      });
  
      return result?.index != null ? actions[result.index].title : null;
    } catch (error) {
      console.error('Failed to show actions dialog, falling back to console:', error);
      // Fallback to console actions
      const actionTitles = actions.map(a => a.title).join(', ');
      const result = prompt(`${title ? title + ': ' : ''}${message}\n\nOptions: ${actionTitles}`);
      return result;
    }
  }
  
  async showInfoSnackbar(message: string, title?: string) {
    const toast = await this.toastCtrl.create({
      header: title,
      message: message,
      color: 'primary',
      duration: 5000,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async showSuccessSnackbar(message: string, title?: string) {
    const toast = await this.toastCtrl.create({
      header: title,
      message: message,
      color: 'success',
      duration: 5000,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async showErrorSnackbar(message: string, title?: string) {
    const toast = await this.toastCtrl.create({
      header: title,
      message: message,
      color: 'danger',
      duration: 5000,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  public isDialogOpen(dialogId?: string): boolean {
    if (!dialogId) return UIService.openDialogIds.length > 0;
    return UIService.openDialogIds.includes(dialogId);
  }

  public closeAllDialogs(): void {
    // this.plugins.broadcastEvent(Constants.Events.APP_CLOSE_DIALOG, null);
    this.dialogCloseSubject.next(null);
  }

  public closeDialog(dialogId: string): void {
    // this.plugins.broadcastEvent(Constants.Events.APP_CLOSE_DIALOG, dialogId);
    this.dialogCloseSubject.next(dialogId);
  }
  
  async showPinEntryAfterResume(): Promise<void> {
    if (this.isPinEntryOpen) {
      return Promise.reject('DIALOG_ALREADY_OPEN');
    }

    const resumedAt = moment();
    if (
      this.preferences.pin &&
      this.config.lastPausedAt?.isValid() &&
      resumedAt.diff(this.config.lastPausedAt, 'minutes') > this.config.requirePinThreshold
    ) {
      this.isPinEntryOpen = true;

      const model = {
        title: 'PIN Required',
        pin: this.preferences.pin,
        allowCancel: false
      };

      const options = {
        component: 'PinEntryComponent', // You must create this component
        componentProps: { model },
        backdropDismiss: false
      };

      const modal = await this.modalCtrl.create(options);
      await modal.present();
      await modal.onDidDismiss();

      this.isPinEntryOpen = false;
    }
  }
}