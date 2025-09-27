// watch-list.page.ts
import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonToggle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { UIService } from 'src/app/services/UI';
import { DataSourceService } from 'src/app/services/DataSource';
import { CountDownUtilitiesService } from 'src/app/services/CountDownUtilities';
import { WatchListFilterComponent } from './Watch-List-Filter/WatchListFilterController';
import moment from 'moment';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-watch-list',
  templateUrl: './Watch-List.html',
  styleUrls: ['./Watch-List.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonToggle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardContent,
  ],
})
export class WatchListPage implements OnInit, OnDestroy {
  watches: any[] = [];
  snipeItemIds: Record<string, boolean> = {};
  sortByEndingSoonest = true;
  showError = false;
  isRefreshing = false;
  showSpinner = false;
  currentSortDescending = false;

  // Add missing viewModel property
  viewModel = {
    showError: false,
    showSpinner: false,
    watches: [] as any[],
    hideWatchesFirstTimeInfo: false,
    snipeItemIds: {} as { [key: string]: any },
  };

  private countdownHandler: any;

  constructor(
    private popoverController: PopoverController,
    private dataSource: DataSourceService,
    private countdownService: CountDownUtilitiesService,
    private uiService: UIService,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit() {
    this.sortByEndingSoonest = true;
    this.showSpinner = true;
    // Use cached data when available, don't force refresh from eBay
    await this.refresh(true);
  }

  async openFilterSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Choose Filter',
      buttons: [
        {
          text: 'Ending Soonest',
          handler: () => this.applyFilter(),
        },
        {
          text: 'Ending Later',
          handler: () => this.applyFilter(true),
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  trackByItemNumber(index: number, watch: any) {
    return watch.itemnumber;
  }

  async ionViewWillEnter() {
    // Sync viewModel with component properties
    this.viewModel.showSpinner = this.showSpinner;
    this.viewModel.showError = this.showError;
    this.viewModel.watches = this.watches;
    this.viewModel.snipeItemIds = this.snipeItemIds;

    // Always refresh data from server (forceRefresh = true)
    await this.refresh(true);

    // Initialize countdown
    this.countdownHandler = this.countdownService.initializeCountDown(
      null,
      this.dataSource,
      'watches',
      'endtime',
      'countdowntime',
      this.viewModel
    );
  }

  ionViewWillLeave() {
    this.countdownService.clearCountDown();
  }

  async openFilterPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: WatchListFilterComponent,
      event: ev,
      translucent: true,
      componentProps: {
        sortByEndingSoonest: this.sortByEndingSoonest,
      },
    });

    popover.onDidDismiss().then(({ data }) => {
      if (data) {
        this.sortByEndingSoonest = data.sortByEndingSoonest;
        this.watches = this.sortWatchListByEndTime(this.watches);
        this.viewModel.watches = this.watches;
      }
    });

    await popover.present();
  }

  async applyFilter(sortDescending: boolean = false) {
    this.currentSortDescending = sortDescending;
    await this.refresh();
  }

  async refresh(forceRefresh: boolean = false) {
    this.isRefreshing = true;
    this.showError = false;
    this.viewModel.showError = false;

    try {
      // Only force refresh from eBay when explicitly requested
      if (forceRefresh) {
        await this.dataSource.retrieveWatchesFromEbay();
      } else {
        // Use cached data when available, only fetch from eBay if no cache
        await this.dataSource.retrieveWatches();
      }

      const snipes = await this.dataSource.retrieveSnipes(
        AuctionSniperApiTypes.SnipeStatus.Active
      );
      this.snipeItemIds = {};
      for (const snipe of snipes || []) {
        this.snipeItemIds[snipe.Item] = true;
      }

      // Update viewModel with snipeItemIds
      this.viewModel.snipeItemIds = this.snipeItemIds;

      const sortDirection = this.currentSortDescending ? 'desc' : 'asc';

      // Get watches from dataSource and sort them
      this.watches = this.sortWatchListByEndTime(
        this.dataSource.watches ?? [],
        sortDirection
      );

      // Update viewModel with watches
      this.viewModel.watches = this.watches;

      // Initialize countdown after data is loaded
      this.initializeCountDown();
    } catch (err) {
      this.showError = true;
      this.viewModel.showError = true;
    }

    this.isRefreshing = false;
    this.showSpinner = false;
    this.viewModel.showSpinner = false;
  }

  async retry() {
    this.showSpinner = true;
    this.viewModel.showSpinner = true;
    await this.refresh(true);
  }

  private sortWatchListByEndTime(
    watches: any[],
    sortDirection: 'asc' | 'desc' = 'asc'
  ): any[] {
    const sorted = [...watches].sort((a, b) => {
      const aDate = moment(a.endtime).toDate().getTime();
      const bDate = moment(b.endtime).toDate().getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    });

    return sorted.slice(0, DataSourceService.MAX_LIST_ITEM_COUNT);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions, intervals, or listeners here if any
    console.log('WatchListPage destroyed');
  }

  // Add missing methods
  filter_click(event?: any) {
    console.log('Filter clicked');
    // Add filter logic here
  }

  retry_click() {
    console.log('Retry clicked');
    this.retry();
  }

  OnScroll(event: any) {
    console.log('Scroll event:', event);
    // Add scroll logic here
  }

  async refresher_refresh(event: any) {
    console.log('Refresher refresh:', event);

    try {
      await this.refresh(true);
    } catch (err) {
      console.error('Error in refresh:', err);
    } finally {
      if (event?.target) {
        (event.target as any).complete();
      }
    }
  }

  private initializeCountDown(): void {
    try {
      // Clear any existing countdown
      this.countdownService.clearCountDown();

      // Initialize countdown with proper dataSource
      this.countdownHandler = this.countdownService.initializeCountDown(
        null, // no scrollDelegate
        this.dataSource, // dataSource object
        'watches', // entityName
        'endtime', // targetField
        'countdowntime', // displayField
        this.viewModel // viewModel
      );
    } catch (e) {
      // Don't let count down errors affect the UI
      console.error('Error initializing countdown:', e);
    }
  }
}
