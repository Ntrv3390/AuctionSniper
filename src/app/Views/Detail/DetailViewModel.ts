import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface'; // Define this separately


export class DetailViewModel {
    showError = false;
    showSpinner = false;
  
    item!: AuctionSniperApiTypes.SearchResult;
    itemIsWatched = false;
    itemHasActiveSnipe = false;
  
    constructor(init?: Partial<DetailViewModel>) {
      Object.assign(this, init);
    }
  }
  