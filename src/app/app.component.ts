import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { PushNotificationsService } from './services/PushNotifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { CapacitorInitService } from './services/CapacitorInit';
import { App } from '@capacitor/app';

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
  ) {
    if (Capacitor.getPlatform() === 'ios') {
      let hasResumedOnce = false;
      this.fixLayout();
      // Run only after the app is resumed (not on first load)
      App.addListener('resume', () => {
        hasResumedOnce = true;
        this.fixLayout();
      });

      // Watch DOM for new pages (but apply only after first resume)
      const observer = new MutationObserver(() => {
        if (hasResumedOnce) {
          this.fixLayout();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // private fixLayout() {
  //   const headers = document.querySelectorAll('ion-header');
  //   const contents = document.querySelectorAll('ion-content');

  //   headers.forEach((header) => {
  //     (header as HTMLElement).style.transform = 'translateY(-40px)';
  //   });

  //   contents.forEach((content) => {
  //     (content as HTMLElement).style.transform = 'translateY(-40px)';
  //   });
  // }

  private fixLayout() {
    const headers = document.querySelectorAll('ion-header');
    const contents = document.querySelectorAll('ion-content');

    headers.forEach((header) => {
      (header as HTMLElement).style.transform = 'translateY(-40px)';
    });

    contents.forEach((content) => {
      // Reset any bad transforms
      (content as HTMLElement).style.transform = 'translateY(-40px)';
      (content as HTMLElement).style.setProperty('--padding-top', '0px');
    });
  }

  ngOnInit(): void {
    // Initialize Capacitor plugins
    this.capacitorInit.initialize();

    // Initialize push notifications
    this.pushNotifications.initialize();

    // Initialize status bar
    this.initializeStatusBar();

    if (Capacitor.getPlatform() === 'ios') {
      this.fixLayout();
      App.addListener('resume', () => {
        const main = document.querySelector('ion-app') as HTMLElement;
        if (main) {
          // Move only the scrollable area upwards
          const header = main.querySelector('ion-header') as HTMLElement;
          const content = main.querySelector('ion-content') as HTMLElement;

          if (header) header.style.transform = 'translateY(-40px)';
          if (content) content.style.transform = 'translateY(-40px)';
        }
      });
    }

    // Set safe area insets
    SafeArea.getSafeAreaInsets().then(({ insets }) => {
      for (const [key, value] of Object.entries(insets)) {
        document.documentElement.style.setProperty(
          `--safe-area-inset-${key}`,
          `${value}px`
        );
      }
    });
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
