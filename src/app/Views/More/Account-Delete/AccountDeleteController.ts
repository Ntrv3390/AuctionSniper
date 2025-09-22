import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { PreferencesService } from 'src/app/services/Preferences';
import { TrackerService } from 'src/app/services/Tracker';
import { UIService } from 'src/app/services/UI';
import { NavigatorService } from 'src/app/services/Navigator';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AppEvents } from 'src/app/constants/constants';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

// Import icons
import { addIcons } from 'ionicons';
import {
  warningOutline,
  alertCircleOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-account-delete',
  templateUrl: './Account-Delete.html',
  styleUrls: ['./Account-Delete.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AccountDeletePage implements OnInit {
  email: string = '';
  userId: string = '';
  confirmUserId: string = '';

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private preferences: PreferencesService,
    private tracker: TrackerService,
    private ui: UIService,
    private navigator: NavigatorService,
    private api: AuctionSniperApiService
  ) {
    // Register icons
    addIcons({
      'warning-outline': warningOutline,
      'alert-circle-outline': alertCircleOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.refresh();
  }

  ionViewWillEnter() {
    this.refresh();
  }

  cancel() {
    this.navCtrl.navigateBack('/root/more');
  }

  async deleteAccount() {
    if (this.userId !== this.confirmUserId) {
      await this.ui.alert('Please ensure you\'ve typed your username exactly as shown to proceed.');
      return;
    }

    const confirmed = await this.ui.confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      'Delete Account Permanently?'
    );

    if (!confirmed) {
      this.confirmUserId = '';
      return;
    }

    this.tracker.track(TrackerConstants.Account.Delete);

    try {
      const result = await firstValueFrom(this.api.deleteAccount());
      this.confirmUserId = '';
      if (!result.success) {
        await this.ui.alert('Account deletion failed. Please try again later.');
        return;
      }

      const toast = await this.toastCtrl.create({
        message: 'Your account has been permanently deleted.',
        duration: 3000,
        color: 'success'
      });
      await toast.present();

      // Clear user authentication data
      await this.preferences.clearUserData();

      document.dispatchEvent(new CustomEvent(AppEvents.APP_USER_LOGGED_OUT));
      this.navigator.performNavigation({ stateName: '/login' }, true); // go to login/root
    } catch (error) {
      await this.ui.alert('Something went wrong. Please try again.');
    }
  }

  private refresh() {
    this.email = this.preferences.userEmail;
    this.userId = this.preferences.userId;
    this.confirmUserId = '';
  }
}