import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { PreferencesService } from 'src/app/services/Preferences';
import { UIService } from 'src/app/services/UI';
import { DataSourceService } from 'src/app/services/DataSource';
import { TrackerService } from 'src/app/services/Tracker';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { EditSnipeViewModel } from './EditSnipeViewModel';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Keyboard } from '@capacitor/keyboard';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonCheckbox
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-edit-snipe',
  templateUrl: './Edit-Snipe.html',
  styleUrls: ['./Edit-Snipe.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonCheckbox
  ]
})
export class EditSnipeController implements OnInit {
  viewModel: EditSnipeViewModel = new EditSnipeViewModel();

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private preferences: PreferencesService,
    private ui: UIService,
    private auctionSniperApi: AuctionSniperApiService,
    private dataSource: DataSourceService,
    private tracker: TrackerService
  ) {}

  ngOnInit() {
    this.dialog_shown();
  }

  /** Load page state */
  private dialog_shown(): void {
    this.viewModel.manualEntry = false;

    // Get parameters from route
    this.route.queryParams.subscribe(params => {
      if (params['itemNumber']) {
        this.viewModel.itemNumber = params['itemNumber'];
      }
      if (params['title']) {
        this.viewModel.title = params['title'];
      }
      if (params['currentPrice']) {
        this.viewModel.currentPrice = params['currentPrice'];
      }
      
      // Set default values for new snipe
      this.viewModel.bidEnhancement = '0';
      this.viewModel.leadTime = this.preferences.defaultSnipeDelay.toString();
      this.viewModel.addShippingInsurance = this.preferences.defaultAddShippingInsurance;
      this.viewModel.manualEntry = !this.viewModel.itemNumber;
    });

    this.viewModel.showAddShippingInsurance = this.preferences.showAddShippingInsurance;
    this.viewModel.showAddComment = this.preferences.showAddComment;
  }

  private async loadSnipe(id: number) {
    try {
      const result = await firstValueFrom(this.auctionSniperApi.getSnipeInfo(id));
      if (result.success) {
        this.viewModel.maximumBid = result.snipe.MaxBid
          ? Number(result.snipe.MaxBid).toFixed(2)
          : '0.00';
        this.viewModel.id = result.snipe.Id;
        this.viewModel.title = result.snipe.Title;
        this.viewModel.itemNumber = result.snipe.Item;
        this.viewModel.leadTime = result.snipe.Delay.toString();
        this.viewModel.comment = result.snipe.Comment;
        this.viewModel.currentPrice = result.snipe.CurrentPrice;
        this.viewModel.bidEnhancement = result.snipe.BidEnhancement.toString();
        this.viewModel.addShippingInsurance = result.snipe.ShippingInsuranceID >= 0;
      }
    } catch {
      this.ui.showErrorSnackbar('Failed to load snipe.');
    }
  }

  cancel_click(): void {
    // Navigate back instead of closing modal
    this.location.back();
  }

  secondShotHelpIcon_click(): void {
    this.ui.showInfoSnackbar('Second Shot retries bidding if the first attempt fails.');
  }

  async addSnipe_click(): Promise<void> {
    // Hide keyboard
    await Keyboard.hide();

    if (!this.isValidSnipe()) return;

    if (this.viewModel.id) {
      this.tracker.track(TrackerConstants.Snipe.Update);

      const updateParams: AuctionSniperApiTypes.CreateSnipeParameters = {
        Id: this.viewModel.id,
        Item: this.viewModel.itemNumber,
        MaxBid: this.viewModel.maximumBid,
        Delay: parseInt(this.viewModel.leadTime, 10),
        Title: this.viewModel.title,
        BidEnhancement: parseInt(this.viewModel.bidEnhancement, 10),
        Comment: this.viewModel.comment,
        ShipInsure: this.viewModel.addShippingInsurance
      };
      await this.updateSnipe(updateParams);
    } else {
      this.tracker.track(TrackerConstants.Snipe.Add);

      const addParams: AuctionSniperApiTypes.CreateSnipeParameters = {
        Item: this.viewModel.itemNumber,
        MaxBid: this.viewModel.maximumBid,
        Delay: parseInt(this.viewModel.leadTime, 10),
        Title: this.viewModel.title,
        BidEnhancement: parseInt(this.viewModel.bidEnhancement, 10),
        Comment: this.viewModel.comment,
        ShipInsure: this.viewModel.addShippingInsurance
      };

      const result = await firstValueFrom(this.auctionSniperApi.createSnipe(addParams));
      if (result.success) {
        this.ui.showSuccessSnackbar('Snipe added!');
        this.dataSource.activeSnipes?.push(result.snipe);
        // Navigate back to snipe list after adding
        this.location.back();
      }
    }
  }

  private async updateSnipe(updateParams: AuctionSniperApiTypes.CreateSnipeParameters) {
    // Hide keyboard
    await Keyboard.hide();

    const result = await firstValueFrom(this.auctionSniperApi.updateSnipe(updateParams));
    if (result.success) {
      if (result.message?.Level === 0) {
        this.ui.showSuccessSnackbar('Snipe updated!');
      }

      // Update activeSnipes cache
      const snipe = this.dataSource.activeSnipes?.find(s => s.Item === result.snipe.Item);
      if (snipe) {
        snipe.CurrentPrice = result.snipe.CurrentPrice;
        snipe.MaxBid = result.snipe.MaxBid;
        snipe.NumBids = result.snipe.NumBids;
      }

      // Navigate back to snipe list after updating
      this.location.back();
    }
  }

  private isValidSnipe(): boolean {
    if (!this.viewModel.itemNumber) {
      this.ui.showInfoSnackbar('An eBay item number is required.');
      return false;
    }

    const leadTime = parseInt(this.viewModel.leadTime, 10);
    const maximumBid = parseFloat(this.viewModel.maximumBid);

    if (isNaN(maximumBid) || maximumBid <= 0) {
      this.ui.showInfoSnackbar('A valid maximum bid amount is required.');
      return false;
    }

    if (isNaN(leadTime) || leadTime < 2 || leadTime > 120) {
      this.ui.showInfoSnackbar('Bid lead time must be between 2 and 120 seconds.');
      return false;
    }

    const reg = /^[0-9]{0,9}\.?(?:[0-9]{1,2})?$/;
    if (!reg.test(this.viewModel.maximumBid.toString())) {
      this.ui.showInfoSnackbar('Maximum bid must be a valid currency amount.');
      return false;
    }

    return true;
  }
}