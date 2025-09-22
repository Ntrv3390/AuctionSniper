import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, ActionSheetController, ToastController, LoadingController } from '@ionic/angular';

// Example service stubs (replace with your own implementations)
import { PluginsService } from 'src/app/services/Plugins';
import { Logger } from 'src/app/services/Logger';

@Component({
  selector: 'app-dev-plugin-tests',
  templateUrl: './dev-plugin-tests.page.html',
  styleUrls: ['./dev-plugin-tests.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevPluginTestsController {

  private _snackbarCounter = 0;

  constructor(
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private plugins: PluginsService,
    private logger: Logger
  ) {}

  //#region BaseController Overrides (placeholder)
  ionViewWillEnter() {
    // Equivalent of view_beforeEnter
    this.view_beforeEnter();
  }

  protected view_beforeEnter(): void {
    this.logger.debug('DevPluginTestsPage', 'view_beforeEnter', 'Page about to enter');
  }
  //#endregion

  //#region Controller Methods - Test Exception Handling

  async testNativeException_click(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Are you sure you want to cause a native crash? This requires Firebase/Crashlytics.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Yes',
          handler: () => this.plugins.sharedNative.crashlytics_crash()
        }
      ]
    });
    await alert.present();
  }

  testJsException_click(): void {
    setTimeout(() => {
      // cause undefined reference
      (window as any)['____asdf'].blah();
    }, 0);
  }

  testAngularException_click(): void {
    (window as any)['____asdf'].blah();
  }

  //#endregion

  //#region Controller Methods - HTTP Progress Bar

  async showFullScreenBlock_click(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Blocking 4 seconds...'
    });
    await loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 4000);
  }

  //#endregion

  //#region Controller Methods - Modals

  async modalsAlert_click(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Alert Title',
      message: 'Alert modal message!',
      buttons: ['Alert Button Text']
    });
    await alert.present();
    await alert.onDidDismiss();

    this.showInfoSnackbar('Alert closed');
  }

  async modalsConfirm_click(): Promise<void> {
    let result = false;
    const alert = await this.alertCtrl.create({
      header: 'Confirm Title',
      message: 'Confirm modal message!',
      buttons: [
        {
          text: 'Negative',
          role: 'cancel',
          handler: () => (result = false)
        },
        {
          text: 'Affirmative',
          handler: () => (result = true)
        }
      ]
    });
    await alert.present();
    await alert.onDidDismiss();
    this.showInfoSnackbar('Result: ' + result);
  }

  async modalsPrompt_click(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Prompt Title',
      inputs: [{ name: 'value', type: 'text', value: 'Default Text Here' }],
      buttons: [
        {
          text: 'Negative',
          role: 'cancel',
          handler: () => {
            this.showInfoSnackbar(`Cancelled: true; Value: null`);
          }
        },
        {
          text: 'Affirmative',
          handler: (data) => {
            this.showInfoSnackbar(`Cancelled: false; Value: ${data.value}`);
          }
        }
      ]
    });
    await alert.present();
  }

  async modalsActionSheet_click(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Action Sheet Title',
      subHeader: 'Action sheet modal message!',
      buttons: [
        { text: 'Affirmative', handler: () => this.showInfoSnackbar('Result: Affirmative') },
        { text: 'Negative', role: 'cancel', handler: () => this.showInfoSnackbar('Result: Negative') },
        { text: 'Kaboom!', role: 'destructive', handler: () => this.showInfoSnackbar('Result: Kaboom!') }
      ]
    });
    await sheet.present();
  }

  //#endregion

  //#region Controller Methods - Snackbar / Toasts

  async snackBar_top(): Promise<void> {
    let message = 'Hello World #' + this._snackbarCounter++;
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'warning'
    });
    await toast.present();
    toast.onDidDismiss().then(() =>
      this.logger.debug('DevPluginTestsPage', 'snackBar_top', 'Snackbar dismissed')
    );
  }

  async snackBar_action(): Promise<void> {
    let message = 'Hello World #' + this._snackbarCounter++;
    const toast1 = await this.toastCtrl.create({
      header: 'Info Title!',
      message,
      duration: 3000,
      position: 'bottom',
      buttons: [{ text: 'View', role: 'info' }]
    });

    const message2 = 'Hello World #' + this._snackbarCounter++;
    const toast2 = await this.toastCtrl.create({
      header: 'Error Title!',
      message: message2,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [{ text: 'View', role: 'info' }]
    });

    toast1.onDidDismiss().then(() =>
      this.logger.debug('DevPluginTestsPage', 'snackBar_action', 'Snackbar 1 dismissed')
    );
    toast2.onDidDismiss().then(() =>
      this.logger.debug('DevPluginTestsPage', 'snackBar_action', 'Snackbar 2 dismissed')
    );

    await toast1.present();
    await toast2.present();
  }

  async snackBar_bottom(): Promise<void> {
    let message = 'Hello World #' + this._snackbarCounter++;
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
    toast.onDidDismiss().then(() =>
      this.logger.debug('DevPluginTestsPage', 'snackBar_bottom', 'Snackbar dismissed')
    );
  }

  //#endregion

  //#region Helpers

  private async showInfoSnackbar(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'primary'
    });
    await toast.present();
  }

  //#endregion
}
