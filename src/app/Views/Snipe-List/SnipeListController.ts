import {
  Component,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToggle,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import _ from 'lodash';
import moment from 'moment';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SnipeCacheService } from 'src/app/services/SnipeCacheService';

// Services
import { Logger } from 'src/app/services/Logger';
import { UIService } from 'src/app/services/UI';
import { DataSourceService } from 'src/app/services/DataSource';
import { CountDownUtilitiesService } from 'src/app/services/CountDownUtilities';
import { TrackerService } from 'src/app/services/Tracker';
import { ApiMessageExtractorService } from 'src/app/services/ApiMessageExtractor';
// Components / Constants
import { WatchListFilterComponent } from 'src/app/Views/Watch-List/Watch-List-Filter/WatchListFilterController';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

// ✅ Import your migrated enums & view models directly
import { SortDirection } from 'src/app/models/sort-direction.enum';
import { CacheBehavior } from 'src/app/models/cache-behavior.model';
import { SnipeListViewModel } from './SnipeListViewModel';
import { SnipeListFilterViewModel } from './Snipe-List-Filter/SnipeListFilterViewModel';
import { DialogOptions } from 'src/app/Framework/DialogOptions';
import { EditSnipeModel } from 'src/app/Views/Dialogs/Edit-Snipe/EditSnipeModel';

@Component({
  selector: 'app-snipe-list',
  templateUrl: './Snipe-List.html',
  styleUrls: ['./snipe-list.page.scss'],
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
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonToggle,
    IonCard,
    IonCardContent,
  ],
})
export class SnipeListPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  public OnScroll: any;
  private _filterMenu: HTMLIonPopoverElement | null = null;

  viewModel: SnipeListViewModel = {
    status: AuctionSniperApiTypes.SnipeStatus.Active,
    sortByEndingSoonest: true,
    snipes: [],
    isRefreshing: false,
    showSpinner: true, // Start with spinner true
    showError: false,
  };

  constructor(
    private logger: Logger,
    private ui: UIService,
    private dataSource: DataSourceService,
    private countDownUtilities: CountDownUtilitiesService,
    private tracker: TrackerService,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private messageExtractor: ApiMessageExtractorService,
    private cacheService: SnipeCacheService
  ) {}

  apiError: string | null = '';
  isError = false;

  async ngOnInit() {
    // Initialize the component
    this.viewModel.status = AuctionSniperApiTypes.SnipeStatus.Active;
    this.viewModel.sortByEndingSoonest = true;
    this.viewModel.showSpinner = true;

    // Load initial data
    await this.view_loaded();
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

  applyFilter(sortDescending: boolean = false) {
    this.viewModel.sortByEndingSoonest = sortDescending;
    this.refresh();
  }

  trackByItemNumber(index: number, watch: any) {
    return watch.itemnumber;
  }

  // ✅ Ionic lifecycle mapping
  async ionViewWillEnter() {
    await this.view_beforeEnter();
  }

  ionViewWillLeave() {
    this.view_beforeLeave();
  }

  ionViewDidEnter() {
    // Refresh data when view enters
    if (this.viewModel.snipes.length === 0) {
      this.refresh();
    }
  }

  // ===== Same functions =====

  protected async view_loaded(): Promise<void> {
    this._filterMenu = await this.popoverCtrl.create({
      component: WatchListFilterComponent,
      translucent: true,
    });

    this._filterMenu.onDidDismiss().then(({ data }) => {
      if (data && data.filtersChanged) {
        this.filterMenu_filtersChanged(data.filters);
      }
    });
  }

  protected async view_beforeEnter(): Promise<void> {
    // Only refresh if we don't have data or it's the first load
    if (this.viewModel.snipes.length === 0) {
      this.viewModel.showSpinner = true;
      await this.refresh();
    }
  }

  protected view_beforeLeave(): void {
    this.countDownUtilities.clearCountDown();
  }

  protected filterBar_click(status: any) {
    const statusNum = Number(status);
    const { viewModel, tracker } = this;

    if (viewModel.isRefreshing || viewModel.showError) return;

    const statusLabelMap: Record<number, string> = {
      [AuctionSniperApiTypes.SnipeStatus.Active]:
        TrackerConstants.Snipe.FilterLabel.Active,
      [AuctionSniperApiTypes.SnipeStatus.Won]:
        TrackerConstants.Snipe.FilterLabel.Won,
      [AuctionSniperApiTypes.SnipeStatus.Lost]:
        TrackerConstants.Snipe.FilterLabel.Lost,
    };

    const trackingLabel = statusLabelMap[statusNum];
    if (trackingLabel)
      tracker.track(TrackerConstants.Snipe.Filter, trackingLabel);

    Object.assign(viewModel, { status: statusNum, showSpinner: true });

    // 🔹 Try cache first when switching filters
    const hasCache = !!this.cacheService.getCachedSnipes(statusNum);
    this.refresh(!hasCache); // only force API if cache missing
  }

  protected retry_click(): void {
    this.viewModel.showSpinner = true;
    this.refresh(true);
  }

  protected async refresher_refresh(event: any): Promise<void> {
    this.viewModel.showSpinner = true;
    await this.refresh(true);
    this.viewModel.showSpinner = false;
    if (event && event.target) {
      event.target.complete();
    }
  }

  protected async filter_click(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: WatchListFilterComponent,
      event: ev,
      translucent: true,
      componentProps: {
        sortByEndingSoonest: this.viewModel.sortByEndingSoonest,
      },
    });

    popover.onDidDismiss().then(({ data }) => {
      if (data && data.filtersChanged) {
        this.filterMenu_filtersChanged(data.filters);
      }
    });

    await popover.present();
  }

  // Add to snipes
  async addToSnipes_click(): Promise<void> {
    this.router.navigate(['/snipe/add']);
  }

  private filterMenu_filtersChanged(filters: SnipeListFilterViewModel): void {
    this.viewModel.sortByEndingSoonest = filters.sortByEndingSoonest;
    const sortDirection = this.viewModel.sortByEndingSoonest
      ? SortDirection.Ascending
      : SortDirection.Descending;

    this.viewModel.snipes = this.sortSnipesListByEndTime(
      this.viewModel.snipes,
      sortDirection
    );
    if (this.content) {
      this.content.scrollToTop(300);
    }
  }

  private async refresh(forceRefresh: boolean = false): Promise<void> {
    const status =
      this.viewModel.status ?? AuctionSniperApiTypes.SnipeStatus.Active;
    this.viewModel.isRefreshing = true;
    this.viewModel.showError = false;
    this.countDownUtilities.clearCountDown();

    try {
      let snipes: AuctionSniperApiTypes.Snipe[] | null = null;

      // 🔹 Try using cache if not forced
      if (!forceRefresh) {
        snipes = this.cacheService.getCachedSnipes(status);
      }

      // 🔹 If no valid cache, call API
      if (!snipes) {
        const cacheBehavior = forceRefresh
          ? CacheBehavior.InvalidateCache
          : CacheBehavior.Default;

        snipes = await this.dataSource.retrieveSnipes(status, cacheBehavior);

        // Store fresh data in cache
        this.cacheService.setCachedSnipes(status, snipes);
      }

      // Update viewModel
      this.viewModel.snipes = snipes || [];
      this.viewModel.showSpinner = false;
      this.viewModel.isRefreshing = false;

      if (!snipes || snipes.length === 0) {
        this.initializeCountDown(status);
        return;
      }

      const sortDirection =
        status === AuctionSniperApiTypes.SnipeStatus.Active
          ? this.viewModel.sortByEndingSoonest
            ? SortDirection.Ascending
            : SortDirection.Descending
          : SortDirection.Descending;

      this.viewModel.snipes = this.sortSnipesListByEndTime(
        snipes,
        sortDirection
      );
      this.initializeCountDown(status);
    } catch (err: any) {
      this.isError = err.message?.Level === 'Error';
      this.apiError = this.isError ? err.message?.MessageContent : '';
      this.viewModel.showError = true;
      this.viewModel.showSpinner = false;
      this.viewModel.isRefreshing = false;
      this.viewModel.snipes = [];

      this.logger.error(
        'SnipeListPage',
        'refresh',
        'Error refreshing snipes',
        err
      );
    }
  }

  private initializeCountDown(status: AuctionSniperApiTypes.SnipeStatus): void {
    try {
      let dataSourceName: string;

      switch (status) {
        case AuctionSniperApiTypes.SnipeStatus.Active:
          dataSourceName = 'activeSnipes';
          break;
        case AuctionSniperApiTypes.SnipeStatus.Won:
          dataSourceName = 'wonSnipes';
          break;
        case AuctionSniperApiTypes.SnipeStatus.Lost:
          dataSourceName = 'lostSnipes';
          break;
        default:
          this.logger.warn(
            'SnipeListPage',
            'initializeCountDown',
            'Unable to initialize count down; unknown snipe status.',
            status
          );
          return;
      }
      this.OnScroll = this.countDownUtilities.initializeCountDown(
        null, // no scrollDelegate
        this.dataSource,
        dataSourceName,
        'EndTime',
        'CountDownTime',
        this.viewModel
      );
    } catch (e) {
      // Don't let count down errors affect the UI
    }
  }

  private sortSnipesListByEndTime(
    snipes: AuctionSniperApiTypes.Snipe[],
    direction: SortDirection
  ): AuctionSniperApiTypes.Snipe[] {
    if (!snipes || snipes.length === 0) {
      return snipes;
    }

    try {
      const sorted = _.sortBy(snipes, (snipe) => {
        try {
          return moment(snipe.EndTime).toDate();
        } catch (e) {
          return new Date(0); // Default to epoch if parsing fails
        }
      });
      const result =
        direction === SortDirection.Descending ? sorted.reverse() : sorted;
      return result;
    } catch (e) {
      return snipes; // Return unsorted if sorting fails
    }
  }

  // Helper methods for UI
  getSnipeStatusText(status: number): string {
    switch (status) {
      case AuctionSniperApiTypes.SnipeStatus.Active:
        return 'Active';
      case AuctionSniperApiTypes.SnipeStatus.Won:
        return 'Won';
      case AuctionSniperApiTypes.SnipeStatus.Lost:
        return 'Lost';
      default:
        return 'Unknown';
    }
  }

  getSnipeStatusClass(status: number): string {
    switch (status) {
      case AuctionSniperApiTypes.SnipeStatus.Active:
        return 'active';
      case AuctionSniperApiTypes.SnipeStatus.Won:
        return 'won';
      case AuctionSniperApiTypes.SnipeStatus.Lost:
        return 'lost';
      default:
        return '';
    }
  }

  getSnipeStatusIcon(status: number): string {
    switch (status) {
      case AuctionSniperApiTypes.SnipeStatus.Active:
        return 'pulse-outline';
      case AuctionSniperApiTypes.SnipeStatus.Won:
        return 'trophy-outline';
      case AuctionSniperApiTypes.SnipeStatus.Lost:
        return 'close-circle-outline';
      default:
        return 'help-outline';
    }
  }
}
