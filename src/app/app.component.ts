import {
  Component,
  OnInit
} from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/PushNotifications';
import { CapacitorInitService } from './services/CapacitorInit';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { Capacitor } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private pushNotifications: PushNotificationsService,
    private capacitorInit: CapacitorInitService,
    private platform: Platform,
    private toastCtrl: ToastController
  ) {
    Keyboard.addListener('keyboardWillHide', () => {
      this.showTabBar();
    });

    Keyboard.addListener('keyboardWillShow', () => {
      const tabBar = document.querySelector('ion-tab-bar');
      if (tabBar) {
        (tabBar as HTMLElement).style.display = 'none';
      }
    });

    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        window.dispatchEvent(new Event('resize'));
      }
    });

    // Also on app resume
    App.addListener('resume', () => {
      this.showTabBar();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  showTabBar() {
    const tabBar = document.querySelector('ion-tab-bar');
    if (tabBar) {
      (tabBar as HTMLElement).style.display = 'flex';
      (tabBar as HTMLElement).style.height = '56px';
      (tabBar as HTMLElement).style.paddingBottom = '0';
    }
  }

  async ngOnInit() {
    await this.platform.ready();

    this.capacitorInit.initialize();
    this.pushNotifications.initialize();

    await this.initializeStatusBar();
    await this.applySafeAreaInsets();

    this.showTabBar();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize')); // fix layout shift
    }, 1000);
  }

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'danger'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  private async initializeStatusBar(): Promise<void> {
    try {
      if (
        Capacitor.getPlatform() === 'ios' ||
        Capacitor.getPlatform() === 'android'
      ) {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#156DAB' });
        await StatusBar.show();
      }
    } catch (error: any) {
      this.showToast(
        `StatusBar init failed: ${error?.message || error}`,
        'danger'
      );
    }
  }

  private async applySafeAreaInsets(): Promise<void> {
    if (
      Capacitor.getPlatform() !== 'ios' &&
      Capacitor.getPlatform() !== 'android'
    )
      return;

    const setInsets = async () => {
      try {
        const { insets } = await SafeArea.getSafeAreaInsets();
        const directions: (keyof typeof insets)[] = [
          'top',
          'bottom',
          'left',
          'right',
        ];

        directions.forEach((dir) => {
          const value = insets[dir] ?? 0;
          document.documentElement.style.setProperty(
            `--ion-safe-area-inset-${dir}`,
            `${value}px`
          );
        });
      } catch (error: any) {
        this.showToast(
          `SafeArea plugin failed: ${error?.message || error}`,
          'warning'
        );
      }
    };

    await setInsets();
    window.addEventListener('resize', () => setInsets());
  }
}
