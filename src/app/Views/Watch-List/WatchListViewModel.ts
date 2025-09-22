
// src/app/models/watch-list.model.ts

import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface'; // You must define this model
import { Dictionary } from 'src/app/Interfaces/dictionary.interface'; // Define this or use Record<string, boolean>

export interface WatchListViewModel {
  showError: boolean;
  showSpinner: boolean;
  isRefreshing: boolean;
  sortByEndingSoonest: boolean;
  watches: AuctionSniperApiTypes.Watch[];
  snipeItemIds: Dictionary<boolean>; // Or: Record<string, boolean>
}

