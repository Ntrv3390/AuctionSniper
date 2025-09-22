// badge-manager.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppEvents } from '../constants/constants';

export type BadgeDictionary = { [key: string]: number };

@Injectable({
  providedIn: 'root',
})
export class BadgeManagerService {
  private _badges: BadgeDictionary = {};
  private _badgeSubject = new BehaviorSubject<BadgeDictionary>({});

  // Observable for other components to subscribe to
  badgeUpdates$ = this._badgeSubject.asObservable();

  constructor() {}

  addBadgeForTab(tabIndex: number): void {
    const key = `tab_${tabIndex}`;
    this._badges[key] = (this._badges[key] || 0) + 1;
    this._broadcastUpdate();
  }

  setBadgeValueForTab(tabIndex: number, value: number): void {
    const key = `tab_${tabIndex}`;
    this._badges[key] = value;
    this._broadcastUpdate();
  }

  clearBadgeForTab(tabIndex: number): void {
    const key = `tab_${tabIndex}`;
    this._badges[key] = 0;
    this._broadcastUpdate();
  }

  clearAllBadges(): void {
    for (const key of Object.keys(this._badges)) {
      this._badges[key] = 0;
    }
    this._broadcastUpdate();
  }

  getBadgeStates(): BadgeDictionary {
    return { ...this._badges }; // return a clone to avoid mutation
  }

  private _broadcastUpdate(): void {
    this._badgeSubject.next({ ...this._badges });

    // If you want to keep compatibility with any EventBus-based event system:
    // For example: this.eventBus.emit(AppEvents.APP_BADGES_UPDATED, { ...this._badges });
  }
}
