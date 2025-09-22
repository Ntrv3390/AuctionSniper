// dev-test-tools.page.ts (Ionic 7 + Angular)

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonItemDivider,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonButton
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import moment from 'moment';
// Services (replace with your actual Angular services)
import { ConfigurationService } from 'src/app/services/Configuration';

@Component({
  selector: 'app-dev-test-tools',
  templateUrl: './Dev-Test-Tools.html',
  styleUrls: ['./Dev-Test-Tools.scss'], // Fixed path
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonItemDivider,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonButton
  ]
})
export class DevTestToolsPage {

  constructor(
    private alertCtrl: AlertController,
    private configuration: ConfigurationService
  ) {}

  //#region Controller Events

  async downloadCaCert_click(): Promise<void> {
    // Open cert URL in system browser
    await Browser.open({ url: this.configuration.values.CertificateUrl });
  }

  async setRequirePinThreshold_click(): Promise<void> {
    const message = `Enter the value (in minutes) for PIN prompt threshold? Current setting is ${this.configuration.requirePinThreshold} minutes.`;

    const alert = await this.alertCtrl.create({
      header: 'Require PIN Threshold',
      message,
      inputs: [
        {
          name: 'threshold',
          type: 'number',
          placeholder: 'Minutes',
          value: this.configuration.requirePinThreshold.toString()
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          handler: (data) => {
            if (!data.threshold || isNaN(parseInt(data.threshold, 10))) {
              this.showAlert('Invalid value; a number is required.');
              return false;
            }
            this.configuration.requirePinThreshold = parseInt(data.threshold, 10);
            this.showAlert(`PIN prompt threshold is now set to ${data.threshold} minutes.`);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  resetPinTimeout_click(): void {
    this.configuration.lastPausedAt = moment('01-01-2000', 'MM-DD-yyyy');

    const message = `The PIN timeout has been set to more than 10 minutes ago. 
    To see the PIN screen, terminate the application via the OS task manager 
    (don't just background it), and then re-launch.`;

    this.showAlert(message, 'Reset PIN Timeout');
  }

  //#endregion

  //#region Helpers

  private async showAlert(message: string, header: string = 'Info'): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  //#endregion
}
