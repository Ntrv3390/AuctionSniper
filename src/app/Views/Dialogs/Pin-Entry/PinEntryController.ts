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
  IonCol
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
    IonCol
  ]
})
export class PinEntryPage implements OnInit {
  viewModel: PinEntryViewModel = {
    pin: '',
    pinToMatch: '',
    showBackButton: false,
    promptText: ''
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
    private ui: UIService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
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

  // Old number_click method
  number_click(value: number | string) {
    if (this.viewModel.pin.length < 4) {
      this.viewModel.pin += value;
      if (this.viewModel.pin.length === 4) {
        setTimeout(() => this.validatePin(), 700);
      }
    }
  }

  // Old clear_click method
  clear_click() {
    this.viewModel.pin = '';
  }

  // Old back_click method
  back_click() {
    this.location.back();
  }

  // Old validatePin method
  private validatePin() {
    switch (this.operation) {
      case 'set':
        // For setting PIN, we need to confirm it
        this.router.navigate(['/pin-entry'], {
          queryParams: {
            promptText: 'Confirm your new PIN',
            pinToMatch: this.viewModel.pin,
            operation: 'set-confirm',
            newPin: this.viewModel.pin
          }
        });
        break;
        
      case 'set-confirm':
        // Confirm the PIN matches
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = this.newPin;
          this.ui.showSuccessSnackbar('Your PIN has been configured.');
          this.location.back();
        } else {
          this.viewModel.pin = '';
          this.showToast('PINs do not match. Please try again.');
        }
        break;
        
      case 'change-verify':
        // Verify current PIN
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          // Prompt for new PIN
          this.router.navigate(['/pin-entry'], {
            queryParams: {
              promptText: 'Enter your new PIN',
              operation: 'change-new'
            }
          });
        } else {
          this.viewModel.pin = '';
          this.showToast('Invalid PIN. Please try again.');
        }
        break;
        
      case 'change-new':
        // Set new PIN, now confirm it
        this.router.navigate(['/pin-entry'], {
          queryParams: {
            promptText: 'Confirm your new PIN',
            pinToMatch: this.viewModel.pin,
            operation: 'change-confirm',
            newPin: this.viewModel.pin
          }
        });
        break;
        
      case 'change-confirm':
        // Confirm new PIN matches
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = this.newPin;
          this.ui.showSuccessSnackbar('Your PIN has been changed.');
          this.location.back();
        } else {
          this.viewModel.pin = '';
          this.showToast('PINs do not match. Please try again.');
        }
        break;
        
      case 'remove':
        // Verify PIN for removal
        if (this.viewModel.pin === this.viewModel.pinToMatch) {
          this.preferences.pin = '';
          this.ui.showSuccessSnackbar('The PIN has been removed.');
          this.location.back();
        } else {
          this.viewModel.pin = '';
          this.showToast('Invalid PIN. Please try again.');
        }
        break;
        
      default:
        // For simple verification
        if (this.viewModel.pinToMatch) {
          if (this.viewModel.pin === this.viewModel.pinToMatch) {
            this.location.back();
          } else {
            this.viewModel.pin = '';
            this.showToast('Invalid pin; please try again.');
          }
        } else {
          this.location.back();
        }
    }
  }

  // Replacement for UI.showInfoSnackbar
  private async showToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2000;
    toast.position = 'bottom';
    document.body.appendChild(toast);
    await toast.present();
  }
}
