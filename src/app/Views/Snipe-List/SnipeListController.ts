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
    private messageExtractor: ApiMessageExtractorService
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
    const statusNum = parseInt(status, 10);
    if (this.viewModel.isRefreshing || this.viewModel.showError) {
      return;
    }
    let trackingLabel: string | null = null;
    switch (statusNum) {
      case AuctionSniperApiTypes.SnipeStatus.Active:
        trackingLabel = TrackerConstants.Snipe.FilterLabel.Active;
        break;
      case AuctionSniperApiTypes.SnipeStatus.Won:
        trackingLabel = TrackerConstants.Snipe.FilterLabel.Won;
        break;
      case AuctionSniperApiTypes.SnipeStatus.Lost:
        trackingLabel = TrackerConstants.Snipe.FilterLabel.Lost;
        break;
    }
    if (trackingLabel) {
      this.tracker.track(TrackerConstants.Snipe.Filter, trackingLabel);
    }
    this.viewModel.status = statusNum;
    this.viewModel.showSpinner = true;
    this.refresh(true);
  }

  protected retry_click(): void {
    this.viewModel.showSpinner = true;
    this.refresh(true);
  }

  protected refresher_refresh(event: any): void {
    this.refresh(true);
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
    this.viewModel.isRefreshing = true;
    this.viewModel.showError = false;
    this.countDownUtilities.clearCountDown();

    const cacheBehavior = forceRefresh
      ? CacheBehavior.InvalidateCache
      : CacheBehavior.Default;

    try {
      const snipes = await this.dataSource.retrieveSnipes(
        this.viewModel.status ?? AuctionSniperApiTypes.SnipeStatus.Active,
        cacheBehavior
      );

      this.viewModel.showSpinner = false;
      this.viewModel.isRefreshing = false;

      if (!snipes || snipes.length === 0) {
        this.viewModel.snipes = [];
        // Initialize countdown even when there are no snipes
        this.initializeCountDown(
          this.viewModel.status ?? AuctionSniperApiTypes.SnipeStatus.Active
        );
        return;
      }

      const sortDirection =
        this.viewModel.status === AuctionSniperApiTypes.SnipeStatus.Active
          ? this.viewModel.sortByEndingSoonest
            ? SortDirection.Ascending
            : SortDirection.Descending
          : SortDirection.Descending;

      this.viewModel.snipes = this.sortSnipesListByEndTime(
        snipes,
        sortDirection
      );
      this.initializeCountDown(
        this.viewModel.status ?? AuctionSniperApiTypes.SnipeStatus.Active
      );
    } catch (err: any) {
      this.isError = err.message.Level == 'Error' ? true : false;
      // this.apiError = this.messageExtractor.extractMessageFromObject(err);
      this.apiError = this.isError ? err.message.MessageContent : '';
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
