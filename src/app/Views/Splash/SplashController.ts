import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PreferencesService } from 'src/app/services/Preferences';
import { NavController } from '@ionic/angular';
import { PluginsService } from 'src/app/services/Plugins';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './Splash.html',
  styleUrls: ['./Splash.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SplashController implements OnInit {
  constructor(
    private preferences: PreferencesService,
    private navCtrl: NavController,
    private plugins: PluginsService,
    private router: Router
  ) {
    console.log('SplashController: Constructor called');
  }

  async ngOnInit(): Promise<void> {
    console.log('SplashController: ngOnInit called');
    // Start progress animation
    this.animateProgress();

    // Initialize app
    await this.initializeApp();
  }

  private animateProgress(): void {
    console.log('SplashController: animateProgress called');
    // This is handled by CSS animation, but we could also control it programmatically if needed
  }

  private async initializeApp(): Promise<void> {
    console.log('SplashController: initializeApp called');
    try {
      // Initialize preferences
      await this.preferences.initialize();
      console.log('SplashController: Preferences initialized');

      // Simulate a minimum loading time for better UX (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Hide the native splash screen
      try {
        await this.plugins.splashScreen.hide();
        console.log('SplashController: Native splash screen hidden');
      } catch (error) {
        console.error(
          'SplashController: Error hiding native splash screen',
          error
        );
      }

      // this.navCtrl.navigateRoot('/root/search', { replaceUrl: true });

      // Check if user is logged in and redirect accordingly
      console.log(
        'SplashController: User logged in status:',
        this.preferences.isUserLoggedIn
      );
      if (this.preferences.isUserLoggedIn) {
        // User is logged in, go to root page with default tab
        const savedPin = this.preferences.pin;

        if (savedPin && savedPin.trim() !== '') {
          this.router.navigate(['/pin-entry'], {
            queryParams: {
              promptText: 'Enter your PIN to continue',
              operation: 'login',
            },
          });
        } else {
          console.log('SplashController: Navigating to root');
          this.navCtrl.navigateRoot('/root/search', { replaceUrl: true });
        }
      } else {
        // User is not logged in, go to login page
        console.log('SplashController: Navigating to login');
        this.navCtrl.navigateRoot('/login', { replaceUrl: true });
      }
    } catch (error) {
      console.error('Error during app initialization:', error);
      // Fallback to login if there's an error
      try {
        await this.plugins.splashScreen.hide();
      } catch (hideError) {
        console.error(
          'Error hiding native splash screen in fallback',
          hideError
        );
      }
      this.navCtrl.navigateRoot('/login', { replaceUrl: true });
    }
  }
}
