import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Dialog } from '@capacitor/dialog';
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
import { Logger } from 'src/app/services/Logger';
import { TrackerService } from 'src/app/services/Tracker';
import { UIService } from 'src/app/services/UI';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { DataSourceService } from 'src/app/services/DataSource';
import { CountDownUtilitiesService } from 'src/app/services/CountDownUtilities';
import { PlatformService } from 'src/app/services/Platform';
import { ApiErrorHandlerService } from 'src/app/services/ApiErrorHandler';
import { firstValueFrom } from 'rxjs';

import { PluginsService } from 'src/app/services/Plugins';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { DetailViewModel } from './DetailViewModel'; // adjust path
import { EditSnipeModel } from 'src/app/Views/Dialogs/Edit-Snipe/EditSnipeModel'; // adjust path
import _ from 'lodash';
import { AddWatchModel } from 'src/app/Views/Dialogs/Add-Watch/AddWatchModel';
import { DialogOptions } from 'src/app/Framework/DialogOptions';
import { addIcons } from 'ionicons';
import {
  closeCircleOutline,
  timeOutline,
  refreshOutline,
  cloudOfflineOutline,
  openOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-detail',
  templateUrl: './Detail.html',
  styleUrls: ['./Detail.scss'], // Fixed path
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Allow custom elements like app-icon-panel
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logger: Logger,
    private tracker: TrackerService,
    private ui: UIService,
    private auctionSniperApi: AuctionSniperApiService,
    private dataSource: DataSourceService,
    private countDownUtilities: CountDownUtilitiesService,
    private plugins: PluginsService,
    private platform: PlatformService,
    private errorHandler: ApiErrorHandlerService
  ) {
    addIcons({
      'close-circle-outline': closeCircleOutline,
      'time-outline': timeOutline,
      'refresh-outline': refreshOutline,
      'cloud-offline-outline': cloudOfflineOutline,
      'open-outline': openOutline,
    });
  }

  ngOnInit(): void {
    this.refresh();
  }

  // Event: page enter - refresh watch and snipe status
  ionViewWillEnter(): void {
    this.refreshWatchStatus();
    this.refreshSnipeStatus();
  }

  // Event: page leave
  ionViewWillLeave(): void {
    this.countDownUtilities.clearCountDown();
  }

  // Refresh watch status when returning to the page
  private async refreshWatchStatus(): Promise<void> {
    const itemNumber = this.route.snapshot.paramMap.get('id');
    if (!itemNumber) return;

    try {
      // Retrieve updated watches from data source
      const watches = await this.dataSource.retrieveWatches();
      const watch = watches?.find(
        (w: AuctionSniperApiTypes.Watch) => w.itemnumber === itemNumber
      );
      this.viewModel.itemIsWatched = !!watch;
    } catch (err) {
      this.logger.warn(
        'DetailController',
        'refreshWatchStatus',
        'Failed to refresh watch status.'
      );
    }
  }

  // Refresh snipe status when returning to the page
  private async refreshSnipeStatus(): Promise<void> {
    const itemNumber = this.route.snapshot.paramMap.get('id');
    if (!itemNumber) return;

    try {
      // Retrieve updated active snipes from data source
      const activeSnipes = await this.dataSource.retrieveSnipes(
        AuctionSniperApiTypes.SnipeStatus.Active
      );
      const snipe = activeSnipes?.find(
        (s: AuctionSniperApiTypes.Snipe) => s.Item === itemNumber
      );
      this.viewModel.itemHasActiveSnipe = !!snipe;
    } catch (err) {
      this.logger.warn(
        'DetailController',
        'refreshSnipeStatus',
        'Failed to refresh snipe status.'
      );
    }
  }

  // Retry click
  retry_click(): void {
    this.refresh();
  }

  // View Item on eBay
  viewOnEbay_click(): void {
    this.tracker.track(TrackerConstants.Item.ViewOnEbay);
    const url = `http://cgi.ebay.com/ws/eBayISAPI.dll?ViewItem&item=${this.viewModel.item.Id}`;
    const fullscreen = this.platform.iPad; // Correct!
    this.plugins.browser.open({
      url,
      presentationStyle: fullscreen ? 'fullscreen' : 'popover',
    });
  }

  // Add item to watches
  protected async addToWatches_click(itemNumber: string): Promise<void> {
    // Navigate to the watch edit page with the item number as a query parameter
    this.router.navigate(['/watch/add'], {
      queryParams: { itemNumber: itemNumber },
    });
  }

  // Remove item from watches
  async removeFromWatches_click(itemNumber: string): Promise<void> {
    const dialogOk = await this.ui.confirm(
      'Are you sure you want to remove this watch?'
    );
    if (!dialogOk) return;

    this.tracker.track(TrackerConstants.Watch.RemoveWatch);

    const watch = this.dataSource.watches?.find(
      (w) => w.itemnumber === itemNumber
    );

    if (!watch) {
      this.logger.warn(
        'DetailController',
        'removeFromWatches_click',
        'Unable to delete watch (not found).'
      );
      this.errorHandler.handleError(
        new Error('Delete Failed: Could not delete this watch.'),
        'Watch Delete',
        true,
        false,
        true
      );
      return;
    }

    try {
      const result = await firstValueFrom(
        this.auctionSniperApi.deleteWatch(watch.WID)
      );
      if (result?.success) {
        this.ui.showSuccessSnackbar('Watch removed');
        if (Array.isArray(this.dataSource.watches)) {
          _.remove(
            this.dataSource.watches,
            (watchItem) => watchItem.itemnumber === itemNumber
          );
        }
        this.viewModel.itemIsWatched = false;
      }
    } catch {
      this.errorHandler.handleError(
        new Error('Delete Failed.'),
        'Watch Delete',
        true,
        false,
        true
      );
    }
  }

  // Edit watch
  editWatch_click(itemNumber: string): void {
    // Find the watch ID and navigate to edit page
    const watch = this.dataSource.watches?.find(
      (w) => w.itemnumber === itemNumber
    );
    if (watch) {
      this.router.navigate(['/watch/edit', watch.WID]);
    } else {
      this.errorHandler.handleError(
        new Error('Could not find watch to edit.'),
        'Watch Edit',
        true,
        false,
        true
      );
    }
  }

  // Add to snipes
  async addToSnipes_click(): Promise<void> {
    const item = this.viewModel.item;
    // Navigate to the snipe add page with the item details as query parameters
    this.router.navigate(['/snipe/add'], {
      queryParams: {
        itemNumber: item.Id,
        title: item.Title,
        currentPrice: item.CurrentPrice,
      },
    });
  }

  // Remove from snipes
  async removeFromSnipes_click(itemNumber: string): Promise<void> {
    const dialogOk = await this.ui.confirm(
      'Are you sure you want to remove this snipe?'
    );
    if (!dialogOk) return;

    this.tracker.track(TrackerConstants.Snipe.Remove);

    const snipe = this.dataSource.activeSnipes?.find(
      (s) => s.Item === itemNumber
    );

    if (!snipe) {
      this.logger.warn(
        'DetailController',
        'removeFromSnipes_click',
        'Unable to delete snipe (not found).'
      );
      this.errorHandler.handleError(
        new Error('Delete Failed: Could not delete this snipe.'),
        'Snipe Delete',
        true,
        false,
        true
      );
      return;
    }

    try {
      const result = await firstValueFrom(
        this.auctionSniperApi.deleteSnipe(snipe.Id)
      );
      if (result?.success) {
        this.ui.showSuccessSnackbar('Snipe removed');
        if (Array.isArray(this.dataSource.activeSnipes)) {
          _.remove(this.dataSource.activeSnipes, (s) => s.Item === itemNumber);
        }
        this.viewModel.itemHasActiveSnipe = false;
      }
    } catch {
      this.errorHandler.handleError(
        new Error('Delete Failed.'),
        'Snipe Delete',
        true,
        false,
        true
      );
    }
  }

  // updateSnipe_click(itemNumber: string): void {
  //   this.showEditSnipeDialog(itemNumber);
  // }

  updateSnipe_click(itemNumber: string): void {
    const snipe = this.dataSource.activeSnipes?.find(
      (s) => s.Item === itemNumber
    );
    if (!snipe) {
      this.errorHandler.handleError(
        new Error('Update Failed: Could not find this snipe.'),
        'Snipe Update',
        true,
        false,
        true
      );
      this.logger.warn(
        'DetailController',
        'updateSnipe_click',
        'Unable to edit snipe (not found).'
      );
      return;
    }

    // Navigate to the edit route
    this.router.navigate([`/snipe/edit/${snipe.Id}`]);
  }

  isError = false;
  apiError = '';

  // Refresh all view model/auction details
  async refresh(): Promise<void> {
    this.viewModel.showError = false;
    this.viewModel.showSpinner = true;

    const itemNumber = this.route.snapshot.paramMap.get('id');
    if (!itemNumber) {
      this.viewModel.showError = true;
      this.apiError = 'lol';
      this.isError = true;
      this.viewModel.showSpinner = false;
      this.logger.error('DetailController', 'refresh', 'No ID provided.');
      this.errorHandler.handleError(
        new Error('Error: No ID provided...'),
        'Item Details',
        true,
        false,
        true
      );
      return;
    }

    let watches: AuctionSniperApiTypes.Watch[] = [];
    let activeSnipes: AuctionSniperApiTypes.Snipe[] = [];
    let itemInfoResult: any;

    try {
      watches = await this.dataSource.retrieveWatches();
      const watch = watches?.find(
        (w: AuctionSniperApiTypes.Watch) => w.itemnumber === itemNumber
      );
      this.viewModel.itemIsWatched = !!watch;
    } catch (err: any) {
      this.isError = true;
      this.apiError = this.isError ? err.message?.MessageContent : 'watch';
      this.logger.error('DetailController', 'retrieveWatches', err);
      this.viewModel.showError = true;
      this.viewModel.showSpinner = false;
      this.errorHandler.handleError(
        new Error('Failed to retrieve watches.'),
        'Item Details',
        true,
        false,
        true
      );
      return;
    }

    try {
      activeSnipes = await this.dataSource.retrieveSnipes(
        AuctionSniperApiTypes.SnipeStatus.Active
      );
      const snipe = activeSnipes?.find(
        (s: AuctionSniperApiTypes.Snipe) => s.Item === itemNumber
      );
      this.viewModel.itemHasActiveSnipe = !!snipe;
    } catch (err: any) {
      this.isError = true;
      this.apiError = this.isError ? err.message?.MessageContent : 'active';
      this.logger.error('DetailController', 'retrieveSnipes', err);
      this.viewModel.showError = true;
      this.viewModel.showSpinner = false;
      this.errorHandler.handleError(
        new Error('Failed to retrieve active snipes.'),
        'Item Details',
        true,
        false,
        true
      );
      return;
    }

    try {
      itemInfoResult = await firstValueFrom(
        this.auctionSniperApi.getItemInfo(itemNumber, false)
      );
      if (!itemInfoResult?.success) {
        this.viewModel.showError = true;
        this.apiError = 'lolu';
      this.isError = true;
        this.viewModel.showSpinner = false;
        this.logger.warn(
          'DetailController',
          'getItemInfo',
          'Item info retrieval failed'
        );
        return;
      }
      this.viewModel.item = itemInfoResult.item;
    } catch (err: any) {
      this.isError = true;
      this.apiError = this.isError ? err.message?.MessageContent : 'item';
      this.logger.error('DetailController', 'getItemInfo', err);
      this.viewModel.showError = true;
      this.viewModel.showSpinner = false;
      this.errorHandler.handleError(
        new Error('Failed to retrieve item info.'),
        'Item Details',
        true,
        false,
        true
      );
      return;
    }

    // 4️⃣ Initialize Countdown
    try {
      const detail = { items: [itemInfoResult.item] };
      this.countDownUtilities.initializeCountDown(
        null, // no scrollDelegate
        detail, // dataSource
        'items', // entityName
        'EndTime', // targetField
        'CountDownTime', // displayField
        this.viewModel
      );
    } catch (err: any) {
      this.isError = true;
      this.apiError = this.isError ? err.message?.MessageContent : 'countdonw';
      this.logger.error('DetailController', 'initializeCountDown', err);
    }

    // 5️⃣ Optionally Open Edit Snipe Modal
    try {
      const openEditSnipeModal =
        this.route.snapshot.queryParamMap.get('openEditSnipeModal');
      if (openEditSnipeModal && this.viewModel.itemHasActiveSnipe) {
        this.showEditSnipeDialog(this.viewModel.item.Id);
      } else if (openEditSnipeModal && !this.viewModel.itemHasActiveSnipe) {
        this.logger.warn(
          'DetailController',
          'refresh',
          'openEditSnipeModal true, but item has no active snipe.'
        );
      }
    } catch (err: any) {
      this.isError = true;
      this.apiError = this.isError ? err.message?.MessageContent : 'open edit';
      this.logger.error('DetailController', 'showEditSnipeDialog', err);
    }

    this.viewModel.showSpinner = false;
  }

  private showEditSnipeDialog(itemNumber: string): void {
    const snipe = this.dataSource.activeSnipes?.find(
      (s) => s.Item === itemNumber
    );
    if (!snipe) {
      this.errorHandler.handleError(
        new Error('Update Failed: Could not find this snipe.'),
        'Snipe Update',
        true,
        false,
        true
      );
      this.logger.warn(
        'DetailController',
        'showEditSnipeDialog',
        'Unable to edit snipe (not found).'
      );
      return;
    }

    const editSnipeModel = new EditSnipeModel();
    editSnipeModel.id = snipe.Id;
    editSnipeModel.itemNumber = snipe.Item;
    const options = new DialogOptions<EditSnipeModel>(editSnipeModel);
    this.ui.showDialog('EditSnipeController', options);
  }

  // Handle image loading errors
  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.jpg';
    event.target.onerror = null;
  }
}
