// tracker.service.ts
import { Injectable, Injector } from '@angular/core';
import { Logger } from 'src/app/services/Logger';
import { Tracker } from 'src/app/services/interfaces/Tracker';
import { FirebaseTrackerService } from 'src/app/services/FirebaseTracker';
import { TrackingEvent } from 'src/app/Interfaces/tracking-event.interface';
import { Dictionary } from 'src/app/Interfaces/dictionary.interface';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

@Injectable({
  providedIn: 'root'
})
export class TrackerService implements Tracker {

  private initialized = false;
  private trackers = [
    FirebaseTrackerService
  ];

  constructor(
    private injector: Injector,
    private logger: Logger
  ) {}

  initialize(): void {
    this.initialized = true;
    for (const trackerType of this.trackers) {
      try {
        const tracker = this.injector.get<Tracker>(trackerType);
        if (!tracker) {
          this.logger.warn('TrackerService', 'initialize', `Could not locate a tracker by type.`, trackerType.name);
          continue;
        }
        tracker.initialize();
      } catch (error) {
        this.logger.error('TrackerService', 'initialize', 'Error executing a tracker\'s interface method.', {
          trackerType: trackerType.name,
          error
        });
      }
    }
  }

  setUser(user: AuctionSniperApiTypes.User): void {
    if (!this.initialized) return;

    for (const trackerType of this.trackers) {
      try {
        const tracker = this.injector.get<Tracker>(trackerType);
        if (tracker) {
          tracker.setUser(user);
        } else {
          this.logger.warn('TrackerService', 'setUser', 'Could not locate a tracker by type.', trackerType.name);
        }
      } catch (error) {
        this.logger.error('TrackerService', 'setUser', 'Error executing setUser.', {
          trackerType: trackerType.name,
          error
        });
      }
    }
  }

  clearUser(): void {
    if (!this.initialized) return;

    for (const trackerType of this.trackers) {
      try {
        const tracker = this.injector.get<Tracker>(trackerType);
        if (tracker) {
          tracker.clearUser();
        } else {
          this.logger.warn('TrackerService', 'clearUser', 'Could not locate a tracker by type.', trackerType.name);
        }
      } catch (error) {
        this.logger.error('TrackerService', 'clearUser', 'Error executing clearUser.', {
          trackerType: trackerType.name,
          error
        });
      }
    }
  }

  trackView(viewId: string, viewData?: Dictionary<any>): void {
    if (!this.initialized) return;

    for (const trackerType of this.trackers) {
      try {
        const tracker = this.injector.get<Tracker>(trackerType);
        if (tracker) {
          tracker.trackView(viewId, viewData);
        } else {
          this.logger.warn('TrackerService', 'trackView', 'Could not locate a tracker by type.', trackerType.name);
        }
      } catch (error) {
        this.logger.error('TrackerService', 'trackView', 'Error executing trackView.', {
          trackerType: trackerType.name,
          viewId,
          viewData,
          error
        });
      }
    }
  }

  track<T>(event: TrackingEvent<T>, metadata?: T): void {
    if (!this.initialized) return;

    for (const trackerType of this.trackers) {
      try {
        const tracker = this.injector.get<Tracker>(trackerType);
        if (tracker) {
          tracker.track(event, metadata);
        } else {
          this.logger.warn('TrackerService', 'track', 'Could not locate a tracker by type.', trackerType.name);
        }
      } catch (error) {
        this.logger.error('TrackerService', 'track', 'Error executing track.', {
          trackerType: trackerType.name,
          event,
          metadata,
          error
        });
      }
    }
  }
}
