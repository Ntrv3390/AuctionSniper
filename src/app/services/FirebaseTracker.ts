// firebase-tracker.service.ts

import { Injectable } from '@angular/core';
import { Logger } from 'src/app/services/Logger';
import { ConfigurationService } from 'src/app/services/Configuration';
import { PreferencesService } from 'src/app/services/Preferences';
import { PlatformService } from 'src/app/services/Platform';
import { PluginsService } from 'src/app/services/Plugins';
import { Tracker } from 'src/app/services/interfaces/Tracker';
import { TrackingEvent } from 'src/app/Interfaces/tracking-event.interface';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

@Injectable({
    providedIn: 'root'
  })
  export class FirebaseTrackerService implements Tracker {
  
    constructor(
      private logger: Logger,
      private configuration: ConfigurationService,
      private preferences: PreferencesService,
      private platform: PlatformService,
      private plugins: PluginsService,
    ) {}
  
    initialize(): void {
      if (!this.platform.native || this.configuration.debug) {
        return;
      }
  
      if (this.preferences.isUserLoggedIn && this.preferences.userUid) {
        const options = { userId: this.preferences.userUid + '' };
  
        this.plugins.sharedNative.firebaseAnalytics_setUserId(options).catch((error: unknown) => {
          const message = 'An error callback was triggered by the Firebase SDK.';
          this.logger.error('FirebaseTracker', 'setUser', message, error);
        });
      }
    }
  
    setUser(user: AuctionSniperApiTypes.User): void {
      if (!this.platform.native || this.configuration.debug) {
        return;
      }
  
      if (user && user.Id) {
        const options = { userId: user.Id + '' };
  
        this.plugins.sharedNative.firebaseAnalytics_setUserId(options).catch((error: unknown) => {
          const message = 'An error callback was triggered by the Firebase SDK.';
          this.logger.error('FirebaseTracker', 'setUser', message, error);
        });
      }
    }
  
    clearUser(): void {
      if (!this.platform.native || this.configuration.debug) {
        return;
      }
  
      const options = { userId: '' };
  
      this.plugins.sharedNative.firebaseAnalytics_setUserId(options).catch((error: unknown) => {
        const message = 'An error callback was triggered by the Firebase SDK.';
        this.logger.error('FirebaseTracker', 'clearUser', message, error);
      });
    }
  
    trackView(viewId: string): void {
      if (!this.platform.native || this.configuration.debug) {
        return;
      }
  
      const screenName = viewId ? viewId.replace('app.', '') : '';
      const options = { screenName };
  
      this.plugins.sharedNative.firebaseAnalytics_setScreenName(options).catch((error: unknown) => {
        const message = 'An error callback was triggered by the Firebase SDK.';
        this.logger.error('FirebaseTracker', 'trackView', message, error);
      });
    }
  
    track<T>(event: TrackingEvent<any>, metadata?: T): void {
      if (!event || !event.isFirebaseEvent) {
        return;
      }
  
      if (!this.platform.native || this.configuration.debug) {
        return;
      }
  
      const eventData: any = {};
  
      if (metadata !== undefined) {
        eventData.label = metadata + '';
      }
  
      switch (event) {
        case TrackerConstants.Account.Login:
          eventData.builtInEventName = 'login';
          break;
        case TrackerConstants.Account.RegisterAccount:
          eventData.builtInEventName = 'sign_up';
          break;
        case TrackerConstants.Search.IdSearch:
        case TrackerConstants.Search.KeywordSearch:
        case TrackerConstants.Search.SavedSearch:
          eventData.builtInEventName = 'search';
          break;
      }
  
      const eventName = `${event.category} ${event.action}`.replace(/ /g, '_');
  
      const options = {
        eventName,
        eventData
      };
  
      this.plugins.sharedNative.firebaseAnalytics_logEvent(options).catch((error: unknown) => {
        const message = 'An error callback was triggered by the Firebase SDK.';
        this.logger.error('FirebaseTracker', 'track', message, error);
      });
    }
  }
  