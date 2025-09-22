import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import {PreferencesService } from 'src/app/services/Preferences';
import {ConfigurationService } from 'src/app/services/Configuration';
import {SnackbarService, SnackbarLevel, SnackbarOptions, SnackbarLocation } from 'src/app/services/Snackbar';
import {DialogButtons } from 'src/app/constants/constants';


@Injectable({ providedIn: 'root' })
export class PayPalService {
  constructor(
    private preferences: PreferencesService,
    private config: ConfigurationService,
    private snackbar: SnackbarService
  ) {}

  async requestPayment(amount: number): Promise<void> {
    const apiToken = this.preferences.token;
    const baseUrl = this.config.webSiteUrl;
    const navigationUrl = `${baseUrl}/mobile-app/paypal-payment.aspx?mobile_token=${apiToken}&amount=${amount}`;

    if (Capacitor.getPlatform() !== 'web') {
      // Native app: open with Capacitor Browser
      await Browser.open({ url: navigationUrl, presentationStyle: 'popover' });
      return new Promise<void>(async (resolve) => {
        const listener = await Browser.addListener('browserFinished', () => {
          listener.remove();
          resolve();
        });
      });
    } else {
      // Web: open in popup
      window.open(navigationUrl, '_blank', 'location=yes,width=500,height=600');
      // await this.snackbar.show('Click to continue flow...', 'Developer Message', 'info', 'Continue');
      // await this.snackbar.show({ message: "Hello", level: SnackbarLevel.Info });
      const options = new SnackbarOptions(
        "Hello",                // message
        "Title here",           // title (or null if optional)
        SnackbarLevel.Info,     // level
        SnackbarLocation.Bottom,// location (example)
        DialogButtons.OK,       // buttons
        false                   // autoClose (example)
      );
      
      await this.snackbar.show(options);
      // await this.snackbar.show({
      //   message: 'Click to continue flow...',
      //   title: 'Developer Message',
      //   level: 'info',
      //   actionLabel: 'Continue',
      // });
    }
  }
}
