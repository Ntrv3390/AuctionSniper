import { Injectable } from '@angular/core';
import { AlertController, ActionSheetController, ModalController } from '@ionic/angular';

/**
 * Provides mock implementation APIs that may not be available on all platforms.
 */
@Injectable({
  providedIn: 'root'
})
export class MockPlatformApis {
  private _instanceCache: Map<string, any> = new Map();

  constructor(
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) {}

  /** 
   * Gets a mock instance from cache, or builds/caches a new one
   */
  private getCachedInstance<T>(id: string, factory: () => T): T {
    if (this._instanceCache.has(id)) {
      return this._instanceCache.get(id);
    }
    const instance = factory();
    this._instanceCache.set(id, instance);
    return instance;
  }

  /** Mock plugin for shared native features (example implementation) */
  public getSharedNativePlugin(): any {
    return this.getCachedInstance('SharedNativePlugin', () => ({
      nsLog: this.noOp,
      firebaseAnalytics_setUserId: this.getAutoSuccessPromiseMethod(),
      firebaseAnalytics_setScreenName: this.getAutoSuccessPromiseMethod(),
      firebaseAnalytics_logEvent: this.getAutoSuccessPromiseMethod(),
      crashlytics_crash: this.getAutoSuccessPromiseMethod(),
      crashlytics_setUserIdentifier: this.getAutoSuccessPromiseMethod(),
      crashlytics_setBoolValue: this.getAutoSuccessPromiseMethod(),
      crashlytics_setStringValue: this.getAutoSuccessPromiseMethod(),
      firebasePushNotifications_getToken: this.getAutoSuccessPromiseMethod({ token: null })
    }));
  }

  /** Mock plugin for Modals supporting alert, confirm, prompt, actions */
  public getModalsPlugin(): any {
    return this.getCachedInstance('ModalsPlugin', () => ({
      addListener: this.noOp,
      requestPermissions: this.noOp,
      alert: (options: { title?: string; message?: string; buttonTitle?: string }) => this.modals_alert(options),
      prompt: (options: { title?: string; message?: string; okButtonTitle?: string; cancelButtonTitle?: string; inputPlaceholder?: string }) => this.modals_prompt(options),
      confirm: (options: { title?: string; message?: string; okButtonTitle?: string; cancelButtonTitle?: string }) => this.modals_confirm(options),
      showActions: (options: { title?: string; message?: string; options?: any[] }) => this.modals_showActions(options)
    }));
  }
  

  // ------- Modals/Popups ----------

  /** Alert Dialog */
  async modals_alert(options: { title?: string; message?: string; buttonTitle?: string }) {
    const alert = await this.alertCtrl.create({
      header: options?.title || 'Alert',
      message: (options?.message || '').replace(/\n/g, '<br/>'),
      buttons: [{ text: options?.buttonTitle || 'OK' }]
    });
    await alert.present();
    await alert.onDidDismiss();
  }

  /** Confirm Dialog */
  async modals_confirm(options: { title?: string; message?: string; okButtonTitle?: string; cancelButtonTitle?: string }) {
    let resolved = false;
    const alert = await this.alertCtrl.create({
      header: options?.title || 'Confirm',
      message: (options?.message || '').replace(/\n/g, '<br/>'),
      buttons: [
        {
          text: options?.okButtonTitle || 'Yes',
          handler: () => { resolved = true; }
        },
        {
          text: options?.cancelButtonTitle || 'No',
          handler: () => { resolved = false; }
        }
      ]
    });
    await alert.present();
    await alert.onDidDismiss();
    return { value: resolved };
  }

  /** Prompt Dialog */
  async modals_prompt(options: { title?: string; message?: string; okButtonTitle?: string; cancelButtonTitle?: string; inputPlaceholder?: string }) {
    let result: string | null = null;
    const alert = await this.alertCtrl.create({
      header: options?.title || 'Prompt',
      message: (options?.message || '').replace(/\n/g, '<br/>'),
      inputs: [{
        name: 'input',
        type: 'text',
        placeholder: options?.inputPlaceholder || ''
      }],
      buttons: [
        {
          text: options?.okButtonTitle || 'Yes',
          handler: (data: any) => { result = data.input; }
        },
        {
          text: options?.cancelButtonTitle || 'No',
          handler: () => { result = null; }
        }
      ]
    });
    await alert.present();
    await alert.onDidDismiss();
    return { value: result, cancelled: result === null };
  }

  /** Action Sheet Dialog */
  async modals_showActions(options: { title?: string; message?: string; options?: any[] }) {
    return new Promise(resolve => {
      this.actionSheetCtrl.create({
        header: options?.title || 'Choose',
        buttons: (options?.options || []).map((action, i) => ({
          text: action.title,
          role: action.style === 'Destructive' ? 'destructive' : (action.style === 'Cancel' ? 'cancel' : undefined),
          handler: () => { resolve({ index: i }); }
        }))
      }).then(sheet => sheet.present());
    });
  }

  // -------- Mocks/Helpers ----------

  /** No-op function for mock plugin methods */
  private noOp(): void {}

  /** 
   * Returns a function that resolves with a value (Promise mock API)
   */
  public getAutoSuccessPromiseMethod<T>(successResult?: T): () => Promise<T> {
    return () => Promise.resolve(successResult as T);
  }

  /**
   * Returns a callback-style function that triggers a success handler with given result.
   */
  public getAutoSuccessCallbackMethod<T>(successResult: T): (successCallback?: (result: T) => void) => void {
    return (successCallback?: (result: T) => void) => {
      if (typeof successCallback === 'function') {
        setTimeout(() => successCallback(successResult), 0);
      }
    };
  }

  /**
   * Returns a callback-style function with a single param and a success callback.
   */
  public getAutoSuccessCallbackMethodWithSingleParam<P, R>(successResult: R): (parameter: P, successCallback?: (result: R) => void) => void {
    return (parameter: P, successCallback?: (result: R) => void) => {
      if (typeof successCallback === 'function') {
        setTimeout(() => successCallback(successResult), 0);
      }
    };
  }

  /**
   * Returns a Node.js style (err, result) callback function
   */
  public getAutoSuccessNodeStyleCallbackMethod<P, R>(successResult: R): (parameter: P, callback?: (error: any, result: R) => void) => void {
    return (parameter: P, callback?: (error: any, result: R) => void) => {
      if (typeof callback === 'function') {
        setTimeout(() => callback(null, successResult), 0);
      }
    };
  }
}
