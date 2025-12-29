import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBackButton,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import _ from 'lodash';

import { Logger } from 'src/app/services/Logger';
import { TrackerService } from 'src/app/services/Tracker';
import { UIService } from 'src/app/services/UI';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { DataSourceService } from 'src/app/services/DataSource';
import { CountDownUtilitiesService } from 'src/app/services/CountDownUtilities';
import { PlatformService } from 'src/app/services/Platform';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { DetailViewModel } from './DetailViewModel';
import { EditSnipeModel } from 'src/app/Views/Dialogs/Edit-Snipe/EditSnipeModel';
import { DialogOptions } from 'src/app/Framework/DialogOptions';
import { addIcons } from 'ionicons';
import {
  closeCircleOutline,
  timeOutline,
  refreshOutline,
  cloudOfflineOutline,
  openOutline,
} from 'ionicons/icons';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-detail',
  templateUrl: './Detail.html',
  styleUrls: ['./Detail.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBackButton,
  ],
})
export class DetailController implements OnInit {
  viewModel = new DetailViewModel();

  isError = false;
  apiError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logger: Logger,
    private tracker: TrackerService,
    private ui: UIService,
    private auctionSniperApi: AuctionSniperApiService,
    private dataSource: DataSourceService,
    private countDownUtilities: CountDownUtilitiesService,
    private platform: PlatformService,
    private app: AppComponent
  ) {
    addIcons({
      'close-circle-outline': closeCircleOutline,
      'time-outline': timeOutline,
      'refresh-outline': refreshOutline,
      'cloud-offline-outline': cloudOfflineOutline,
      'open-outline': openOutline,
    });
  }

  async ngOnInit() {
    await this.app.makeUIProper();
    this.refresh();
  }

  ionViewWillEnter(): void {
    this.refreshWatchStatus();
    this.refreshSnipeStatus();
  }

  ionViewWillLeave(): void {
    this.countDownUtilities.clearCountDown();
  }

  // ===============================
  // CENTRAL ERROR HANDLER
  // ===============================
  private setError(message: string, context?: string, err?: any): void {
    this.isError = true;
    this.apiError = message;
    this.viewModel.showError = true;
    this.viewModel.showSpinner = false;

    if (context) {
      this.logger.error('DetailController', context, err || message);
    }
  }

  // ===============================
  // WATCH STATUS
  // ===============================
  private async refreshWatchStatus(): Promise<void> {
    const itemNumber = this.route.snapshot.paramMap.get('id');
    if (!itemNumber) return;

    try {
      const watches = await this.dataSource.retrieveWatches();
      this.viewModel.itemIsWatched = !!watches?.find(
        (w) => w.itemnumber === itemNumber
      );
    } catch (err) {
      this.setError(
        'Failed to refresh watch status.',
        'refreshWatchStatus',
        err
      );
    }
  }

  private async refreshSnipeStatus(): Promise<void> {
    const itemNumber = this.route.snapshot.paramMap.get('id');
    if (!itemNumber) return;

    try {
      const snipes = await this.dataSource.retrieveSnipes(
        AuctionSniperApiTypes.SnipeStatus.Active
      );
      this.viewModel.itemHasActiveSnipe = !!snipes?.find(
        (s) => s.Item === itemNumber
      );
    } catch (err) {
      this.setError(
        'Failed to refresh snipe status.',
        'refreshSnipeStatus',
        err
      );
    }
  }

  retry_click(): void {
    this.refresh();
  }

  viewOnEbay_click(): void {
    const url = `http://cgi.ebay.com/ws/eBayISAPI.dll?ViewItem&item=${this.viewModel.item.Id}`;
    this.tracker.track(TrackerConstants.Item.ViewOnEbay);

    this.platform.iPad
      ? Browser.open({ url, presentationStyle: 'fullscreen' })
      : Browser.open({ url });
  }

  // ===============================
  // WATCH ACTIONS
  // ===============================
  async addToWatches_click(itemNumber: string): Promise<void> {
    this.router.navigate(['/watch/add'], {
      queryParams: { itemNumber },
    });
  }

  async removeFromWatches_click(itemNumber: string): Promise<void> {
    const ok = await this.ui.confirm(
      'Are you sure you want to remove this watch?'
    );
    if (!ok) return;

    const watch = this.dataSource.watches?.find(
      (w) => w.itemnumber === itemNumber
    );
    if (!watch) {
      this.setError('Could not delete this watch.', 'removeFromWatches_click');
      return;
    }

    try {
      const res = await firstValueFrom(
        this.auctionSniperApi.deleteWatch(watch.WID)
      );
      if (res?.success && Array.isArray(this.dataSource.watches)) {
        _.remove(this.dataSource.watches, (w) => w.itemnumber === itemNumber);
        this.viewModel.itemIsWatched = false;
      }
    } catch (err) {
      this.setError('Failed to delete watch.', 'removeFromWatches_click', err);
    }
  }

  editWatch_click(itemNumber: string): void {
    const watch = this.dataSource.watches?.find(
      (w) => w.itemnumber === itemNumber
    );
    if (!watch) {
      this.setError('Could not find watch to edit.', 'editWatch_click');
      return;
    }
    this.router.navigate(['/watch/edit', watch.WID]);
  }

  // ===============================
  // SNIPE ACTIONS
  // ===============================
  async addToSnipes_click(): Promise<void> {
    const item = this.viewModel.item;
    this.router.navigate(['/snipe/add'], {
      queryParams: {
        itemNumber: item.Id,
        title: item.Title,
        currentPrice: item.CurrentPrice,
      },
    });
  }

  async removeFromSnipes_click(itemNumber: string): Promise<void> {
    const ok = await this.ui.confirm(
      'Are you sure you want to remove this snipe?'
    );
    if (!ok) return;

    const snipe = this.dataSource.activeSnipes?.find(
      (s) => s.Item === itemNumber
    );
    if (!snipe) {
      this.setError('Could not delete this snipe.', 'removeFromSnipes_click');
      return;
    }

    try {
      const res = await firstValueFrom(
        this.auctionSniperApi.deleteSnipe(snipe.Id)
      );
      if (res?.success && Array.isArray(this.dataSource.activeSnipes)) {
        _.remove(this.dataSource.activeSnipes, (s) => s.Item === itemNumber);
        this.viewModel.itemHasActiveSnipe = false;
      }
    } catch (err) {
      this.setError('Failed to delete snipe.', 'removeFromSnipes_click', err);
    }
  }

  updateSnipe_click(itemNumber: string): void {
    const snipe = this.dataSource.activeSnipes?.find(
      (s) => s.Item === itemNumber
    );
    if (!snipe) {
      this.setError('Could not find snipe to edit.', 'updateSnipe_click');
      return;
    }
    this.router.navigate([`/snipe/edit/${snipe.Id}`]);
  }

  // ===============================
  // MAIN REFRESH LOGIC
  // ===============================
  async refresh(): Promise<void> {
    this.viewModel.showSpinner = true;
    this.viewModel.showError = false;
    this.isError = false;

    const itemNumber = this.route.snapshot.paramMap.get('id');
    if (!itemNumber) {
      this.setError('Invalid item ID.', 'refresh');
      return;
    }

    try {
      const watches = await this.dataSource.retrieveWatches();
      this.viewModel.itemIsWatched = !!watches?.find(
        (w) => w.itemnumber === itemNumber
      );
    } catch (err) {
      this.setError('Failed to load watches.', 'retrieveWatches', err);
      return;
    }

    try {
      const snipes = await this.dataSource.retrieveSnipes(
        AuctionSniperApiTypes.SnipeStatus.Active
      );
      this.viewModel.itemHasActiveSnipe = !!snipes?.find(
        (s) => s.Item === itemNumber
      );
    } catch (err) {
      this.setError('Failed to load snipes.', 'retrieveSnipes', err);
      return;
    }

    try {
      const itemResult = await firstValueFrom(
        this.auctionSniperApi.getItemInfo(itemNumber, false)
      );

      if (!itemResult?.success) {
        this.setError(
          itemResult?.message?.MessageContent || 'Failed to load item details.',
          'getItemInfo'
        );
        return;
      }

      this.viewModel.item = itemResult.item;
    } catch (err: any) {
      this.setError(
        err?.message?.MessageContent || 'Failed to load item.',
        'getItemInfo',
        err
      );
      return;
    }

    try {
      this.countDownUtilities.initializeCountDown(
        null,
        { items: [this.viewModel.item] },
        'items',
        'EndTime',
        'CountDownTime',
        this.viewModel
      );
    } catch (err) {
      this.setError('Failed to initialize countdown.', 'countdown', err);
    }

    this.viewModel.showSpinner = false;
  }

  private showEditSnipeDialog(itemNumber: string): void {
    const snipe = this.dataSource.activeSnipes?.find(
      (s) => s.Item === itemNumber
    );
    if (!snipe) {
      this.setError('Could not find snipe to edit.', 'showEditSnipeDialog');
      return;
    }

    const model = new EditSnipeModel();
    model.id = snipe.Id;
    model.itemNumber = snipe.Item;

    const options = new DialogOptions<EditSnipeModel>(model);
    this.ui.showDialog('EditSnipeController', options);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
    event.target.onerror = null;
  }
}
