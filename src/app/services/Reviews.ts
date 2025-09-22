// Migrated version of Reviews service from Ionic 3 (AngularJS) to Ionic 7 (modern Angular)

import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { ConfigurationService } from 'src/app/services/Configuration';
import { PreferencesService } from 'src/app/services/Preferences';
import { PlatformService } from 'src/app/services/Platform';
import { UIService } from 'src/app/services/UI';
import { TrackerService } from 'src/app/services/Tracker';
import { TrackerConstants } from 'src/app/constants/tracker.constants';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  constructor(
    private configuration: ConfigurationService,
    private preferences: PreferencesService,
    private platform: PlatformService,
    private ui: UIService,
    private tracker: TrackerService
  ) {}

  async promptForReviewIfApplicable(): Promise<void> {
    if (this.preferences.hasPromptedForReview) {
      return;
    }

    if (!this.preferences.winsCount || this.preferences.winsCount < 2) {
      return;
    }

    this.preferences.hasPromptedForReview = true;

    const message = 'If you are happy with Auction Sniper we would love your support! Will you take a moment to review us in the App Store?';
    const title = 'Feedback';

    const dialogOk = await this.ui.confirm(message, title, 'Sure!', 'No thanks');

    if (dialogOk) {
      this.tracker.track(TrackerConstants.Review.ReviewAccepted);

      const isAndroid = Capacitor.getPlatform() === 'android';
      const url = isAndroid
        ? this.configuration.values.AppReviewURL_Android
        : this.configuration.values.AppReviewURL_iOS;

      await Browser.open({ url });
    } else {
      this.tracker.track(TrackerConstants.Review.ReviewDeclined);
    }
  }
}
