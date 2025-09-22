import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SnipeListFilterViewModel } from './SnipeListFilterViewModel';

@Component({
  selector: 'app-snipe-list-filter',
  templateUrl: './snipe-list-filter.component.html',
  styleUrls: ['./snipe-list-filter.component.scss'],
})
export class SnipeListFilterComponent implements OnInit, OnDestroy {
  @Input() initialFilters: SnipeListFilterViewModel | null = null;
  @Output() filtersChanged = new EventEmitter<SnipeListFilterViewModel>();

  viewModel: SnipeListFilterViewModel = new SnipeListFilterViewModel();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.initialFilters) {
      this.viewModel.sortByEndingSoonest = this.initialFilters.sortByEndingSoonest;
    } else {
      this.viewModel.sortByEndingSoonest = true;
    }
  }

  sortByEndingSoonest_click(): void {
    this.viewModel.sortByEndingSoonest = true;
    this.filtersChanged.emit(this.viewModel);
  }

  sortByEndingLater_click(): void {
    this.viewModel.sortByEndingSoonest = false;
    this.filtersChanged.emit(this.viewModel);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
