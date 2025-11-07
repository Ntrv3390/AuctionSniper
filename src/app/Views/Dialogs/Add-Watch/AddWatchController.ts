import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar } from '@capacitor/status-bar';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
} from '@ionic/angular/standalone';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { PluginsService } from 'src/app/services/Plugins';
import { UIService } from 'src/app/services/UI';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { DataSourceService } from 'src/app/services/DataSource';
import { TrackerService } from 'src/app/services/Tracker';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-watch',
  templateUrl: './Add-Watch.html',
  styleUrls: ['./Add-Watch.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
  ],
})
export class AddWatchComponent implements OnInit {
  @Input() data!: { itemnumber?: string };

  viewModel: any = {
    itemnumber: '',
    folderId: '1',
    watchQuantity: '1',
    watchPrice: undefined,
    comment: '',
  };

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private Plugins: PluginsService,
    private UI: UIService,
    private AuctionSniperApi: AuctionSniperApiService,
    private DataSource: DataSourceService,
    private Tracker: TrackerService,
    private platform: Platform
  ) {}

  async ngOnInit() {}

  async ionViewDidEnter() {
    // If data contains item number, navigate after view is ready
    const itemNumber = this.data?.itemnumber || '';
    if (itemNumber) {
      await this.modalCtrl.dismiss(); // properly close modal first
      this.router.navigate(['/watch/add'], {
        queryParams: { itemNumber },
      });
    }
  }

  //#region Controller Methods
  cancel_click(): void {
    this.close(false);
  }

  async addWatch_click(): Promise<void> {
    if (!this.viewModel.itemnumber) {
      this.UI.showInfoSnackbar('An eBay item number is required.');
      return;
    }

    if (!this.viewModel.watchQuantity) {
      this.UI.showInfoSnackbar('A max offer is required.');
      return;
    }

    this.Tracker.track(TrackerConstants.Watch.AddWatch);

    const params: AuctionSniperApiTypes.CreateWatchParameters = {
      itemNumber: this.viewModel.itemnumber,
      watchQuantity: parseInt(this.viewModel.watchQuantity, 10),
      watchPrice: this.viewModel.watchPrice,
      folderId: parseInt(this.viewModel.folderId, 10),
      comment: this.viewModel.comment,
    };

    try {
      const result = await firstValueFrom(
        this.AuctionSniperApi.createWatch(params)
      );

      if (result.success) {
        this.UI.showSuccessSnackbar('Watch added!');
        if (this.DataSource.watches) {
          this.DataSource.watches.push(result.watches[0]);
        }
        this.close(true);
      } else {
        const msg = result?.message?.MessageContent ?? 'Failed to add watch.';
        this.UI.showErrorSnackbar(msg);
      }
    } catch (error: any) {
      const msg = error?.message?.MessageContent ?? 'Failed to add watch.';
      this.UI.showErrorSnackbar(msg);
      console.error(error);
    }
  }
  //#endregion

  private close(success: boolean) {
    this.modalCtrl.dismiss(success);
  }
}
