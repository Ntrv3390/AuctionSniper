import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonItemDivider, IonBackButton } from '@ionic/angular/standalone';
import { AccountPushNotificationsViewModel } from './AccountPushNotificationsViewModel';
import { TrackerService } from 'src/app/services/Tracker';
import { Logger } from 'src/app/services/Logger';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';
import { PlatformService } from 'src/app/services/Platform';
import { PushNotificationsService } from 'src/app/services/PushNotifications';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-account-push-notifications',
  templateUrl: './Account-Push-Notifications.html',
  styleUrls: ['./account-push-notifications.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonItemDivider, IonBackButton,
  ]
})
export class AccountPushNotificationsPage implements OnInit {

  viewModel: AccountPushNotificationsViewModel = new AccountPushNotificationsViewModel();

  constructor(
    private tracker: TrackerService,
    private logger: Logger,
    private preferences: PreferencesService,
    private ui: UIService,
    private platform: PlatformService,
    private pushNotifications: PushNotificationsService
  ) { }

  ngOnInit(): void {
    this.view_beforeEnter();
  }

  view_beforeEnter(): void {
    if (this.platform.native) {
      this.viewModel.iOS = this.platform.iOS;
      this.viewModel.android = this.platform.android;
    } else {
      // Show default for development
      this.viewModel.iOS = true;
    }
  }

  async optIn_click(): Promise<void> {
    this.tracker.track(TrackerConstants.PushNotification.ManualOptIn);
    this.preferences.allowPushNotifications = true;
    
    // Show loader
    this.viewModel.isLoading = true;
    this.ui.activityStart();

    try {
      // If registerDevice returns a Promise<void>, just await it
      await this.pushNotifications.registerDevice(this.preferences.getUser());

      this.ui.activityStop();
      this.ui.showSuccessSnackbar('Device notifications enabled!');
    } catch (error) {
      this.ui.activityStop();
      this.logger.error('AccountPushNotificationsPage', 'optIn_click', 'Push notification device registration failed.', error);
      this.ui.showErrorSnackbar('An error occurred attempting to register for device notifications. Please try again.');
    } finally {
      // Hide loader
      this.viewModel.isLoading = false;
    }
  }
  
  async optOut_click(): Promise<void> {
    this.tracker.track(TrackerConstants.PushNotification.ManualOptOut);

    this.preferences.allowPushNotifications = false;
    
    // Show loader
    this.viewModel.isLoading = true;
    this.ui.activityStart();

    try {
      // Directly await the Promise returned by unregisterDevice
      await this.pushNotifications.unregisterDevice(this.preferences.getUser());

      this.ui.activityStop();
      this.ui.showSuccessSnackbar('Device notifications disabled');
    } catch (error) {
      this.ui.activityStop();
      this.logger.error(
        'AccountPushNotificationsPage',
        'optOut_click',
        'Push notification device unregistration failed.',
        error
      );
      this.ui.showErrorSnackbar(
        'An error occurred attempting to un-register from device notifications. Please try again.'
      );
    } finally {
      // Hide loader
      this.viewModel.isLoading = false;
    }
  }

}