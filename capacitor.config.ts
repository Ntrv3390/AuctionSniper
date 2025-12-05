import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.auctiva.auctionsniper',
  appName: 'Auction Sniper',
  webDir: 'www',
  server: {
    allowNavigation: ['https://services.auctionsniper.com'],
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#1a2a6c',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#145583',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: KeyboardResize.None,
    },
  },
};

export default config;
