import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Logger } from 'src/app/services/Logger';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';
import { SnackbarService, SnackbarLevel,SnackbarLocation, SnackbarOptions } from 'src/app/services/Snackbar';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { ConfigurationService } from 'src/app/services/Configuration';
import { PluginsService } from 'src/app/services/Plugins';
import { EnglishLocalization } from 'src/app/localization/english';
import { EbayTokenModel } from 'src/app/Views/Dialogs/Ebay-Token/EbayTokenModel';
import {EbayTokenResult } from 'src/app/Views/Dialogs/Ebay-Token/EbayTokenResult';
import { DialogOptions } from 'src/app/Framework/DialogOptions';
import { firstValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular';

import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class EbayService {

  constructor(
    private logger: Logger,
    private preferences: PreferencesService,
    private ui: UIService,
    private snackbar: SnackbarService,
    private api: AuctionSniperApiService,
    private config: ConfigurationService,
    private plugins: PluginsService,
    private platform: Platform,
    private alertController: AlertController,
    private router: Router
  ) {}

  async showAccountDetails(): Promise<void> {
    // Navigate to the eBay token page instead of showing a dialog
    this.router.navigate(['/ebay-token']);
  }

  

  async ensureValidEbayToken(onboarding: boolean, promptIfNearExpiration: boolean): Promise<any> {
    console.log('EbayService: Starting ensureValidEbayToken...');
    this.ui.activityStart('Verifying eBay account connection...');
    let showModal = false;

    try {
      console.log('EbayService: Calling getEbayTokenStatus...');
      const result = await firstValueFrom(this.api.getEbayTokenStatus());
      console.log('EbayService: getEbayTokenStatus completed, result:', result);
      this.ui.activityStop();

      if (!result?.response) {
        console.log('EbayService: No response in result, showing modal');
        this.logger.error('EbayService', 'ensureValidToken', 'Error fetching token status.', { result });
        showModal = true;
      } else {
        console.log('EbayService: Processing token status response:', result.response);
        this.preferences.ebayTokenExpirationDate = result.response.ExpireDate;
        this.preferences.isEbayTokenValid = result.response.IsValid;
        this.preferences.isEbayTokenNull = result.response.IsNull;
      }
  
      if (
        this.preferences.isEbayTokenNull ||
        !this.preferences.isEbayTokenValid ||
        this.isEbayTokenExpired()
      ) {
        showModal = true;
      }
  
      if (showModal) {
        const options = new DialogOptions<EbayTokenModel, EbayTokenResult>({ onboarding });
        options.backdropClickToClose = false;
        options.hardwareBackButtonClose = false;
        const tokenResult: EbayTokenResult = await this.ui.showDialog('EbayTokenComponent', options);
        if (!tokenResult.tokenOk) {
          throw new Error('Invalid or no eBay token present; execution should not continue.');
        }
      } 
      else if (promptIfNearExpiration && this.isEbayTokenNearExpiration()) {
        const message = EnglishLocalization.EbayToken.WillExpireSoonPrompt;
        const title = EnglishLocalization.EbayToken.WillExpireSoonTitle;
        
        const options: SnackbarOptions = {
          message,
          title,
          level: SnackbarLevel.Info,
          actionText: 'Update',
          location: SnackbarLocation.Bottom, // or Top
          autoClose: true                     // or false, depending on your needs
        };
        
        setTimeout(async () => {
          const userAction = await this.snackbar.show(options);
          if (userAction) {
            this.showAccountDetails();
          }
        }, 0);
      }
  
      return {
        IsValid: this.preferences.isEbayTokenValid,
        ExpireDate: this.preferences.ebayTokenExpirationDate,
        IsNull: this.preferences.isEbayTokenNull,
      };
    } catch (error) {
      console.error('EbayService: Error in ensureValidEbayToken:', error);
      this.ui.activityStop();
      this.logger.error('EbayService', 'ensureValidEbayToken', 'Failed to verify eBay token', error);
      throw error;
    }
  }

  isEbayTokenNearExpiration(): boolean {
    const expiration = moment(this.preferences.ebayTokenExpirationDate);
    const buffer = moment().add(90, 'days');
    return expiration.isBefore(buffer);
  }

  isEbayTokenExpired(): boolean {
    const expiration = moment(this.preferences.ebayTokenExpirationDate);
    return expiration.isBefore(moment());
  }

  async requestLinkEbayAccount(): Promise<void> {
    const apiToken = this.preferences.token;
    const baseUrl = this.config.webSiteUrl;
    const navigationUrl = `${baseUrl}/tokenutil/tokengenerate.aspx?version=2&mobile_token=${apiToken}`;

    if (this.platform.is('cordova') || this.platform.is('capacitor')) {
      await this.plugins.browser.open({ url: navigationUrl, presentationStyle: 'popover' });
    
      if (this.platform.is('android')) {
        const alert = await this.alertController.create({
          header: 'Link Account', // replaces `title`
          message: `Once you've finished linking your eBay account, tap continue to verify the connection.`, // replaces `template`
          buttons: [
            {
              text: 'Continue',
              handler: () => {
                // This is where deferral.resolve() would go
                console.log('User tapped continue');
              }
            }
          ]
        });
      
        await alert.present();
      } else {
        const listener = await this.plugins.browser.addListener('browserFinished', () => {
          listener.remove();
        });
      }
    } else {
      window.open(navigationUrl, '_blank', 'location=true,width=500,height=600');
    
      await this.snackbar.show({
        message: 'Click to continue flow...',
        title: 'Developer Message',
        level: SnackbarLevel.Info,
        actionText: 'Continue',
        location: SnackbarLocation.Bottom,
        autoClose: true
      });
    }
    
  }
}
