import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/PushNotifications';
import { CapacitorInitService } from './services/CapacitorInit';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ToastController } from '@ionic/angular';

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

  async ngOnInit() {
    await this.platform.ready();
    this.capacitorInit.initialize();
    this.pushNotifications.initialize();
    await this.initializeStatusBar();
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
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#156DAB' });
      await StatusBar.show();
    } catch (error: any) {
      this.showToast(
        `StatusBar init failed: ${error?.message || error}`,
        'danger'
      );
    }
  }
}
