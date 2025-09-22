import {
  Component,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItemDivider,
  IonButton,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { MoreListViewModel } from './MoreListViewModel';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';
import { TrackerService } from 'src/app/services/Tracker';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { ConfigurationService } from 'src/app/services/Configuration';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { EbayService } from 'src/app/services/Ebay';
import { NavigatorService } from 'src/app/services/Navigator';
import { BadgeManagerService } from 'src/app/services/BadgeManager';
import { FreeSnipesService } from 'src/app/services/FreeSnipes';
import { Logger } from 'src/app/services/Logger';
import { MoreListParams } from './MoreListParams';
import { firstValueFrom } from 'rxjs';
import { WINDOW_TOKEN } from 'src/main';

// Import icons used in the template
import { addIcons } from 'ionicons';
import {
  mailOutline,
  refreshOutline,
  closeOutline,
  linkOutline,
  settingsOutline,
  notificationsOutline,
  cardOutline,
  receiptOutline,
  trashOutline,
  helpCircleOutline,
  informationCircleOutline,
  codeWorking,
  logOutOutline,
  chevronForwardOutline,
  personOutline,
  lockClosedOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-more-list',
  templateUrl: './more-list.page.html',
  styleUrls: ['./more-list.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItemDivider,
    IonButton,
    IonIcon,
    IonLabel
  ]
})
export class MoreListPage implements OnInit {

  viewModel: MoreListViewModel = new MoreListViewModel();

  constructor(
    private tracker: TrackerService,
    private ui: UIService,
    private preferences: PreferencesService,
    private configuration: ConfigurationService,
    private auctionApi: AuctionSniperApiService,
    private ebay: EbayService,
    private navigator: NavigatorService,
    private badgeManager: BadgeManagerService,
    private freeSnipes: FreeSnipesService,
    private logger: Logger,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    @Inject(WINDOW_TOKEN) private window: Window
  ) {
    console.log('MoreListPage: Constructor called');
    
    // Register icons used in the template
    addIcons({
      'mail-outline': mailOutline,
      'refresh-outline': refreshOutline,
      'close-outline': closeOutline,
      'link-outline': linkOutline,
      'settings-outline': settingsOutline,
      'notifications-outline': notificationsOutline,
      'card-outline': cardOutline,
      'receipt-outline': receiptOutline,
      'trash-outline': trashOutline,
      'help-circle-outline': helpCircleOutline,
      'information-circle-outline': informationCircleOutline,
      'code-working': codeWorking,
      'log-out-outline': logOutOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'person-outline': personOutline,
      'lock-closed-outline': lockClosedOutline
    });
  }

  ngOnInit(): void {
    console.log('MoreListPage: ngOnInit called');
    this.view_beforeEnter();
  }

  //#region BaseController Overrides

  view_beforeEnter(): void {
    console.log('MoreListPage: view_beforeEnter called');
    this.viewModel.isDebugMode = this.configuration.debug;
    this.viewModel.isDeveloperMode = this.configuration.enableDeveloperTools;
    this.viewModel.showLogout = this.preferences.token != null;
    this.viewModel.userName = this.preferences.userId;

    if ((this.preferences as any).openEbayTokenModal) {
      (this.preferences as any).openEbayTokenModal = null;

      if (!this.ui.isDialogOpen) {
        this.ebay.showAccountDetails();
      }
    }

    this.badgeManager.clearBadgeForTab(3); // Constants.TabIndicies.MORE

    if (this.freeSnipes.showReminderInMoreTab) {
      this.viewModel.showRegisterReminder = true;
      this.freeSnipes.showReminderInMoreTab = false;
    }
  }

  //#endregion

  //#region Controller Methods
  async resendActivationEmail_click(): Promise<void> {
    try {
      const result = await firstValueFrom(this.auctionApi.resendActivationEmail());
  
      if (!result || !result.success) {
        this.logger.error(
          'MoreListPage',
          'resendActivationEmail_click',
          'Error re-sending activation email.',
          { result }
        );
        return;
      }
  
      this.ui.showInfoSnackbar('The email has been resent!');
      this.viewModel.showRegisterReminder = false;
  
    } catch (err) {
      this.logger.error(
        'MoreListPage',
        'resendActivationEmail_click',
        'Unexpected error',
        err
      );
    }
  }

  dismissActivationEmailRemdiner_click(): void {
    this.viewModel.showRegisterReminder = false;
  }

  async yourEbayConnection_click(): Promise<void> {
    await this.ebay.showAccountDetails();
  }

  // Debug method to test navigation
  debugNavigate(path: string): void {
    console.log('MoreListPage: debugNavigate called with path:', path);
  }

  async logout_click(): Promise<void> {
    const dialogOk = await this.ui.confirm('Are you sure you want to log out?');
    if (!dialogOk) return;

    this.tracker.track(TrackerConstants.Account.Logout);

    try {
      await this.auctionApi.logoff();
    } catch (error) {
      this.logger.error('MoreListPage', 'logout_click', 'Error calling logoff API', error);
    }

    // Clear user authentication data
    await this.preferences.clearUserData();

    // Notify the rest of the app
    // Use Angular EventEmitter or a service if needed
    // Here we keep broadcast approach for migration
    document.dispatchEvent(new CustomEvent('APP_USER_LOGGED_OUT'));

    // Navigate user to login
    this.navigator.performNavigation({ stateName: '/login' }, true);
  }

  help_click(): void {
    this.tracker.track(TrackerConstants.Account.Help);
    this.window.open(this.configuration.webSiteUrl + '/help/support', '_blank');
  }

  navigateToPreferences(): void {
    console.log('MoreListPage: navigateToPreferences called');
    this.navCtrl.navigateForward('/account-preferences');
  }

  navigateToAccountInformation(): void {
    console.log('MoreListPage: navigateToAccountInformation called');
    this.navCtrl.navigateForward('/account-information');
  }

  navigateToNotifications(): void {
    console.log('MoreListPage: navigateToNotifications called');
    this.navCtrl.navigateForward('/account-notifications');
  }

  navigateToPushNotifications(): void {
    console.log('MoreListPage: navigateToPushNotifications called');
    this.navCtrl.navigateForward('/account-push-notifications');
  }

  navigateToConfigurePin(): void {
    console.log('MoreListPage: navigateToConfigurePin called');
    this.navCtrl.navigateForward('/configure-pin');
  }

  navigateToPayment(): void {
    console.log('MoreListPage: navigateToPayment called');
    this.navCtrl.navigateForward('/account-payment');
  }

  navigateToTransactions(): void {
    console.log('MoreListPage: navigateToTransactions called');
    this.navCtrl.navigateForward('/account-transactions');
  }

  navigateToDeleteAccount(): void {
    console.log('MoreListPage: navigateToDeleteAccount called');
    this.navCtrl.navigateForward('/account-delete');
  }

  navigateToAbout(): void {
    console.log('MoreListPage: navigateToAbout called');
    this.navCtrl.navigateForward('/more-about');
  }

  navigateToDeveloper(): void {
    console.log('MoreListPage: navigateToDeveloper called');
    this.navCtrl.navigateForward('developer');
  }

  //#endregion
}
