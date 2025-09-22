import { Injectable } from '@angular/core';
import { SnackbarService, SnackbarLocation } from 'src/app/services/Snackbar';
import { BadgeManagerService } from 'src/app/services/BadgeManager';
import { SnackbarLevel } from 'src/app/services/Snackbar';
import { SnackbarOptions } from 'src/app/services/Snackbar'; // if using class
import { TabIndices } from '../constants/tab-indices.constants'; // Assuming this contains TabIndicies etc.

@Injectable({
  providedIn: 'root'
})
export class FreeSnipesService {

  private readonly REMINDER_MESSAGE = 'Complete the activation of your account to get your 3 free snipes. Please click the link in the email we sent to you.';
  private readonly USER_REGISTER_MESSAGE = 'Thanks for joining Auction Sniper! To receive your 3 free snipes, please click the activation link in the email we just sent you.';
  private hasSeenMessageThisSession = false;
  private showReminderFlag = false;

  constructor(
    private snackbar: SnackbarService,
    private badgeManager: BadgeManagerService
  ) {}

  get showReminderInMoreTab(): boolean {
    return this.showReminderFlag;
  }

  set showReminderInMoreTab(value: boolean) {
    this.showReminderFlag = value;
  }

  public showPostRegistrationMessage(): void {
    if (this.hasSeenMessageThisSession) {
      return;
    }
    this.hasSeenMessageThisSession = true;
    const messageOptions: SnackbarOptions = {
      message: this.USER_REGISTER_MESSAGE,
      title: 'Welcome',
      level: SnackbarLevel.Info,
      actionText: 'OK',
      autoClose: false,
      location: SnackbarLocation.Bottom // or SnackbarLocation.Top — depending on what you want
    };
    this.snackbar.show(messageOptions);
  }

  public showReminder(): void {
    if (this.hasSeenMessageThisSession) {
      return;
    }
    this.hasSeenMessageThisSession = true;

    this.badgeManager.addBadgeForTab(TabIndices.MORE);
    this.showReminderFlag = true;
    const messageOptions: SnackbarOptions = {
      message: this.REMINDER_MESSAGE,
      title: 'Account Activation',
      level: SnackbarLevel.Info,
      actionText: 'OK',
      autoClose: false,
      location: SnackbarLocation.Bottom // or SnackbarLocation.Top
    };
    this.snackbar.show(messageOptions);
  }
}
