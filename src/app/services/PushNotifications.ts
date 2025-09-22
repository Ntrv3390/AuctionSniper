// src/app/services/push-notifications.service.ts

import { Injectable } from '@angular/core';
import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { SnackbarService, SnackbarLocation } from 'src/app/services/Snackbar';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { TrackerService } from 'src/app/services/Tracker';
import { UIService } from 'src/app/services/UI';
import { ConfigurationService } from 'src/app/services/Configuration';
import { Utilities } from 'src/app/services/Utilities';
import { Logger } from 'src/app/services/Logger';
import { DialogButtons } from 'src/app/constants/constants';
import { SnackbarLevel, SnackbarOptions } from 'src/app/services/Snackbar';
import { NavigationState } from 'src/app/Interfaces/navigation-state.interface';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  public apnsToken: string | null = null;  // <-- now public

  public lastRegistrationResult: Token | null = null;
  public lastRegistrationErrorResult: any = null;
  public lastNotificationReceivedResult: PushNotificationSchema | null = null;
  public lastActionPerformedResult: ActionPerformed | null = null;
  public actionToConsume: ActionPerformed | null = null;

  constructor(
    private logger: Logger,
    private tracker: TrackerService,
    private utilities: Utilities,
    private platform: Platform,
    private ui: UIService,
    private snackbar: SnackbarService,
    private api: AuctionSniperApiService
  ) {}

  public initialize(): void {
    try {
      PushNotifications.addListener('registration', token => this.onRegistration(token));
      PushNotifications.addListener('registrationError', error => this.onRegistrationError(error));
      PushNotifications.addListener('pushNotificationReceived', notification => this.onNotificationReceived(notification));
      PushNotifications.addListener('pushNotificationActionPerformed', action => this.onActionPerformed(action));
    } catch (error) {
      // Handle Firebase initialization errors gracefully
      if (error instanceof Error && error.message.includes('FirebaseApp')) {
        this.logger.error('PushNotifications', 'initialize', 'Firebase not properly initialized. Push notifications will not work.', error);
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }

  async registerDevice(user: any): Promise<void> {
    if (!this.platform.is('capacitor')) return;

    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        this.logger.debug('PushNotifications', 'registerDevice', 'Permission not granted.');
        return;
      }

      await PushNotifications.register();

      // Wait for the token to be received
      let token = this.apnsToken;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Wait for token to be set by the onRegistration callback
      while (!token && attempts < maxAttempts) {
        await this.utilities.wait(100);
        token = this.apnsToken;
        attempts++;
      }

      if (!token) {
        throw new Error('Failed to retrieve push token.');
      }

      this.logger.debug('PushNotifications', 'registerDevice', 'Token:', token);

      const result = await firstValueFrom(
        this.api.registerDeviceForPushNotifications(token)
      );
      
      if (!result || result.success === false) {
        throw new Error('Failed to register device with backend.');
      }
    } catch (error) {
      // Handle Firebase initialization errors gracefully
      if (error instanceof Error && error.message.includes('FirebaseApp')) {
        this.logger.error('PushNotifications', 'registerDevice', 'Firebase not properly initialized. Push notifications will not work.', error);
        // Don't throw the error to prevent app crash
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }

  async unregisterDevice(user: any): Promise<void> {
    if (!this.platform.is('capacitor')) return;
  
    const token = this.apnsToken;
    if (!token) return;
  
    try {
      const result = await firstValueFrom(
        this.api.unregisterDeviceFromPushNotitifications(token, user.Key, true)
      );
    
      if (result && result.success === false) {
        this.logger.debug('PushNotifications', 'unregisterDevice', 'FCM reported failure.');
      }
    } catch (error) {
      // Handle Firebase initialization errors gracefully
      if (error instanceof Error && error.message.includes('FirebaseApp')) {
        this.logger.error('PushNotifications', 'unregisterDevice', 'Firebase not properly initialized.', error);
        // Don't throw the error to prevent app crash
        return;
      }
      this.logger.warn('PushNotifications', 'unregisterDevice', 'Failed to unregister device:', error);
      // Don't throw error to prevent app crash
    }
  }
  async getToken(): Promise<string | null> {
    return this.apnsToken;
  }

  async getLaunchAction(): Promise<ActionPerformed | null> {
    await this.utilities.wait(100);
    const action = this.actionToConsume;
    this.actionToConsume = null;
    return action;
  }

  clearRecents(): void {
    this.lastRegistrationResult = null;
    this.lastRegistrationErrorResult = null;
    this.lastNotificationReceivedResult = null;
    this.lastActionPerformedResult = null;
  }

  async handlePushNotification(notification: PushNotificationSchema, pnLaunchedApp: boolean): Promise<NavigationState | null> {
    try {
      if (!notification) return null;

      const navState: NavigationState | null = notification.data?.app_state_name
        ? {
            stateName: notification.data.app_state_name,
            stateParam: this.utilities.deserializeFromJson(notification.data.app_state_param)
          }
        : null;

      const message = notification.body;
      const title = notification.title || 'Incoming Message';

      if (pnLaunchedApp) {
        this.tracker.track(TrackerConstants.PushNotification.Launch, navState?.stateName || null);
      } else {
        this.tracker.track(TrackerConstants.PushNotification.Received, navState?.stateName || null);
      }

      if (!navState && message && !pnLaunchedApp) {
        const options = new SnackbarOptions(message, title, SnackbarLevel.Info,
          SnackbarLocation.Bottom, // ✅ or SnackbarLocation.Top
          DialogButtons.OK, false);
        this.snackbar.show(options);
        return null;
      }

      if (pnLaunchedApp) {
        return navState;
      }

      const confirm = await this.ui.confirm( message ?? '', title, DialogButtons.SHOW_ME, DialogButtons.NOT_NOW);
      
      if (!confirm) {
        this.tracker.track(TrackerConstants.PushNotification.UserDeclinedDeepLink, navState?.stateName || '');
        return null;
      }

      this.tracker.track(TrackerConstants.PushNotification.UserAcceptedDeepLink, navState?.stateName || '');
      return navState;
    } catch (error) {
      this.logger.error('PushNotifications', 'handlePushNotification', 'Error handling push notification', error);
      return null; // Don't crash the app, just return null
    }
  }

  private onRegistration(token: Token): void {
    try {
      this.lastRegistrationResult = token; // keep the object if you need it
      this.apnsToken = token.value;
      this.logger.debug('PushNotifications', 'onRegistration', token.value); // ✅ pass string
    } catch (error) {
      this.logger.error('PushNotifications', 'onRegistration', 'Error in onRegistration callback', error);
    }
  }

  private onRegistrationError(error: any): void {
    try {
      this.lastRegistrationErrorResult = error;
      this.logger.warn('PushNotifications', 'onRegistrationError', error);
    } catch (err) {
      this.logger.error('PushNotifications', 'onRegistrationError', 'Error in onRegistrationError callback', err);
    }
  }

  private async onNotificationReceived(notification: PushNotificationSchema): Promise<void> {
    try {
      this.lastNotificationReceivedResult = notification;
      this.logger.debug('PushNotifications', 'onNotificationReceived', JSON.stringify(notification));
    } catch (error) {
      this.logger.error('PushNotifications', 'onNotificationReceived', 'Error in onNotificationReceived callback', error);
    }
  }

  private onActionPerformed(action: ActionPerformed): void {
    try {
      this.lastActionPerformedResult = action;
      this.actionToConsume = action;
      this.logger.debug('PushNotifications', 'onActionPerformed', action.actionId);
    } catch (error) {
      this.logger.error('PushNotifications', 'onActionPerformed', 'Error in onActionPerformed callback', error);
    }
  }
}
