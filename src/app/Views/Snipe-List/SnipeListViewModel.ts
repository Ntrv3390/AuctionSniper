import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

export class SnipeListViewModel {
  showError: boolean = false;
  showSpinner: boolean = false;
  isRefreshing: boolean = false;

  sortByEndingSoonest: boolean = true;

  snipes: AuctionSniperApiTypes.Snipe[] = [];
  status: AuctionSniperApiTypes.SnipeStatus | null = null;

  constructor(init?: Partial<SnipeListViewModel>) {
    Object.assign(this, init);
  }
}
