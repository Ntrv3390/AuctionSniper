import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { Dictionary } from 'src/app/Interfaces/dictionary.interface';
import { TrackingEvent } from 'src/app/Interfaces/tracking-event.interface';

  export interface Tracker {
      initialize(): void;
      setUser(user: AuctionSniperApiTypes.User): void;
      clearUser(): void;
      trackView(viewId: string, viewData?: Dictionary<any>): void;
      track<T>(event: TrackingEvent<T>, metadata?: T): void;
  }

