import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurePinViewModel } from './ConfigurePinViewModel';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';
import { TrackerService } from 'src/app/services/Tracker';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { PinEntryDialogModel } from 'src/app/Views/Dialogs/Pin-Entry/PinEntryDialogModel';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonText,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonItemDivider,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-configure-pin',
  templateUrl: './Configure-Pin.html',
  styleUrls: ['./configure-pin.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonText,
    IonButton,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonItemDivider,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class ConfigurePinPage implements OnInit {

  viewModel: ConfigurePinViewModel = new ConfigurePinViewModel();

  constructor(
    private tracker: TrackerService,
    private ui: UIService,
    private preferences: PreferencesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.view_beforeEnter();
  }

  //#region BaseController Overrides

  view_beforeEnter(): void {
    this.viewModel.isPinSet = this.preferences.pin !== null;
  }

  //#endregion

  //#region Controller Methods

  async setPin_click(): Promise<void> {
    this.tracker.track(TrackerConstants.Account.SetPin);
    
    // Navigate to PIN entry page for setting PIN
    this.router.navigate(['/pin-entry'], {
      queryParams: {
        promptText: 'Enter a value for your new PIN',
        operation: 'set'
      }
    });
  }

  async changePin_click(): Promise<void> {
    this.tracker.track(TrackerConstants.Account.ChangePin);
    
    // Navigate to PIN entry page for changing PIN (first step - verify current PIN)
    this.router.navigate(['/pin-entry'], {
      queryParams: {
        promptText: 'Enter your current PIN',
        pinToMatch: this.preferences.pin,
        operation: 'change-verify'
      }
    });
  }

  async removePin_click(): Promise<void> {
    this.tracker.track(TrackerConstants.Account.RemovePin);
    
    // Navigate to PIN entry page for removing PIN
    this.router.navigate(['/pin-entry'], {
      queryParams: {
        promptText: 'Enter your current PIN',
        pinToMatch: this.preferences.pin,
        operation: 'remove'
      }
    });
  }

  //#endregion
}
