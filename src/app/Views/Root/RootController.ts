import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
  IonRouterOutlet
} from '@ionic/angular/standalone';
import { RootViewModel } from './RootViewModel';
import { AppEvents } from 'src/app/constants/constants';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  eyeOutline,
  ellipsisHorizontalOutline,
  locateOutline
} from 'ionicons/icons';
import { TabIndices } from 'src/app/constants/tab-indices.constants';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { UIService } from 'src/app/services/UI';

@Component({
  selector: 'app-root-controller',
  templateUrl: './Root.html',
  styleUrls: ['./root.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge,
    IonRouterOutlet
  ]
})
export class RootController implements OnInit, OnDestroy {
  public viewModel: RootViewModel = new RootViewModel();
  private _hasLoaded = false;
  private subscriptions: Subscription[] = [];
  private lastBackPressTime: number = 0;

  constructor(
    private platform: Platform,
    private router: Router,
    private ui: UIService
  ) {
    // Register icons for tabs
    addIcons({
      'search-outline': searchOutline,
      'eye-outline': eyeOutline,
      'ellipsis-horizontal-outline': ellipsisHorizontalOutline,
      'locate-outline': locateOutline
    });
  }

  //#region Angular Lifecycle

  ngOnInit(): void {
    this.view_loaded();
    this.initializeBackButtonHandling();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  //#endregion

  //#region BaseController Overrides (simulated)

  protected view_loaded(): void {
    if (this._hasLoaded) {
      return;
    }

    this._hasLoaded = true;

    // Localization setup
    this.viewModel.localization = 'English'; // adapt as per localization service

    // Event subscriptions
    this.subscriptions.push(
      this.viewModel.on(AppEvents.APP_SHOW_TABS).subscribe(() => this.app_showTabs()),
      this.viewModel.on(AppEvents.APP_HIDE_TABS).subscribe(() => this.app_hideTabs()),
      this.viewModel.on(AppEvents.APP_BADGES_UPDATED).subscribe((badges: Record<string, number>) =>
        this.app_badgesUpdated(badges)
      )
    );

    this.viewModel.showTabs = true;
  }

  //#endregion

  //#region Event Handlers

  private app_showTabs(): void {
    this.viewModel.showTabs = true;
  }

  private app_hideTabs(): void {
    this.viewModel.showTabs = false;
  }

  private app_badgesUpdated(badges: Record<string, number>): void {
    Object.keys(badges).forEach(key => {
      if (!key.startsWith('tab_')) {
        return;
      }

      const tabIndex = parseInt(key.split('_')[1], 10);
      const count = badges[key];

      switch (tabIndex) {
        case TabIndices.SEARCH:
          this.viewModel.searchTabBadgeCount = count;
          break;
        case TabIndices.WATCHES:
          this.viewModel.watchesTabBadgeCount = count;
          break;
        case TabIndices.SNIPES:
          this.viewModel.snipesTabBadgeCount = count;
          break;
        case TabIndices.MORE:
          this.viewModel.moreTabBadgeCount = count;
          break;
      }
    });
  }

  //#endregion

  //#region Controller Methods

  /**
   * Handle tab change events
   * @param event The tab change event
   */
  onTabChange(event: any): void {
    console.log('Tab changed to:', event.tab);
  }

  /**
   * Initialize back button handling for hardware back button
   */
  private initializeBackButtonHandling(): void {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      // Check if we're on the root page (main tabs)
      const currentUrl = this.router.url;
      
      // If we're on one of the main tab routes, show exit confirmation
      if (currentUrl === '/root/search' || 
          currentUrl === '/root/watches' || 
          currentUrl === '/root/snipes' || 
          currentUrl === '/root/more') {
        
        // Check if back button was pressed recently (within 2 seconds)
        const currentTime = new Date().getTime();
        if (currentTime - this.lastBackPressTime < 2000) {
          // Exit the app
          App.exitApp();
        } else {
          // Show a message asking user to press back again
          this.ui.showInfoSnackbar('Press back again to exit');
          this.lastBackPressTime = currentTime;
        }
      } else {
        // For other pages, let the default back navigation happen
        window.history.back();
      }
    });
  }

  //#endregion
}