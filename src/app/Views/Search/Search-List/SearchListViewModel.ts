// src/app/view-models/search-list.viewmodel.ts
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

export class SearchListViewModel {
  searches: AuctionSniperApiTypes.SparseSavedSearch[] = [];
  isRefreshing = false;

  constructor(init?: Partial<SearchListViewModel>) {
    Object.assign(this, init);
  }
}
