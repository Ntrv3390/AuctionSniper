// dev-push-notifications.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Logger } from 'src/app/services/Logger';
import { Utilities } from 'src/app/services/Utilities';
import { PlatformService } from 'src/app/services/Platform';
import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';
import { PushNotificationsService } from 'src/app/services/PushNotifications';

@Component({
  selector: 'app-dev-push-notifications',
  templateUrl: './dev-push-notifications.component.html',
  styleUrls: ['./dev-push-notifications.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevPushNotificationsController implements OnInit {

  viewModel: any = {
    lastRegistrationResultJson: '',
    lastRegistrationErrorResultJson: '',
    lastNotificationReceivedResultJson: '',
    lastActionPerformedResultJson: '',
    apnsToken: '',
    fcmToken: ''
  };

  constructor(
    private logger: Logger,
    private utilities: Utilities,
    private platform: PlatformService,
    private ui: UIService,
    private plugins: PluginsService,
    private pushNotifications: PushNotificationsService
  ) {}

  //#region Lifecycle

  ngOnInit(): void {
    this.refresh();
  }

  //#endregion

  //#region Controller Events

  async simulatePushNotification_click(): Promise<void> {
    let stateName = 'app.snipe-detail';

    const promptResult1 = await this.ui.prompt(
        'Enter state name.',
        'Simulate Push Notification',
        undefined,   // was null → now undefined
        undefined,   // was null → now undefined
        stateName
      );

    if (promptResult1.cancelled) {
      return;
    }

    stateName = promptResult1.value;

    const param = { id: '1234' };
    let stateParamJson = JSON.stringify(param);

    const promptResult2 = await this.ui.prompt(
      'Enter state parameters JSON.',
      'Simulate Push Notification',
      undefined,
      undefined,
      stateParamJson
    );

    if (promptResult2.cancelled) {
      return;
    }

    stateParamJson = promptResult2.value;

    const handler = this.utilities.getFunction(
      this.pushNotifications,
      'capacitorPushNotifications_pushNotificationReceived'
    ) as (actionPerformed: any) => void;

    const notification = {
      id: 'DEV_TEST_PN',
      title: 'Simulated Push Notification',
      body: 'This is a test push notification.',
      data: {
        app_state_name: stateName,
        app_state_param: stateParamJson
      }
    };

    handler(notification);
  }

  async register_click(): Promise<void> {
    try {
      await this.plugins.pushNotifications.register();
      this.ui.showInfoSnackbar('Registration completed.');
      this.refresh();
    } catch (error) {
      this.ui.showErrorSnackbar('Error during registration.');
      this.logger.error(
        DevPushNotificationsController.name,
        'register_click',
        'Error during registration.',
        error
      );
    }
  }

  clearRecents_click(): void {
    this.pushNotifications.clearRecents();
  }

  //#endregion

  //#region Private Helpers

  private async refresh(): Promise<void> {
    this.viewModel.lastRegistrationResultJson = JSON.stringify(
      this.pushNotifications.lastRegistrationResult,
      null,
      2
    );
    this.viewModel.lastRegistrationErrorResultJson = JSON.stringify(
      this.pushNotifications.lastRegistrationErrorResult,
      null,
      2
    );
    this.viewModel.lastNotificationReceivedResultJson = JSON.stringify(
      this.pushNotifications.lastNotificationReceivedResult,
      null,
      2
    );
    this.viewModel.lastActionPerformedResultJson = JSON.stringify(
      this.pushNotifications.lastActionPerformedResult,
      null,
      2
    );

    this.viewModel.apnsToken = this.platform.android
      ? 'N/A'
      : this.pushNotifications.apnsToken;

    try {
      const result = await this.plugins.sharedNative.firebasePushNotifications_getToken();
      if (result && result.token) {
        this.viewModel.fcmToken = result.token;
      } else {
        this.ui.showErrorSnackbar('Error fetching token.');
      }
    } catch (error) {
      this.ui.showErrorSnackbar('Error fetching token.');
      this.logger.error(
        DevPushNotificationsController.name,
        'refresh',
        'Error fetching token.',
        error
      );
    }
  }

  //#endregion
}
