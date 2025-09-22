import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonCheckbox, 
  IonItemDivider,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';
import { AccountPreferencesViewModel } from './AccountPreferencesViewModel';
import { TrackerService } from 'src/app/services/Tracker';
import { UIService } from 'src/app/services/UI';
import { PreferencesService } from 'src/app/services/Preferences';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { firstValueFrom } from 'rxjs';
import { IconPanelComponent } from 'src/app/directives/Icon-Panel/IconPanelDirective';

// Helper to wrap observables or promises (replace with your own utility if needed)
async function on<T>(fn: () => Promise<T>): Promise<{ error: any, data?: T }> {
  try {
    const data = await fn();
    return { error: null, data }
  } catch (error) {
    return { error }
  }
}

// Import icons
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  checkmarkCircleOutline,
  saveOutline,
  rainyOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-account-preferences',
  templateUrl: './Account-Preferences.html',
  styleUrls: ['./account-preferences.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonCheckbox,
    IonItemDivider,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonNote,
    IonSpinner,
    IconPanelComponent
  ]
})
export class AccountPreferencesPage implements OnInit {

  viewModel: AccountPreferencesViewModel = new AccountPreferencesViewModel();

  constructor(
    private tracker: TrackerService,
    private ui: UIService,
    private preferences: PreferencesService,
    private auctionSniperApi: AuctionSniperApiService
  ) {
    console.log('AccountPreferencesPage: Constructor called');
    
    // Register icons
    addIcons({
      'settings-outline': settingsOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'save-outline': saveOutline,
      'rainy-outline': rainyOutline
    });
  }

  ngOnInit(): void {
    console.log('AccountPreferencesPage: ngOnInit called');
    this.view_beforeEnter();
  }

  //#region BaseController Overrides

  private async view_beforeEnter(): Promise<void> {
    await this.refresh();
  }

  //#endregion

  //#region Controller Methods

  retry_click(): void {
    this.refresh();
  }

  async save_click(): Promise<void> {
    console.log('AccountPreferencesPage: save_click called');
    console.log('AccountPreferencesPage: Current viewModel preferences', this.viewModel.preferences);
    
    // Check if preferences are loaded
    if (!this.viewModel.preferences) {
      this.ui.alert('Preferences data is not loaded yet. Please try again.');
      return;
    }

    if (!this.viewModel.preferences.Delay || this.viewModel.preferences.Delay < 3 ||
        this.viewModel.preferences.Delay > 120) {
      this.ui.alert('Lead time must be a value between 3 and 120.');
      return;
    }
  
    this.tracker.track(TrackerConstants.Account.UpdateUserPreferences);
    
    // Show loading indicator
    this.viewModel.isLoading = true;
  
    try {
      const result = await firstValueFrom(
        this.auctionSniperApi.updateAccountPreferences(this.viewModel.preferences)
      );
  
      this.viewModel.showError = false;
  
      if (!result || !result.success) {
        return;
      }
  
      this.preferences.setAccountPreferences(result.preferences);
      this.viewModel.preferences = result.preferences;
  
    } catch (error) {
      console.error('Error updating preferences', error);
      this.ui.alert('An error occurred while saving preferences. Please try again.');
    } finally {
      // Hide loading indicator
      this.viewModel.isLoading = false;
    }
  }
  //#endregion

  //#region Private Methods

  private async refresh(): Promise<void> {
    this.viewModel.isLoading = true;
    try {
      const result = await firstValueFrom(this.auctionSniperApi.getAccountPreferences());
  
      this.viewModel.showError = false;
  
      if (!result || !result.success) {
        this.viewModel.showError = true;
        this.viewModel.isLoading = false;
        return;
      }
  
      console.log('AccountPreferencesPage: Received preferences data', result.preferences);
      this.viewModel.preferences = result.preferences;
      console.log('AccountPreferencesPage: Updated viewModel preferences', this.viewModel.preferences);
    } catch (error) {
      this.viewModel.showError = true;
      console.error('Error loading preferences', error);
    } finally {
      this.viewModel.isLoading = false;
    }
  }

  //#endregion
}