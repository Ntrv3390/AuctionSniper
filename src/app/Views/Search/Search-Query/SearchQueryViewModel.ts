// src/app/view-models/search-query.viewmodel.ts
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

export class SearchQueryViewModel {
  searchTerms = '';
  searchId = 0;
  searchTitle = '';
  searchResults: any[] = [];
  deals: any[] = [];
  searches: AuctionSniperApiTypes.SparseSavedSearch[] = [];
  isRefreshing = false;
  pageNumber = 1;
  sort = '';
  isSingleItem = false;
  country = 0;
  isLocatedIn = false;

  constructor(init?: Partial<SearchQueryViewModel>) {
    Object.assign(this, init);
  }
}
