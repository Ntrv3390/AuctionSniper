import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/PushNotifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { CapacitorInitService } from './services/CapacitorInit';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private pushNotifications: PushNotificationsService,
    private capacitorInit: CapacitorInitService
  ) {}

  ngOnInit(): void {
    // Initialize Capacitor plugins
    this.capacitorInit.initialize();

    // Initialize push notifications
    this.pushNotifications.initialize();

    // Initialize status bar
    this.initializeStatusBar();

    // Set safe area insets
    // SafeArea.getSafeAreaInsets().then(({ insets }) => {
    //   for (const [key, value] of Object.entries(insets)) {
    //     document.documentElement.style.setProperty(
    //       `--safe-area-inset-${key}`,
    //       `${value}px`
    //     );
    //   }
    // });
  }

  private async initializeStatusBar(): Promise<void> {
    try {
      // Set the status bar style to light for white text
      await StatusBar.setStyle({ style: Style.Light });

      // Set the status bar background color to match the primary color
      // Using the custom primary color #156DAB from Overrides/Ionic.scss
      await StatusBar.setBackgroundColor({ color: '#156DAB' });

      // Show the status bar
      await StatusBar.show();
    } catch (error) {
      console.warn('StatusBar initialization failed:', error);
    }
  }
}
