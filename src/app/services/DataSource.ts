import { Injectable } from '@angular/core';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import * as moment from 'moment';
import { CacheBehavior } from 'src/app/models/cache-behavior.model';
import { CacheEntry } from 'src/app/models/cache-entry.model';
import { KeyValuePair } from 'src/app/models/key-value-pair.model';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataSourceService {
  static readonly MAX_LIST_ITEM_COUNT = 100;
  private _defaultCacheDuration = moment.duration({ minutes: 10 });

  private _searchResults: AuctionSniperApiTypes.SearchResult[] | null = null;
  private _searchTerms: string | null = null;
  private _searchId = 0;
  private _searchTitle: string | null = null;
  private _searchPage: number | null = 1;
  private _searchTotal: number | null = null;
  private _searchSort: string | null = null;
  // Add filter parameters tracking
  private _searchCountry: number | null = null;
  private _searchLocatedIn: boolean | null = null;
  private _deals: any[] | null = null;
  private _watchesCache: CacheEntry<AuctionSniperApiTypes.Watch[]> | null = null;
  private _wins: AuctionSniperApiTypes.Win[] | null = null;
  private _detail: AuctionSniperApiTypes.SearchResult | null = null;
  private _snipesCache: Record<
    AuctionSniperApiTypes.SnipeStatus,
    CacheEntry<AuctionSniperApiTypes.Snipe[]> | null
  > = {
    [AuctionSniperApiTypes.SnipeStatus.Active]: null,
    [AuctionSniperApiTypes.SnipeStatus.Won]: null,
    [AuctionSniperApiTypes.SnipeStatus.Lost]: null,
  };
  private _savedSearches: AuctionSniperApiTypes.SparseSavedSearch[] | null = null;
  private _countries: KeyValuePair<number, string>[] | null = null;

  constructor(private api: AuctionSniperApiService) {}

  clear(): void {
    this._searchResults = null;
    this._searchTerms = null;
    this._searchId = 0;
    this._searchTitle = null;
    this._searchPage = null;
    this._searchTotal = null;
    this._searchSort = null;
    this._searchCountry = null;
    this._searchLocatedIn = null;
    this._deals = null;
    this._watchesCache = null;
    this._wins = null;
    this._detail = null;
    this._savedSearches = null;
    this._countries = null;
    this.clearSnipes();
  }

  // ---------- SEARCH ----------
  get searchResults(): AuctionSniperApiTypes.SearchResult[] | null {
    return this._searchResults;
  }
  get searchTerms(): string | null { return this._searchTerms; }
  get searchId(): number { return this._searchId; }
  set searchId(value: number) { this._searchId = value; }
  get searchTitle(): string | null { return this._searchTitle; }
  set searchTitle(value: string | null) { this._searchTitle = value; }
  get searchPage(): number | null { return this._searchPage; }
  get searchTotal(): number | null { return this._searchTotal; }
  set searchTotal(value: number | null) { this._searchTotal = value; }
  get searchSort(): string | null { return this._searchSort; }
  get searchCountry(): number | null { return this._searchCountry; }
  get searchLocatedIn(): boolean | null { return this._searchLocatedIn; }

  /**
   * Update search results by filtering out specific items
   */
  updateSearchResults(filterFn: (item: AuctionSniperApiTypes.SearchResult) => boolean): void {
    if (this._searchResults) {
      this._searchResults = this._searchResults.filter(filterFn);
    }
  }

  async retrieveSearchResults(
    terms: string, sort: string, page: number, id: number,
    country: number, locatedIn: boolean, rebaseResults = false
  ): Promise<AuctionSniperApiTypes.SearchResult[]> {
  
    console.log('ENTERING DataSource.retrieveSearchResults with parameters:', {
      terms, sort, page, id, country, locatedIn, rebaseResults
    });
  
    const result = await firstValueFrom(
      this.api.searchQuery(terms, sort, page, id, country, locatedIn, page === 1 || rebaseResults)
    );
  
    console.log('DataSource.retrieveSearchResults API call completed, result:', result);
  
    if (result.success) {
      this._searchId = id;
      this._searchTerms = terms;
      this._searchSort = sort;
      this._searchPage = page;
      this._searchTotal = result.count ?? null;
      // Store filter parameters
      this._searchCountry = country;
      this._searchLocatedIn = locatedIn;
  
      if (page > 1 && !rebaseResults) {
        this._searchResults = [...(this._searchResults ?? []), ...(result.items ?? [])];
      } else {
        // Initialize CountDownTime for each search result item
        if (result.items) {
          result.items.forEach(item => {
            // Initialize CountDownTime to empty string so the countdown service can populate it
            if (item.CountDownTime === undefined || item.CountDownTime === null) {
              item.CountDownTime = '';
            }
          });
        }
        this._searchResults = result.items ?? [];
      }
      return this._searchResults;
    } else {
      throw result;
    }
  }

  clearSearchResults(): void {
    this._searchResults = null;
    this._searchTerms = null;
    this._searchId = 0;
    this._searchTitle = null;
    this._searchPage = 1;
  }

  // ---------- DEALS ----------
  get deals(): any[] | null { return this._deals; }
  async retrieveDeals(): Promise<any[]> {
    const result = await firstValueFrom(this.api.deals());
    if (result.success) {
      this._deals = result.items ?? [];
      return result.items;
    }

    throw result;
  }
  clearDeals(): void { this._deals = null; }

  // ---------- WATCHES ----------
  get watches(): AuctionSniperApiTypes.Watch[] | null {
    return this._watchesCache?.item ?? null;
  }

  hasCachedWatches(allowStale = false): boolean {
    if (!this._watchesCache) return false;
    if (allowStale) return true;
    return !this._watchesCache.hasExpired;
  }

  async retrieveWatches(
    cacheBehavior: CacheBehavior = CacheBehavior.Default
  ): Promise<AuctionSniperApiTypes.Watch[]> {
    
    if (cacheBehavior === CacheBehavior.Default && this._watchesCache && !this._watchesCache.hasExpired) {
      return this._watchesCache.item;
    }
    
    if (cacheBehavior === CacheBehavior.AllowStale && this._watchesCache) {
      return this._watchesCache.item;
    }
  
    const result = await firstValueFrom(this.api.getWatchList(false));
  
    const watches = result?.success && result.watches ? result.watches : [];
    
    this._watchesCache = new CacheEntry(
      watches,
      typeof this._defaultCacheDuration === 'number'
        ? this._defaultCacheDuration
        : this._defaultCacheDuration.asMilliseconds() // fixed here
      );
  
    return watches;
  }

  async retrieveWatchesFromEbay(): Promise<AuctionSniperApiTypes.Watch[]> {
    const result = await firstValueFrom(this.api.getWatchList(true));
  
    const watches = result?.success && result.watches ? result.watches : [];
  
    this._watchesCache = new CacheEntry(
      watches,
      typeof this._defaultCacheDuration === 'number'
        ? this._defaultCacheDuration
        : this._defaultCacheDuration.asMilliseconds()
    );
  
    return watches;
  }
  
  clearWatches(): void { this._watchesCache = null; }

  // ---------- WINS ----------
  get wins(): AuctionSniperApiTypes.Win[] | null { return this._wins; }
  async retrieveWins(): Promise<AuctionSniperApiTypes.Win[]> {
    const result = await firstValueFrom(this.api.getWinList());
  
    if (result.success) {
      this._wins = result.wins ?? [];
      return result.wins;
    }
  
    throw result;
  }
  clearWins(): void { this._wins = null; }

  // ---------- DETAIL ----------
  get detail(): AuctionSniperApiTypes.SearchResult | null { return this._detail; }
  async retrieveDetail(
    searchTerms: string,
    blocking = false
  ): Promise<AuctionSniperApiTypes.SearchResult> {
    const result = await firstValueFrom(
      this.api.getItemInfo(searchTerms, blocking)
    );
  
    if (result.success) {
      this._detail = result.item;
      this._searchResults = [result.item];
      this._searchTotal = 1;
      return result.item;
    }
  
    this._searchTotal = 0;
    throw result;
  }
  clearDetail(): void { this._detail = null; }

  // ---------- SNIPES ----------
  get activeSnipes(): AuctionSniperApiTypes.Snipe[] | null {
    return this._snipesCache[AuctionSniperApiTypes.SnipeStatus.Active]?.item ?? null;
  }
  get wonSnipes(): AuctionSniperApiTypes.Snipe[] | null {
    return this._snipesCache[AuctionSniperApiTypes.SnipeStatus.Won]?.item ?? null;
  }
  get lostSnipes(): AuctionSniperApiTypes.Snipe[] | null {
    return this._snipesCache[AuctionSniperApiTypes.SnipeStatus.Lost]?.item ?? null;
  }
  clearSnipes(): void {
    this._snipesCache[AuctionSniperApiTypes.SnipeStatus.Active] = null;
    this._snipesCache[AuctionSniperApiTypes.SnipeStatus.Won] = null;
    this._snipesCache[AuctionSniperApiTypes.SnipeStatus.Lost] = null;
  }

  async retrieveSnipes(
    status: AuctionSniperApiTypes.SnipeStatus,
    cacheBehavior: CacheBehavior = CacheBehavior.Default
  ): Promise<AuctionSniperApiTypes.Snipe[]> {
    if (status == null) throw new Error(`Invalid SnipeStatus: ${status}`);
  
    const entry = this._snipesCache[status];
    if (cacheBehavior === CacheBehavior.Default && entry && !entry.hasExpired) {
      return entry.item;
    }
    if (cacheBehavior === CacheBehavior.AllowStale && entry) {
      return entry.item;
    }
  
    const result = await firstValueFrom(
      this.api.getSnipeList(1, DataSourceService.MAX_LIST_ITEM_COUNT, status)
    );
  
    const snipes = result?.success && result.snipes ? result.snipes : [];
    this._snipesCache[status] = new CacheEntry(
      snipes,
      typeof this._defaultCacheDuration === 'number'
        ? this._defaultCacheDuration
        : this._defaultCacheDuration.asMilliseconds()
    );
    return snipes;
  }

  // ---------- SAVED SEARCHES ----------
  get savedSearches(): AuctionSniperApiTypes.SparseSavedSearch[] | null { return this._savedSearches; }
  async retrieveSavedSearches(): Promise<AuctionSniperApiTypes.SparseSavedSearch[]> {
    const result = await firstValueFrom(this.api.getSavedSearches());
  
    if (result.success) {
      this._savedSearches = result.searches ?? [];
      return result.searches;
    }
  
    throw result;
  }
  clearSavedSearches(): void { this._savedSearches = null; }

  // ---------- COUNTRIES ----------
  get countries(): KeyValuePair<number, string>[] | null { return this._countries; }
  async retrieveCountries(): Promise<KeyValuePair<number, string>[]> {
    const result = await firstValueFrom(this.api.getCountryList());
    this._countries = result ?? [];
    return result;
  }
}