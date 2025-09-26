import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
} from '@ionic/angular/standalone';
import { PinEntryViewModel } from './PinEntryViewModel';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-pin-entry',
  templateUrl: './Pin-Entry.html',
  styleUrls: ['./pin-entry.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class PinEntryPage implements OnInit {
  viewModel: PinEntryViewModel = {
    pin: '',
    pinToMatch: '',
    showBackButton: false,
    promptText: '',
  };

  isLandscape = false;
  private operation: string = '';
  private newPin: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private preferences: PreferencesService,
    private ui: UIService,
    private toastController: ToastController
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (
          event.url.startsWith('/search/query') ||
          event.url.startsWith('/root/search')
        ) {
          return;
        }
      });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.viewModel.promptText =
        params['promptText'] || this.viewModel.promptText;
      this.viewModel.pinToMatch =
        params['pinToMatch'] || this.viewModel.pinToMatch;
      this.operation = params['operation'] || this.operation;
      this.newPin = params['newPin'] || this.newPin;
      this.viewModel.pin = '';
    });

    this.viewModel.showBackButton = true;
  }

  close_click() {
    this.location.back();
  }

  number_click(value: number | string) {
    if (this.viewModel.pin.length < 4) {
      this.viewModel.pin += value.toString();

      if (this.viewModel.pin.length === 4) {
        setTimeout(() => this.validatePin(), 200);
      }
    }
  }

  clear_click() {
    if (this.viewModel.pin.length > 0) {
      this.viewModel.pin = this.viewModel.pin.slice(0, -1);
    }
  }

  back_click() {
    this.location.back();
  }

  private resetWithError(message: string) {
    this.viewModel.pin = '';
    this.showToast(message, 'danger');
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' = 'danger'
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  private validatePin() {
    if (!this.viewModel.pin || this.viewModel.pin.length < 4) {
      return;
    }

    if (this.operation === '' || this.operation === 'login') {
      if (this.viewModel.pin === this.preferences.pin) {
        this.showToast('Login successful.', 'success');
        this.goHome();
      } else {
        this.resetWithError('Invalid PIN. Please try again.');
      }
      return;
    }

    switch (this.operation) {
      case 'set':
        this.navigateWithParams(
          'Confirm your new PIN',
          'set-confirm',
          this.viewModel.pin
        );
        break;

      case 'set-confirm':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = this.newPin;
          this.showToast('Your PIN has been configured.', 'success');
          this.goToPinPage();
        } else {
          this.resetWithError('PINs do not match. Please try again.');
        }
        break;

      case 'change-verify':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.navigateWithParams('Enter your new PIN', 'change-new');
        } else {
          this.resetWithError('Invalid PIN. Please try again.');
        }
        break;

      case 'change-new':
        this.navigateWithParams(
          'Confirm your new PIN',
          'change-confirm',
          this.viewModel.pin
        );
        break;

      case 'change-confirm':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = this.newPin;
          this.showToast('Your PIN has been changed.', 'success');
          this.goToPinPage();
        } else {
          this.resetWithError('PINs do not match. Please try again.');
        }
        break;

      case 'remove':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = '';
          this.showToast('The PIN has been removed.', 'success');
          this.goToPinPage();
        } else {
          this.resetWithError('Invalid PIN. Please try again.');
        }
        break;

      default:
        break;
    }
  }

  private goToPinPage() {
    this.router.navigateByUrl('/configure-pin', {
      replaceUrl: true,
      skipLocationChange: false,
    });
  }

  private navigateWithParams(
    promptText: string,
    operation: string,
    newPin: string = ''
  ) {
    this.router.navigate(['/pin-entry'], {
      replaceUrl: true,
      queryParams: {
        promptText,
        pinToMatch: this.viewModel.pin,
        operation,
        newPin,
      },
    });
  }

  private goHome() {
    this.router.navigate(['/root/search'], { replaceUrl: true });
  }
}
