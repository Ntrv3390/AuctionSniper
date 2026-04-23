import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subject, interval, Subscription } from 'rxjs';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class CountDownUtilitiesService {
  private dataSource: Record<string, any[]> = {};
  private timer: Subscription | null = null;
  private resetTimer: Subscription | null = null;
  private targetField!: string;
  private displayField!: string;
  private entityName!: string;
  private scrollDelegate: any = null;
  private previousScrollPosition = 0;
  private initialized = false;
  private viewModel: any;

  public countdownUpdated$ = new Subject<any[]>();
  public itemsEnded$ = new Subject<any[]>();

  constructor(private platform: Platform, private ngZone: NgZone) {}

  /**
   * Initializes countdown with scroll detection (optional).
   */
  public initializeCountDown(
    scrollDelegateOrEntity: any,
    dataSourceOrTargetField?: any,
    entityName?: string,
    targetField?: string,
    displayField?: string,
    viewModel?: any
  ): (() => void) | void {
  
    // If only 2 args were given, treat as (entityName, targetField)
    if (typeof dataSourceOrTargetField === 'string' && !entityName) {
      entityName = scrollDelegateOrEntity;
      targetField = dataSourceOrTargetField;
      displayField = targetField; // fallback if needed
      dataSourceOrTargetField = this.dataSource; // use a default dataSource
      scrollDelegateOrEntity = null; // no scrollDelegate
      viewModel = this.viewModel; // use default
    }
  
    const scrollDelegate = scrollDelegateOrEntity;
    const dataSource = dataSourceOrTargetField as Record<string, any[]>;
  
    this.dataSource = dataSource;
    this.entityName = entityName!;
    this.targetField = targetField!;
    this.displayField = displayField!;
    this.viewModel = viewModel;
    this.scrollDelegate = scrollDelegate;
    this.initialized = false;
  
    if (scrollDelegate) {
      this.previousScrollPosition = scrollDelegate.getScrollPosition().top;
  
      if (this.platform.is('android')) {
        setTimeout(() => this.onScroll(), 100);
      }
  
      return this.onScroll.bind(this);
    } else {
      this.startCountdown();
    }
  }

  /**
   * Detects scroll pause to reset countdown timer.
   */
  private onScroll(): void {
    if (!this.resetTimer || this.resetTimer.closed || !this.initialized) {
      this.initialized = true;

      if (this.scrollDelegate) {
        this.previousScrollPosition = this.scrollDelegate.getScrollPosition().top;
      }

      this.stopCountdown();

      this.resetTimer = interval(500).subscribe(() => this.runReset());
    }
  }

  /**
   * Resumes countdown if scrolling has paused.
   */
  private runReset(): void {
    if (this.scrollDelegate) {
      const currentScrollPosition = this.scrollDelegate.getScrollPosition().top;

      if (currentScrollPosition === this.previousScrollPosition) {
        this.startCountdown();
        this.resetTimer?.unsubscribe();
        this.resetTimer = null;
      } else {
        this.previousScrollPosition = currentScrollPosition;
      }
    }
  }

  /**
   * Stops both countdown and reset timers.
   */
  public clearCountDown(): void {
    this.stopCountdown();
    this.resetTimer?.unsubscribe();
    this.resetTimer = null;
  }

  /**
   * Starts the countdown interval.
   */
  private startCountdown(): void {
    this.timer = interval(1000).subscribe(() => this.runCountdown());
  }

  /**
   * Stops the countdown interval.
   */
  private stopCountdown(): void {
    this.timer?.unsubscribe();
    this.timer = null;
  }

  /**
   * Core logic for ticking countdown.
   */
  private runCountdown(): void {
    const entities = this.dataSource[this.entityName];
    if (!entities) return;

    const now = Date.now();
    const endedItems: any[] = [];

    for (const entity of entities) {
      if (entity[this.displayField] === 'Ended') continue;

      if (this.viewModel?.sort === 'MetaNewSort') {
        entity[this.displayField] = entity[this.targetField];
      } else {
        const endTime = this.getDateFromEntity(entity);
        const format = this.doCountdown(endTime, now);
        entity[this.displayField] = format;

        if (!entity._CountDownDebugLogged) {
          const diff = endTime - now;
          console.log('[CountDownDebug]', {
            targetField: this.targetField,
            rawEndTime: entity[this.targetField],
            parsedEndTimeMs: endTime,
            parsedEndTimeIso: Number.isFinite(endTime)
              ? new Date(endTime).toISOString()
              : 'Invalid Date',
            deviceNowMs: now,
            deviceNowIso: new Date(now).toISOString(),
            diffMs: diff,
            computedDisplay: format,
          });
          entity._CountDownDebugLogged = true;
        }
        
        // Check if the item has just ended
        if (format === 'Ended') {
          endedItems.push(entity);
          // Update HasEnded property if it exists
          if (entity.hasOwnProperty('HasEnded')) {
            entity.HasEnded = true;
          }
        }
      }
    }

    this.ngZone.run(() => {
      this.countdownUpdated$.next(entities);
      
      // Emit ended items if any
      if (endedItems.length > 0) {
        this.itemsEnded$.next(endedItems);
      }
    });
  }

  /**
   * Memoizes parsed end time from target field.
   */
  private getDateFromEntity(entity: any): number {
    const rawEndTime = entity[this.targetField];
    if (
      Number.isFinite(entity._EndTime) &&
      entity._EndTimeRaw === rawEndTime
    ) {
      return entity._EndTime;
    }

    const time = this.parseEndTime(rawEndTime);
    entity._EndTime = time;
    entity._EndTimeRaw = rawEndTime;
    return time;
  }

  /**
   * Parses end time from API data while handling ISO strings, local display strings,
   * epoch milliseconds, and epoch seconds.
   */
  private parseEndTime(rawEndTime: any): number {
    if (rawEndTime == null) {
      return NaN;
    }

    if (typeof rawEndTime === 'number') {
      return rawEndTime < 1e12 ? rawEndTime * 1000 : rawEndTime;
    }

    if (rawEndTime instanceof Date) {
      return rawEndTime.getTime();
    }

    const value = String(rawEndTime).trim();
    if (!value) {
      return NaN;
    }

    // Numeric strings may be seconds or milliseconds.
    if (/^\d+$/.test(value)) {
      const numeric = Number(value);
      return numeric < 1e12 ? numeric * 1000 : numeric;
    }

    const nativeParsed = Date.parse(value);
    if (Number.isFinite(nativeParsed)) {
      return nativeParsed;
    }

    // Fallback for known non-ISO formats emitted by API mapping.
    const fallback = moment(value, ['MM/DD/YYYY h:mm:ss A', 'MM/DD/YYYY h:mm A'], true);
    return fallback.isValid() ? fallback.valueOf() : NaN;
  }


  /**
   * Converts time difference into formatted countdown.
   */
  private doCountdown(endTime: number, now: number): string {
    if (!Number.isFinite(endTime)) return 'Ended';
    if (now >= endTime) return 'Ended';

    const diff = endTime - now;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hour = Math.floor(diff / (1000 * 60 * 60)) - day * 24;
    const min = Math.floor(diff / (1000 * 60)) - (day * 24 * 60 + hour * 60);
    const sec = Math.floor(diff / 1000) - (day * 86400 + hour * 3600 + min * 60);

    let format = '';
    if (day > 0) format += `${day}d `;
    if (hour > 0) format += `${hour}h `;
    if (min > 0) format += `${min}m `;

    if (diff < 60000) {
      format = `${sec}s`;
    } else if (diff < 86400000) {
      format += `${sec}s`;
    }

    return format.trim();
  }
}