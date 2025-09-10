import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';
import {
  IonContent,
  IonInfiniteScroll,
  IonRefresher,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonRefresherContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonInfiniteScrollContent,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';
import { DataSourceService } from 'src/app/services/DataSource';
import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';
import { PreferencesService } from 'src/app/services/Preferences';
import { CountDownUtilitiesService } from 'src/app/services/CountDownUtilities';
import { TrackerService } from 'src/app/services/Tracker';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { SortPopover } from 'src/app/components/sort-popover.component';
import { SearchAdvancedMenu } from './Search-Advanced-Menu.component';

@Component({
  selector: 'app-search-query',
  templateUrl: './Search-Query.html',
  styleUrls: ['./search-query.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DecimalPipe,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
    IonButtons,
    IonBackButton,
    SearchAdvancedMenu,
    SortPopover
  ]
})
export class SearchQueryController implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  // Mirrors your old ViewModel structure
  viewModel: any = {
    pageNumber: 1,
    searchId: 0,
    sort: 'MetaEndSort',
    searchResults: null as AuctionSniperApiTypes.SearchResult[] | null,
    isRefreshing: false,
    isSingleItem: false,
    searchTerms: '',
    country: 1,
    isLocatedIn: false,
    searchTitle: '',
    searches: [] as AuctionSniperApiTypes.SparseSavedSearch[],
    deals: [] as AuctionSniperApiTypes.Deal[]
  };

  // Loading state for API calls
  isLoading = false;

  // Public fields from controller
  public OnScroll: any; // kept for parity; not used with modern APIs
  public SortPopover = false;
  public AdvancedPopoverOpen = false;
  public ShowAdvanced = false;
  public PerformSearch = false;

  // Add Localization property for template
  public Localization: any = {
    Search: {
      Title: 'Search',
      ClearSearchTag: 'Clear Search',
      EditSearchTag: 'Edit Search',
      SaveSearchTag: 'Save Search',
      AdvancedTag: 'Advanced',
      SortTag: 'Sort',
      Sort: {
        MetaEndSort: "Ending Soonest",
        MetaNewSort: "Newly Listed",
        MetaHighestPriceSort: "Price: highest first",
        PriceAndShippingLowestFirst: "Price + Shipping: lowest first",
        PriceAndShippingHighestFirst: "Price + Shipping: highest first",
      },
      DailyDealsTag: 'Daily Deals',
      SavedSearchesTag: 'Saved Searches',
      EditSavedSearchesTag: 'Edit Saved Searches',
      LoadMoreResultsTag: 'Load More Results',
      Advanced: {
        LocationTag: 'Location',
        Done: 'Done',
        Available: 'Available worldwide',
        Located: 'Located in selected country',
        CountryTag: 'Country',
        USA: 'United States',
        UK: 'United Kingdom',
        CAN: 'Canada',
        AUS: 'Australia',
        BRA: 'Brazil',
        FRA: 'France',
        GER: 'Germany',
        ITA: 'Italy',
        NET: 'Netherlands',
        POR: 'Portugal',
        SPA: 'Spain',
        SWE: 'Sweden'
      }
    },
    AuctionDetail: {
      CurrentPriceTag: 'Current Price',
      BidsTag: 'Bids',
      ListedTag: 'Listed',
      TimeLeftTag: 'Time Left'
    },
    Views: {
      PullToRefreshTag: 'Pull to refresh',
      RefreshingTag: 'Refreshing...'
    }
  };

  constructor(
    private dataSource: DataSourceService,
    private ui: UIService,
    private plugins: PluginsService,
    private preferences: PreferencesService,
    private countdown: CountDownUtilitiesService,
    private tracker: TrackerService,
    private popoverCtrl: PopoverController,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Subscribe to router events to detect when we navigate back to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if we're navigating to the search query page
      if (event.url.startsWith('/search/query') || event.url === '/root/search') {
        // Re-initialize countdown when returning to the search page
        this.reinitializeCountdown();
      }
    });
  }

  // ===== BaseController Events (migrated) =====
  ngOnInit(): void {
    this.view_loaded();
  }

  ionViewWillEnter(): void {
    this.view_beforeEnter();
  }

  ionViewDidEnter(): void {
    this.view_afterEnter();
  }

  ionViewWillLeave(): void {
    this.view_beforeLeave();
  }

  protected view_loaded(): void {
    this.viewModel.pageNumber = 1;
    this.viewModel.searchId = 0;
    this.viewModel.sort = 'MetaEndSort';

    // Popovers are managed by isOpen flags in template now
    this.loadSearchConfig();
  }

  protected view_beforeEnter(): void {
    // Check for query parameters when navigating to this page
    this.route.queryParams.subscribe(params => {
      if (params['searchId']) {
        this.viewModel.searchId = parseInt(params['searchId'], 10);
      }
      if (params['searchTerms']) {
        this.viewModel.searchTerms = params['searchTerms'];
      }
      if (params['searchTitle']) {
        this.viewModel.searchTitle = params['searchTitle'];
        this.dataSource.searchTitle = params['searchTitle'];
      }
    });

    this.viewModel.searchId = this.viewModel.searchId || this.dataSource.searchId || 0;

    if (!this.dataSource.searchResults || this.dataSource.searchResults.length === 0) {
      this.viewModel.pageNumber = 1;
    }

    this.viewModel.searchTitle = this.viewModel.searchTitle || this.dataSource.searchTitle;
    
    // Only refresh data if we don't already have search results
    if (!this.viewModel.searchResults) {
      this.refresh(false);
    } else {
      // Re-initialize countdown for existing search results
      this.OnScroll = this.countdown.initializeCountDown(
        // kept signature parity; modern code wouldn't need these
        undefined as any,
        this.dataSource,
        'searchResults',
        'EndTime',
        'CountDownTime',
        this.viewModel
      );
    }
  }

  protected view_afterEnter(): void {
    // no-op (kept for parity)
  }

  protected view_beforeLeave(): void {
    this.countdown.clearCountDown();
  }

  // ===== Helper Properties =====
  protected get showLoadMoreResultsButton(): boolean {
    return !!(
      this.viewModel.searchResults &&
      this.viewModel.searchResults.length >= 100 &&
      this.viewModel.searchResults.length < (this.dataSource?.searchTotal ?? 0)
    );
  }
  // ===== Public Methods =====
  public clearSearch(): void {
    this.viewModel.searchTerms = '';
    this.viewModel.searchResults = null;
    this.viewModel.pageNumber = 1;
    this.viewModel.searchId = 0;
    this.viewModel.searchTitle = '';
    this.dataSource.clearDetail();
    this.dataSource.clearSearchResults();
  }

  // ===== Private Methods =====
  private loadSearchConfig(): void {
    this.viewModel.country = this.preferences.searchCountry;
    this.viewModel.isLocatedIn = this.preferences.searchLocatedInCountry;

    if (!this.viewModel.country) {
      this.viewModel.country = 1;
      this.viewModel.isLocatedIn = false;
      this.preferences.searchCountry = this.viewModel.country;
      this.preferences.searchLocatedInCountry = this.viewModel.isLocatedIn;
      this.ShowAdvanced = true;
    }
  }

  private showAdvanced(): void {
    // In Ionic 7 we toggle the popover open flag; template anchors it to the button
    this.ShowAdvanced = false;
    setTimeout(() => {
      this.AdvancedPopoverOpen = true;
    });
  }

  private refresh(refreshFromServer: boolean): void {
    this.isLoading = true;

    Promise.all([
      (refreshFromServer || !this.dataSource.savedSearches)
        ? this.dataSource.retrieveSavedSearches().then(r => (this.showSingleItem(false), r)).catch(() => [])
        : Promise.resolve(this.dataSource.savedSearches ?? []),

      this.loadSearchData(refreshFromServer),

      (!this.dataSource.searchResults && !this.dataSource.detail)
        ? this.dataSource.retrieveDeals().then(r => (this.showSingleItem(false), r)).catch(() => [])
        : Promise.resolve(this.dataSource.deals ?? [])
    ])
      .then(([savedSearchItems, searchResults, dealsResults]) => {
        this.viewModel.searches = savedSearchItems;
        this.viewModel.searchResults = searchResults;
        this.viewModel.deals = dealsResults as any;

        // Re-initialize countdown after data is loaded
        if (searchResults && searchResults.length > 0) {
          const searchResultsData = {
            searchResults: searchResults
          };

          this.countdown.initializeCountDown(
            undefined as any,
            searchResultsData,
            'searchResults',
            'EndTime',
            'CountDownTime',
            this.viewModel
          );
        }
      })
      .catch(() => {
        this.ui.showErrorSnackbar('An error occurred while retrieving results; please try again later.');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private async loadSearchData(forceReload: boolean): Promise<AuctionSniperApiTypes.SearchResult[] | null> {
    console.log('ENTERING loadSearchData method, forceReload:', forceReload);
    console.log('Load search data called with parameters:', JSON.stringify({
      searchTerms: this.viewModel.searchTerms,
      sort: this.viewModel.sort,
      pageNumber: this.viewModel.pageNumber,
      searchId: this.viewModel.searchId,
      country: this.viewModel.country,
      isLocatedIn: this.viewModel.isLocatedIn
    }, null, 2));

    this.plugins.keyboard.hide();

    console.log('Checking if search terms are empty...');

    // Check if search terms are empty
    if (!this.viewModel.searchTerms || this.viewModel.searchTerms.trim().length === 0) {
      console.log('Search terms are empty, returning null');
      if (this.viewModel.searchId === 0) {
        // No search terms and no saved search ID, return null
        return null;
      }
      // Continue with saved search even if search terms are empty
    }

    console.log('Search terms are not empty, continuing...');

    const regEx = /^\d{10,20}$/; // only digits, length 10–20

    console.log('Checking if this is an item number search...');

    // Item-number search
    if (this.viewModel.searchTerms && regEx.test(this.viewModel.searchTerms)) {
      console.log('This is an item number search');
      this.tracker.track(TrackerConstants.Search.IdSearch, this.viewModel.searchTerms);

      if (this.dataSource.detail && !forceReload) {
        console.log('Using cached detail data');
        const results: AuctionSniperApiTypes.SearchResult[] = [this.dataSource.detail];
        this.showSingleItem(true);
        return results;
      }

      try {
        console.log('Retrieving detail data from API');
        const result = await this.dataSource.retrieveDetail(this.viewModel.searchTerms);
        const results: AuctionSniperApiTypes.SearchResult[] = [result];
        this.showSingleItem(true);
        return results;
      } catch (e) {
        console.log('Error retrieving detail data, showing no results');
        this.dataSource.searchTotal = 0;
        this.ui.showInfoSnackbar('No results found.');
        return [];
      }
    }

    console.log('This is not an item number search, continuing with keyword search...');

    // Keyword search
    if (this.viewModel.searchTerms) {
      console.log('Tracking keyword search');
      this.tracker.track(TrackerConstants.Search.KeywordSearch, this.viewModel.searchTerms);
    }

    console.log('Checking if we have cached search results...');
    if (this.dataSource.searchResults && !forceReload) {
      console.log('Checking if sort parameter has changed...');
      // Check if sort parameter has changed
      if (this.dataSource.searchSort === this.viewModel.sort) {
        console.log('Sort parameter unchanged, checking filter parameters...');
        // Check if filter parameters have changed
        const cachedCountry = this.dataSource.searchCountry;
        const cachedLocatedIn = this.dataSource.searchLocatedIn;
        console.log('Cached filters - Country:', cachedCountry, 'LocatedIn:', cachedLocatedIn);
        console.log('Current filters - Country:', this.viewModel.country, 'LocatedIn:', this.viewModel.isLocatedIn);
        if (cachedCountry === this.viewModel.country && cachedLocatedIn === this.viewModel.isLocatedIn) {
          console.log('Filter parameters unchanged, using cached results');
          this.showSingleItem(false);
          return this.dataSource.searchResults;
        } else {
          console.log('Filter parameters changed, need to reload');
        }
      } else {
        console.log('Sort parameter changed, need to reload');
      }
      // If sort or filters changed, we need to reload
    }

    console.log('Proceeding with search if we have search terms or a saved search ID...');
    // Proceed with search if we have search terms or a saved search ID
    if (this.viewModel.searchTerms || this.viewModel.searchId !== 0) {
      try {
        console.log('Calling dataSource.retrieveSearchResults with parameters:', JSON.stringify({
          searchTerms: this.viewModel.searchTerms || '',
          sort: this.viewModel.sort,
          pageNumber: this.viewModel.pageNumber,
          searchId: this.viewModel.searchId,
          country: this.viewModel.country,
          isLocatedIn: this.viewModel.isLocatedIn
        }, null, 2));

        const results = await this.dataSource.retrieveSearchResults(
          this.viewModel.searchTerms || '',
          this.viewModel.sort,
          this.viewModel.pageNumber,
          this.viewModel.searchId,
          this.viewModel.country,
          this.viewModel.isLocatedIn
        );

        console.log('dataSource.retrieveSearchResults completed, results length:', results?.length || 0);

        this.dataSource.clearDetail();
        this.showSingleItem(false);

        // Re-initialize countdown after search results are loaded
        if (results && results.length > 0) {
          const searchResultsData = {
            searchResults: results
          };

          this.countdown.initializeCountDown(
            undefined as any,
            searchResultsData,
            'searchResults',
            'EndTime',
            'CountDownTime',
            this.viewModel
          );
        }

        return results;
      } catch (e) {
        console.log('Error in search, setting searchTotal to 0 and showing no results');
        this.dataSource.searchTotal = 0;
        this.ui.showInfoSnackbar('No results found.');
        return [];
      }
    }

    console.log('No search terms or saved search ID, returning null');
    return null;
  }

  private showSingleItem(single: boolean): void {
    if (single) {
      this.viewModel.sort = 'MetaEndSort';
    }
    this.viewModel.isSingleItem = single;
  }

  // ===== Events (names preserved) =====
  protected infiniteScroll_canLoadMore(): boolean {
    if (
      this.viewModel.searchResults == null ||
      this.viewModel.searchResults.length <= 1 ||
      (this.dataSource.searchTotal ?? 0) <= 1 ||
      this.viewModel.searchResults.length >= (this.dataSource.searchTotal ?? 0) ||
      this.viewModel.searchResults.length >= 100
    ) {
      return false;
    }
    return true;
  }

  protected async infiniteScroll_loadSearchPage(event?: any): Promise<void> {
    const nextPageNumber = this.viewModel.pageNumber + 1;
    this.tracker.track(TrackerConstants.Search.LoadPage, nextPageNumber);

    if (this.viewModel.searchTerms) {
      try {
        const results = await this.dataSource.retrieveSearchResults(
          this.viewModel.searchTerms,
          this.viewModel.sort,
          nextPageNumber,
          this.viewModel.searchId,
          this.viewModel.country,
          this.viewModel.isLocatedIn
        );
        this.viewModel.searchResults = results;
        this.viewModel.pageNumber = this.dataSource.searchPage;
      } finally {
        if (this.infiniteScroll) this.infiniteScroll.complete();
      }
    } else {
      if (this.infiniteScroll) this.infiniteScroll.complete();
    }
  }

  protected refresher_refresh(event?: CustomEvent): void {
    this.refresh(true);
    // Complete refresher UI when done
    setTimeout(() => {
      if (event?.target) {
        (event.target as any).complete();
      }
    }, 500); // small delay to allow refresh
  }

  // ===== Controller Methods (names preserved) =====
  protected dailyDealItem_click(deal?: any): void {
    this.tracker.track(TrackerConstants.Item.ViewDailyDeal);


  }

  protected sortSearch_click(sort: string): void {
    // Only proceed if sort actually changes
    if (this.viewModel.sort === sort) {
      return;
    }

    this.viewModel.sort = sort;
    this.SortPopover = false;
    // Reset to first page when sorting changes
    this.viewModel.pageNumber = 1;
    // Clear existing results to avoid mixing with new sorted results
    this.viewModel.searchResults = null;
    // Trigger a new search with the updated sort
    this.search_click();
  }

  async advancedOpen_click(ev: any): Promise<void> {
    console.log('Advanced button clicked, initial PerformSearch:', this.PerformSearch);
    const popover = await this.popoverCtrl.create({
      component: SearchAdvancedMenu,
      componentProps: {
        viewModel: this.viewModel,
        Localization: this.Localization,
        locationClick: () => this.location_click(),
        countryClick: () => this.country_click()
      },
      showBackdrop: true,
      backdropDismiss: true,
      event: ev,
      side: 'bottom',
      alignment: 'center',
      size: 'auto',
      translucent: true
    });

    popover.onDidDismiss().then(() => {
      console.log('Popover dismissed, PerformSearch:', this.PerformSearch);
      if (this.PerformSearch) {
        console.log('Performing search');
        this.PerformSearch = false;
        this.search_click();
      } else {
        console.log('Not performing search, PerformSearch is false');
      }
    });

    await popover.present();
  }

  /**
   * Hide the advanced popover and trigger a new search
   */
  protected advancedPopover_hide(): void {
    console.log('Advanced popover hide clicked');
    // Close the popover
    this.popoverCtrl.dismiss();
  }

  location_click(): void {
    console.log('Location clicked, old value:', this.preferences.searchLocatedInCountry, 'new value:', this.viewModel.isLocatedIn);
    const oldIsLocatedIn = this.preferences.searchLocatedInCountry;
    if (this.viewModel.isLocatedIn !== oldIsLocatedIn) {
      console.log('Location changed, setting PerformSearch = true');
      this.PerformSearch = true;
      this.preferences.searchLocatedInCountry = this.viewModel.isLocatedIn;
      console.log('Updated preferences, searchLocatedInCountry:', this.preferences.searchLocatedInCountry);
    } else {
      console.log('Location unchanged');
    }
  }

  country_click(): void {
    console.log('Country clicked, old value:', this.preferences.searchCountry, 'new value:', this.viewModel.country);
    const oldCountry = this.preferences.searchCountry;
    if (this.viewModel.country !== oldCountry) {
      console.log('Country changed, setting PerformSearch = true');
      this.PerformSearch = true;
      this.preferences.searchCountry = this.viewModel.country;
      console.log('Updated preferences, searchCountry:', this.preferences.searchCountry);
    } else {
      console.log('Country unchanged');
    }
  }

  async sortOpen_click(ev: any): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: SortPopover,
      event: ev,
      side: 'bottom',
      alignment: 'center',
      size: 'auto',
      translucent: true
    });

    // Handle the popover result
    popover.onDidDismiss().then((result) => {
      if (result && result.data && result.data.selectedSort) {
        this.sortSearch_click(result.data.selectedSort);
      }
    });

    await popover.present();
  }

  async search_click(): Promise<void> {
    console.log('Search click called, search terms:', this.viewModel.searchTerms);
    // Validate search terms
    if (!this.viewModel.searchTerms || this.viewModel.searchTerms.trim().length === 0) {
      this.ui.showInfoSnackbar('Please enter search terms.');
      return;
    }

    this.isLoading = true;
    this.viewModel.pageNumber = 1;
    try {
      // Track search with sort parameter
      this.tracker.track(TrackerConstants.Search.KeywordSearch,
        `${this.viewModel.searchTerms} (sort: ${this.viewModel.sort}, page: ${this.viewModel.pageNumber})`);

      // Correct call:
      const results = await this.loadSearchData(false);

      if (!results || results.length === 0) {
        this.dataSource.searchTotal = 0;
        this.ui.showInfoSnackbar('No results found.');
      }

      this.viewModel.searchResults = results;
    } catch (err) {
      console.error(err);
      this.ui.showErrorSnackbar('An error occurred while searching.');
    } finally {
      this.isLoading = false;
      this.viewModel.isRefreshing = false;
      if (this.ShowAdvanced) {
        this.showAdvanced();
      }
    }
  }


  clearSearch_click(): void {
    this.tracker.track(TrackerConstants.Search.Clear);
    this.clearSearch();
  }

  saveSearch_click(): void {
    this.tracker.track(TrackerConstants.Search.Save);
    // Navigate to the search creation page with current search terms
    if (this.viewModel.searchTerms) {
      this.router.navigate(['/search/create', this.viewModel.searchTerms]);
    }
  }

  async savedSearchItem_click(savedSearch: any): Promise<void> {
    this.tracker.track(TrackerConstants.Search.SavedSearch);

    this.isLoading = true;
    await this.content.scrollToTop();

    this.viewModel.pageNumber = 1;
    this.viewModel.searchTerms = savedSearch.AllWords;
    this.viewModel.searchId = savedSearch.Id;
    this.viewModel.searchTitle = savedSearch.Title;
    this.dataSource.searchTitle = savedSearch.Title;

    try {
      const results = await this.dataSource.retrieveSearchResults(
        this.viewModel.searchTerms,
        this.viewModel.sort,
        this.viewModel.pageNumber,
        this.viewModel.searchId,
        this.viewModel.country,
        this.viewModel.isLocatedIn
      );

      this.viewModel.searchResults = results;
      this.showSingleItem(false);

      if (this.ShowAdvanced && this.viewModel.searchResults) {
        this.showAdvanced();
      }
    } catch (err) {
      console.error(err);
      this.ui.showErrorSnackbar('An error occurred while loading saved search.');
    } finally {
      this.isLoading = false;
    }
  }

  async loadMoreResults_click(): Promise<void> {
    this.tracker.track(TrackerConstants.Search.LoadNextGroup);

    this.isLoading = true;
    await this.content.scrollToTop();

    const nextPageNumber = this.viewModel.pageNumber + 1;
    this.tracker.track(TrackerConstants.Search.LoadPage, nextPageNumber);

    try {
      const results = await this.dataSource.retrieveSearchResults(
        this.viewModel.searchTerms,
        this.viewModel.sort,
        nextPageNumber,
        this.viewModel.searchId,
        this.viewModel.country,
        this.viewModel.isLocatedIn,
        true
      );

      this.viewModel.searchResults = results;
      this.viewModel.pageNumber = this.dataSource.searchPage;
    } catch (err) {
      console.error(err);
      this.ui.showErrorSnackbar('An error occurred while loading more results.');
    } finally {
      this.isLoading = false;
    }
  }

  // Helper method for template
  getDealRows(): any[][] {
    if (!this.viewModel.deals || this.viewModel.deals.length === 0) {
      return [];
    }

    // Group deals into rows of 3
    const rows: any[][] = [];
    for (let i = 0; i < this.viewModel.deals.length; i += 3) {
      rows.push(this.viewModel.deals.slice(i, i + 3));
    }
    return rows;
  }

  /**
   * Re-initialize countdown when returning to the search page
   */
  private reinitializeCountdown(): void {
    if (this.viewModel.searchResults && this.viewModel.searchResults.length > 0) {
      // Re-initialize countdown for existing search results
      this.OnScroll = this.countdown.initializeCountDown(
        // kept signature parity; modern code wouldn't need these
        undefined as any,
        this.dataSource,
        'searchResults',
        'EndTime',
        'CountDownTime',
        this.viewModel
      );
    }
  }

}
