import { EventEmitter } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class RootViewModel {
  showTabs: boolean = true;
  searchTabBadgeCount: number = 0;
  watchesTabBadgeCount: number = 0;
  snipesTabBadgeCount: number = 0;
  moreTabBadgeCount: number = 0;
  localization: string = 'English';

  private events = new EventEmitter<{ event: string; data?: any }>();

  emit(eventName: string, data?: any) {
    this.events.emit({ event: eventName, data });
  }

  on(eventName: string): Observable<any> {
    return this.events.pipe(
      filter(e => e.event === eventName),
      map(e => e.data)
    );
  }
}