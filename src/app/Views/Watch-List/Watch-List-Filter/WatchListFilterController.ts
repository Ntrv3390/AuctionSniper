// src/app/components/watch-list-filter/watch-list-filter.component.ts

import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { WatchListFilterViewModel } from 'src/app/Views/Watch-List/Watch-List-Filter/WatchListFilterViewModel';

@Component({
  selector: 'app-watch-list-filter',
  templateUrl: './watch-list-filter.component.html',
  styleUrls: ['./watch-list-filter.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WatchListFilterComponent implements OnInit {
  @Input() filters: WatchListFilterViewModel = { sortByEndingSoonest: true };
  @Output() filtersChanged = new EventEmitter<WatchListFilterViewModel>();

  ngOnInit(): void {
    if (this.filters.sortByEndingSoonest === undefined || this.filters.sortByEndingSoonest === null) {
      this.filters.sortByEndingSoonest = true;
    }
  }

  setFiltersFromParent(filters: WatchListFilterViewModel): void {
    this.filters = { ...filters };
  }

  sortByEndingSoonestClick(): void {
    this.filters.sortByEndingSoonest = true;
    this.filtersChanged.emit(this.filters);
  }

  sortByEndingLaterClick(): void {
    this.filters.sortByEndingSoonest = false;
    this.filtersChanged.emit(this.filters);
  }
}
