import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
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
  IonButton
} from '@ionic/angular/standalone';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
// Services — replace with your actual Angular service implementations
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
    IonButton
  ]
})
export class AddWatchComponent implements OnInit {

  @Input() data!: { itemnumber?: string };

  viewModel: any = {
    itemnumber: '',
    folderId: '1',
    watchQuantity: '1',
    watchPrice: undefined,
    comment: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private Plugins: PluginsService,
    private UI: UIService,
    private AuctionSniperApi: AuctionSniperApiService,
    private DataSource: DataSourceService,
    private Tracker: TrackerService
  ) {}

  ngOnInit() {
    // Redirect to the new watch edit page instead of showing the dialog
    const itemNumber = this.data?.itemnumber || '';
    if (itemNumber) {
      this.router.navigate(['/watch/add'], { queryParams: { itemNumber: itemNumber } });
    } else {
      this.router.navigate(['/watch/add']);
    }
    this.close(false);
  }

  //#region BaseDialogController Overrides
  protected dialog_shown(): void {
    this.viewModel.itemnumber = this.data?.itemnumber || '';
    this.viewModel.folderId = '1';
    this.viewModel.watchQuantity = '1';
  }
  //#endregion

  //#region Controller Methods
  protected cancel_click(): void {
    this.close(false);
  }

  protected async addWatch_click(): Promise<void> {
    await Keyboard.hide();
  
    if (!this.viewModel.itemnumber) {
      this.UI.showInfoSnackbar('An e-bay item number is required.');
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
      comment: this.viewModel.comment
    };
  
    try {
      const result = await firstValueFrom(this.AuctionSniperApi.createWatch(params));
  
      if (result.success) {
        this.UI.showSuccessSnackbar('Watch added!');
        if (this.DataSource.watches) {
          this.DataSource.watches.push(result.watches[0]);
        }
        this.close(true);
      }
    } catch (error) {
      this.UI.showErrorSnackbar('Failed to add watch.');
      console.error(error);
    }
  }
  
  //#endregion

  private close(success: boolean) {
    this.modalCtrl.dismiss(success);
  }
}
