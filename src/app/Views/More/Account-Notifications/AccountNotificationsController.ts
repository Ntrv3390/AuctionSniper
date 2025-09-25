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
  IonCheckbox,
  IonItemDivider,
  IonBackButton,
} from '@ionic/angular/standalone';
import { AccountNotificationsViewModel } from './AccountNotificationsViewModel';
import { TrackerService } from 'src/app/services/Tracker';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-account-notifications',
  templateUrl: './Account-Notifications.html',
  styleUrls: ['./account-notifications.page.scss'],
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
    IonBackButton,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonItemDivider,
  ],
})
export class AccountNotificationsPage implements OnInit {
  viewModel: AccountNotificationsViewModel =
    new AccountNotificationsViewModel();

  constructor(
    private tracker: TrackerService,
    private auctionSniperApi: AuctionSniperApiService
  ) {}

  ngOnInit(): void {
    this.view_beforeEnter();
  }

  // Equivalent of view_beforeEnter
  private async view_beforeEnter(): Promise<void> {
    await this.refresh();
  }

  // Retry click
  retry_click(): void {
    this.refresh();
  }

  // Save click
  async save_click(): Promise<void> {
    this.tracker.track(TrackerConstants.Account.UpdateUserNotifications);

    // Show loader
    this.viewModel.isLoading = true;

    try {
      const result = await firstValueFrom(
        this.auctionSniperApi.updateNotificationPreferences(
          this.viewModel.preferences
        )
      );

      if (!result || !result.success) {
        return;
      }

      this.viewModel.preferences = result.preferences;
    } catch (error) {
      console.error('Error updating notification preferences', error);
    } finally {
      // Hide loader
      this.viewModel.isLoading = false;
    }
  }

  // Private Methods
  private async refresh(): Promise<void> {
    // Show loader
    this.viewModel.isLoading = true;

    try {
      const result = await firstValueFrom(
        this.auctionSniperApi.getNotificationPreferences()
      );

      if (!result || !result.success) {
        this.viewModel.showError = true;
        return;
      }

      this.viewModel.preferences = result.preferences;
      this.viewModel.showError = false;
    } catch (error) {
      console.error('Error loading notification preferences', error);
      this.viewModel.showError = true;
    } finally {
      // Hide loader
      this.viewModel.isLoading = false;
    }
  }
}
