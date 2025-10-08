import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/PushNotifications';
import { CapacitorInitService } from './services/CapacitorInit';
import { StatusBar, Style } from '@capacitor/status-bar';
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
  ) {}

  private overlayEnabled = false;
  async ngOnInit() {
    await this.platform.ready();
    this.capacitorInit.initialize();
    this.pushNotifications.initialize();
    await this.initializeStatusBar();

    if (this.platform.is('ios')) {
      // Keyboard open
      // Keyboard.addListener('keyboardWillShow', () => {
      //   if (!this.overlayEnabled) {
      //     this.overlayEnabled = true;
      //     StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      //   }
      // });

      // // Keyboard close
      // Keyboard.addListener('keyboardWillHide', () => {
      //   if (this.overlayEnabled) {
      //     this.overlayEnabled = false;
      //     setTimeout(() => {
      //       StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      //     }, 400);
      //   }
      // });

      // App resume
      App.addListener('resume', () => {
        this.overlayEnabled = false;
        StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
        setTimeout(() => {
          StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
        }, 400);
      });

      // Input focus handling (extra stability)
      document.addEventListener('focusin', (event) => {
        const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
          if (!this.overlayEnabled) {
            this.overlayEnabled = true;
            StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
          }
        }
      });

      document.addEventListener('focusout', (event) => {
        const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
          this.overlayEnabled = false;
          setTimeout(() => {
            StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
          }, 400);
        }
      });
    }
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
      if (this.platform.is('ios')) {
        await StatusBar.setOverlaysWebView({ overlay: false });
      } else {
        await StatusBar.setOverlaysWebView({ overlay: false });
      }
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#145583' });
      await StatusBar.show();
    } catch (error: any) {
      this.showToast(
        `StatusBar init failed: ${error?.message || error}`,
        'danger'
      );
    }
  }
}
