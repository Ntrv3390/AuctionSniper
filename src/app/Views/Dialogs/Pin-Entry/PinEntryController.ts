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
import { PinEntryDialogResultModel } from './PinEntryDialogResultModel';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';

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

  private operation: string = '';
  private newPin: string = '';

  // Add missing properties
  isLandscape = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private preferences: PreferencesService,
    private ui: UIService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['promptText']) {
        this.viewModel.promptText = params['promptText'];
      }
      if (params['pinToMatch']) {
        this.viewModel.pinToMatch = params['pinToMatch'];
      }
      if (params['operation']) {
        this.operation = params['operation'];
      }
      if (params['newPin']) {
        this.newPin = params['newPin'];
      }
    });

    this.viewModel.pin = '';
    this.viewModel.showBackButton = true;
  }

  // Add missing close_click method
  close_click() {
    this.location.back();
  }

  number_click(value: number | string) {
    if (this.viewModel.pin.length < 4) {
      this.viewModel.pin += value.toString();

      // When PIN reaches 4 digits, validate it
      if (this.viewModel.pin.length === 4) {
        setTimeout(() => this.validatePin(), 300);
      }
    }
  }

  // Clear PIN
  // Remove last entered digit
  clear_click() {
    if (this.viewModel.pin.length > 0) {
      // Remove last character
      this.viewModel.pin = this.viewModel.pin.slice(0, -1);
    }
  }

  // Go back
  back_click() {
    this.location.back();
  }

  private resetWithError(message: string) {
    this.viewModel.pin = '';
    this.showToast(message);
  }

  // Old validatePin method
  private validatePin() {
    switch (this.operation) {
      case 'set':
        this.router.navigate(['/pin-entry'], {
          replaceUrl: true, // 👈 avoids stacking pages
          queryParams: {
            promptText: 'Confirm your new PIN',
            pinToMatch: this.viewModel.pin,
            operation: 'set-confirm',
            newPin: this.viewModel.pin,
          },
        });
        break;

      case 'set-confirm':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = this.newPin;
          this.ui.showSuccessSnackbar('Your PIN has been configured.');
          this.location.back();
        } else {
          this.resetWithError('PINs do not match. Please try again.');
        }
        break;

      case 'change-verify':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.router.navigate(['/pin-entry'], {
            replaceUrl: true,
            queryParams: {
              promptText: 'Enter your new PIN',
              operation: 'change-new',
            },
          });
        } else {
          this.resetWithError('Invalid PIN. Please try again.');
        }
        break;

      case 'change-new':
        this.router.navigate(['/pin-entry'], {
          replaceUrl: true,
          queryParams: {
            promptText: 'Confirm your new PIN',
            pinToMatch: this.viewModel.pin,
            operation: 'change-confirm',
            newPin: this.viewModel.pin,
          },
        });
        break;

      case 'change-confirm':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = this.newPin;
          this.ui.showSuccessSnackbar('Your PIN has been changed.');
          this.location.back();
        } else {
          this.resetWithError('PINs do not match. Please try again.');
        }
        break;

      case 'remove':
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = '';
          this.ui.showSuccessSnackbar('The PIN has been removed.');
          this.location.back();
        } else {
          this.resetWithError('Invalid PIN. Please try again.');
        }
        break;

      default:
        if (this.viewModel.pinToMatch) {
          if (this.viewModel.pin === this.viewModel.pinToMatch) {
            this.location.back();
          } else {
            this.resetWithError('Invalid PIN. Please try again.');
          }
        } else {
          this.location.back();
        }
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }
}
