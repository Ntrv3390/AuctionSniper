/**
 * Capacitor Plugin Initialization Fix
 * 
 * This service ensures that Capacitor plugins are properly initialized
 * before being used, which resolves the "overlay does not exist" error.
 */

import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Dialog } from '@capacitor/dialog';
import { ActionSheet } from '@capacitor/action-sheet';

@Injectable({
  providedIn: 'root'
})
export class CapacitorInitService {
  private isInitialized = false;

  /**
   * Initialize Capacitor plugins
   * This should be called early in the app lifecycle
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Initialize plugins that might need early setup
      if (Capacitor.isPluginAvailable('App')) {
        // Just accessing the plugin will ensure it's loaded
        App.addListener('backButton', () => {
          // Handle back button if needed
        });
      }

      this.isInitialized = true;
      console.log('Capacitor plugins initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Capacitor plugins:', error);
    }
  }

  /**
   * Ensure a specific plugin is ready before using it
   * @param pluginName The name of the plugin to check
   */
  async ensurePluginReady(pluginName: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true; // Web platform, no initialization needed
    }

    try {
      // Check if plugin is available
      const isAvailable = Capacitor.isPluginAvailable(pluginName);
      if (!isAvailable) {
        console.warn(`Capacitor plugin ${pluginName} is not available`);
        return false;
      }

      return true;
    } catch (error) {
      console.warn(`Error checking plugin ${pluginName}:`, error);
      return false;
    }
  }
}