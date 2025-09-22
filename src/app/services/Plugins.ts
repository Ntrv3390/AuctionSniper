import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { App as CapacitorApp } from '@capacitor/app';
import { Clipboard } from '@capacitor/clipboard';
import { Browser } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushNotifications } from '@capacitor/push-notifications';
import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar } from '@capacitor/status-bar';
import { ActionSheet } from '@capacitor/action-sheet';
import { Dialog } from '@capacitor/dialog';

import { MockPlatformApis } from 'src/app/services/MockPlatformApis';
import { SharedNativePlugin } from 'src/app/types/SharedNativePlugin';

@Injectable({
  providedIn: 'root'
})
export class PluginsService {
  constructor(private mockPlatformApis: MockPlatformApis) {}

  get sharedNative(): SharedNativePlugin {
    if ((Capacitor as any).isPluginAvailable?.('SharedNativePlugin')) {
      return (window as any)?.Capacitor?.Plugins?.SharedNativePlugin as SharedNativePlugin;
    } else {
      return this.mockPlatformApis.getSharedNativePlugin();
    }
  }

  get app() {
    return CapacitorApp;
  }

  get storage() {
    return Preferences;
  }

  get network() {
    return Network;
  }

  get pushNotifications() {
    return PushNotifications;
  }
  
  get modals() {
    return Capacitor.isNativePlatform()
      ? {
          // Use ActionSheet for showActions
          showActions: async (options: any) => {
            try {
              // Ensure plugin is ready
              if (!Capacitor.isPluginAvailable('ActionSheet')) {
                throw new Error('ActionSheet plugin not available');
              }
              return await ActionSheet.showActions(options);
            } catch (error) {
              console.warn('ActionSheet plugin error, falling back to mock:', error);
              return this.mockPlatformApis.getModalsPlugin().showActions(options);
            }
          },
          // Use Dialog for prompt, alert, confirm
          prompt: async (options: any) => {
            try {
              // Ensure plugin is ready
              if (!Capacitor.isPluginAvailable('Dialog')) {
                throw new Error('Dialog plugin not available');
              }
              return await Dialog.prompt(options);
            } catch (error) {
              console.warn('Dialog plugin error, falling back to mock:', error);
              return this.mockPlatformApis.getModalsPlugin().prompt(options);
            }
          },
          alert: async (options: any) => {
            try {
              // Ensure plugin is ready
              if (!Capacitor.isPluginAvailable('Dialog')) {
                throw new Error('Dialog plugin not available');
              }
              return await Dialog.alert(options);
            } catch (error) {
              console.warn('Dialog plugin error, falling back to mock:', error);
              return this.mockPlatformApis.getModalsPlugin().alert(options);
            }
          },
          confirm: async (options: any) => {
            try {
              // Ensure plugin is ready
              if (!Capacitor.isPluginAvailable('Dialog')) {
                throw new Error('Dialog plugin not available');
              }
              return await Dialog.confirm(options);
            } catch (error) {
              console.warn('Dialog plugin error, falling back to mock:', error);
              return this.mockPlatformApis.getModalsPlugin().confirm(options);
            }
          }
        }
      : this.mockPlatformApis.getModalsPlugin();
  }

  get browser() {
    return Browser;
  }

  get clipboard() {
    return Clipboard;
  }

  get statusBar() {
    return StatusBar;
  }

  get splashScreen() {
    return SplashScreen;
  }

  get keyboard() {
    return Keyboard;
  }
}
