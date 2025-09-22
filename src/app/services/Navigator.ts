// // src/app/services/navigator.service.ts

import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Logger } from 'src/app/services/Logger';
import { PreferencesService } from 'src/app/services/Preferences';
import { ReviewsService } from 'src/app/services/Reviews';
import { PushNotificationsService } from 'src/app/services/PushNotifications';
import { EbayService } from 'src/app/services/Ebay';
import { FreeSnipesService } from 'src/app/services/FreeSnipes';

import { NavController, TabsCustomEvent } from '@ionic/angular';
import { Utilities } from 'src/app/services/Utilities';


export interface NavigationState {
  stateName: string;
  stateParam?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NavigatorService {
  private readonly HOME_NAV_STATE: NavigationState = { stateName: '/root' };
  private _navToAfterLogin: NavigationState | null = null;
  private _deferredNavState: NavigationState | null = null;
  private _deferredNavStateAllowNavigateWhenLoggedOut: boolean | null = null;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private logger: Logger,
    private utilities: Utilities,
    private preferences: PreferencesService,
    private reviews: ReviewsService,
    private pushNotifications: PushNotificationsService,
    private ebay: EbayService,
    private freeSnipes: FreeSnipesService
  ) {}

  get suppressNextRender(): boolean {
    return this._deferredNavState != null;
  }

  async continueAfterSuccessfulLogin(user: any, userRegistered: boolean = false): Promise<void> {
    console.log('NavigatorService: continueAfterSuccessfulLogin called with user:', user);
    console.log('NavigatorService: userRegistered:', userRegistered);

    // In Angular, you'd use Subjects/Events instead of $rootScope broadcasts
    // Example: an AuthService BehaviorSubject to notify other parts of the app

    try {
      await this.ebay.ensureValidEbayToken(true, true);
    } catch (err) {
      return;
    }

    if (userRegistered) {
      console.log('NavigatorService: Showing post registration message');
      this.freeSnipes.showPostRegistrationMessage();
    }

    console.log('NavigatorService: Calling performNavigationAfterLogin');
    this.performNavigationAfterLogin();
  }

  performNavigation(navigationState: NavigationState | null, allowNavigateWhenLoggedOut = false): void {
    const isOnBlankView = this.router.url === '/blank';
    const isOnLoginView = this.router.url === '/login';
    const isOnRootView = this.router.url.startsWith('/root');

    console.log('NavigatorService: performNavigation called');
    console.log('NavigatorService: Current URL:', this.router.url);
    console.log('NavigatorService: isUserLoggedIn:', this.preferences.isUserLoggedIn);
    console.log('NavigatorService: navigationState:', navigationState);

    // If we're already on a root view (authenticated area), don't redirect to login
    if (!this.preferences.isUserLoggedIn && !allowNavigateWhenLoggedOut && !isOnRootView) {
      console.log('NavigatorService: User not logged in, saving navigation state and redirecting to login');
      this._navToAfterLogin = navigationState || null;

      if (!isOnLoginView) {
        this.navCtrl.navigateRoot('/login');
      }
      return;
    }

    if (navigationState) {
      console.log('NavigatorService: Navigating to provided state:', navigationState);
      this.doNavigate(navigationState, allowNavigateWhenLoggedOut);
      return;
    }

    if (isOnBlankView) {
      console.log('NavigatorService: On blank view, navigating to home');
      this.doNavigate(this.HOME_NAV_STATE);
    }
  }

  performDeferredNavigation(): void {
    const navState = this._deferredNavState;
    const allowNavigateWhenLoggedOut = this._deferredNavStateAllowNavigateWhenLoggedOut;

    this._deferredNavState = null;
    this._deferredNavStateAllowNavigateWhenLoggedOut = null;

    if (!navState || !navState.stateName) {
      this.logger.error('NavigatorService', 'performDeferredNavigation', 'Deferred navigation was requested but no state provided');
      return;
    }

    setTimeout(() => {
      this.performNavigation(navState, allowNavigateWhenLoggedOut || false);
    });
  }

  async handleNavigationOnResume(coldBoot: boolean): Promise<void> {
    let initialNavState: NavigationState | null = null;

    try {
      const pnLaunchAction = await this.pushNotifications.getLaunchAction();
      if (pnLaunchAction) {
        const pnNavState = await this.pushNotifications.handlePushNotification(pnLaunchAction.notification, true);
        initialNavState = pnNavState;
      }
    } catch (err) {
      this.logger.error('Application', 'resume', 'Error handling push notification on resume', err);
    }

    if (coldBoot && !initialNavState) {
      this.reviews.promptForReviewIfApplicable();
    }

    this.performNavigation(initialNavState);
  }

  private performNavigationAfterLogin(): void {
    console.log('NavigatorService: performNavigationAfterLogin called');
    // In modern Ionic, "clearHistory" is done by using navigateRoot
    const navToAfterLogin = this._navToAfterLogin;
    this._navToAfterLogin = null;

    console.log('NavigatorService: navToAfterLogin:', navToAfterLogin);
    console.log('NavigatorService: HOME_NAV_STATE:', JSON.stringify(this.HOME_NAV_STATE));

    if (navToAfterLogin) {
      console.log('NavigatorService: Navigating to saved navigation state:', navToAfterLogin);
      this.doNavigate(navToAfterLogin);
      return;
    }
    console.log('NavigatorService: Navigating to home state:', this.HOME_NAV_STATE);
    this.doNavigate(this.HOME_NAV_STATE);
  }

  private doNavigate(navState: NavigationState, allowNavigateWhenLoggedOut = false): void {
    console.log('NavigatorService: doNavigate called with navState:', navState);

    if (!navState || !navState.stateName) {
      console.error('NavigatorService: Invalid navigation state, falling back to search/query');
      this.logger.error('NavigatorService', 'doNavigate', 'Invalid navigation state');
      this.navCtrl.navigateRoot('/root/search', { replaceUrl: true });
      return;
    }

    console.log('NavigatorService: Navigating to:', navState.stateName);
    console.log('NavigatorService: With params:', navState.stateParam);

    // Tab handling — In Ionic 7, tabs navigation is handled by router links or NavController
    this.navCtrl.navigateRoot(navState.stateName, {
      queryParams: navState.stateParam || {},
      replaceUrl: true
    }).then(() => {
      console.log('NavigatorService: Navigation completed successfully to:', navState.stateName);
    }).catch((error) => {
      console.error('NavigatorService: Navigation failed:', error);
      console.log('NavigatorService: Attempting fallback navigation to /search/query');
      this.navCtrl.navigateRoot('/root/search', { replaceUrl: true });
    });
  }

  async selectTab(tabRootRoute: string, index: number): Promise<void> {
    const routes = [
      `${tabRootRoute}/home`,
      `${tabRootRoute}/search`,
      `${tabRootRoute}/profile`,
    ];

    if (index >= 0 && index < routes.length) {
      await this.router.navigate([routes[index]]);
    } else {
      console.warn(`Tab index ${index} is out of range.`);
    }
  }

}
