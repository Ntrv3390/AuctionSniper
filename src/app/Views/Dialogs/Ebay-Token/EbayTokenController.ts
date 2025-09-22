import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';
import { from, firstValueFrom } from 'rxjs';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AppEvents } from 'src/app/constants/constants';
import { Logger } from 'src/app/services/Logger';
import { EbayService } from 'src/app/services/Ebay';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { TrackerService } from 'src/app/services/Tracker';
import { NavigatorService } from 'src/app/services/Navigator';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { IconPanelComponent } from 'src/app/directives/Icon-Panel/IconPanelDirective';

@Component({
  selector: 'app-ebay-token',
  templateUrl: './Ebay-Token.html',
  styleUrls: ['./Ebay-Token.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonBackButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class EbayTokenController implements OnInit {
  public viewModel: any = {};
  @Input() public dialogId!: string;

  constructor(
    private logger: Logger,
    private ebay: EbayService,
    private preferences: PreferencesService,
    private ui: UIService,
    private auctionSniperApi: AuctionSniperApiService,
    private tracker: TrackerService,
    private navigator: NavigatorService,
    private modalController: ModalController,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.dialog_shown();
  }

  //#region BaseController Overrides
  protected async dialog_shown(): Promise<void> {
    this.viewModel.isOnboarding = !!(this.viewModel.onboarding);
    this.refresh();
  }
  //#endregion

  //#region Controller Methods
  protected retry_click(): void {
    this.viewModel.showManualRefresh = false;
    this.refresh();
  }

  protected refresh_click(): void {
    this.viewModel.showManualRefresh = false;
    this.refresh();
  }

  protected continue_click(): void {
    console.log('EbayTokenController: continue_click method called');
    console.log('EbayTokenController: dialogId:', this.dialogId);
    
    // Handle both modal and page scenarios
    if (this.dialogId) {
      // If this is a modal, close it
      console.log('EbayTokenController: Closing modal with dialogId:', this.dialogId);
      this.modalController.dismiss({ tokenOk: true }, 'close', this.dialogId)
        .then((dismissed) => {
          console.log('EbayTokenController: Modal closed result:', dismissed);
        })
        .catch((error) => {
          console.error('EbayTokenController: Error closing modal:', error);
        });
    } else {
      // If this is a regular page, use the back button functionality
      console.log('EbayTokenController: Using back button navigation from regular page');
      // The ion-back-button will handle navigation for regular pages
    }
  }

  protected async logout_click(): Promise<void> {
    const dialogOk = await this.ui.confirm('Are you sure you want to log out?');
    if (!dialogOk) return;

    this.viewModel.showSpinner = true;
    this.tracker.track(TrackerConstants.Account.Logout);

    try {
      await firstValueFrom(this.auctionSniperApi.logoff());
    } catch (error) {
      this.logger.error('EbayTokenController', 'logout_click', 'Error calling logoff API', error);
    }

    // Clear user authentication data
    await this.preferences.clearUserData();

    // Broadcast logout event
    document.dispatchEvent(new CustomEvent(AppEvents.APP_USER_LOGGED_OUT));

    // Handle both modal and page scenarios
    if (this.dialogId) {
      // If this is a modal, close it first
      console.log('EbayTokenController: Closing modal with dialogId:', this.dialogId);
      this.modalController.dismiss({ tokenOk: false }, 'close', this.dialogId)
        .then(() => {
          console.log('EbayTokenController: Modal closed, navigating to login');
          this.navigator.performNavigation({ stateName: '/login' }, true);
        })
        .catch((error) => {
          console.error('EbayTokenController: Error closing modal:', error);
          this.navigator.performNavigation({ stateName: '/login' }, true);
        });
    } else {
      // If this is a regular page, navigate directly
      console.log('EbayTokenController: Navigating to login from regular page');
      this.navigator.performNavigation({ stateName: '/login' }, true);
    }
  }

  protected async linkEbayAccount_click(): Promise<void> {
    this.viewModel.showError = false;
    this.viewModel.showSpinner = true;

    try {
      await firstValueFrom(from(this.ebay.requestLinkEbayAccount()));
      this.refresh();
    } catch (err) {
      this.viewModel.showSpinner = false;
      this.viewModel.showManualRefresh = true;
    }
  }

  protected async refresh(): Promise<void> {
    console.log('EbayTokenController: Starting refresh...');
    this.viewModel.showError = false;
    this.viewModel.showClose = false;
    this.viewModel.showSpinner = true;

    try {
      console.log('EbayTokenController: Calling getEbayTokenStatus...');
      const result: any = await firstValueFrom(this.auctionSniperApi.getEbayTokenStatus());
      console.log('EbayTokenController: getEbayTokenStatus completed, result:', result);
      this.viewModel.showSpinner = false;

      this.preferences.ebayTokenExpirationDate = result.response.ExpireDate;
      this.preferences.isEbayTokenValid = result.response.IsValid;
      this.preferences.isEbayTokenNull = result.response.IsNull;
  
      this.viewModel.tokenIsValid = this.preferences.isEbayTokenValid;
      this.viewModel.expireDate = this.preferences.ebayTokenExpirationDate;
  
      if (this.preferences.isEbayTokenNull || this.ebay.isEbayTokenExpired()) {
        this.viewModel.showClose = false;
      } else {
        this.viewModel.showManualRefresh = false;
        this.viewModel.showClose = true;
      }
  
      this.viewModel.showWarning = this.ebay.isEbayTokenNearExpiration();
    } catch (err: unknown) {
      console.error('EbayTokenController: Error in refresh:', err);
      this.viewModel.showSpinner = false;
      this.viewModel.showError = true;

      this.logger.error('EbayTokenController', 'refresh', 'Error fetching token status', err);

      const errorObj = err as {
        innerError?: { message?: { MessageContent?: string } };
      };

      if (errorObj.innerError?.message?.MessageContent) {
        this.ui.showErrorSnackbar(errorObj.innerError.message.MessageContent);
      } else {
        console.log('EbayTokenController: No specific error message found, showing generic error');
        this.ui.showErrorSnackbar('Failed to fetch eBay token status. Please try again.');
      }
    }
  }
  
  //#endregion
}
