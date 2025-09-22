// File: base-controller.ts (Angular 15+ compatible TypeScript class)

import { OnDestroy, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigatorService } from 'src/app/services/Navigator';
import { Utilities } from 'src/app/services/Utilities';
import { ViewEventArguments } from 'src/app/Interfaces/view-event-arguments.interface';
import { RootController } from 'src/app/Views/Root/RootController';

// Abstract base class - add Injectable decorator for Angular DI
@Injectable()
export abstract class BaseController<T> implements OnDestroy {
  public viewModel: T;
  protected subscriptions: Subscription[] = [];
  
  constructor(
    protected modelType: new () => T,
    protected navigator: NavigatorService,
    protected utilities: Utilities
  ) {
    this.viewModel = new modelType();
    this.onViewLoaded();
  }

  // Lifecycle simulation methods for Ionic views (can be hooked via router events or page lifecycle)
  public onViewLoaded(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }

  public onViewEnter(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }

  public onViewLeave(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }


  public onBeforeEnter(event?: any, eventArgs?: ViewEventArguments): void {
    if (this.navigator.suppressNextRender) {
      this.utilities.setValue(this, 'showView', false);
      this.navigator.performDeferredNavigation();
    } else {
      this.utilities.setValue(this, 'showView', true);
      if (!(this instanceof RootController)) {
        this.utilities.setValue(this.navigator, '_currentController', this);
      }
      this.beforeEnter(event, eventArgs);
    }
  }
  

  public beforeEnter(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }

  public onBeforeLeave(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }

  public onAfterEnter(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }

  public onAfterLeave(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }

  public onUnloaded(event?: any, eventArgs?: ViewEventArguments): void {
    // Optional override
  }

  public destroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}

// Note:
// - Replace the manual $scope event bindings with Angular's lifecycle hooks or router event bindings.
// - Replace usage of `angular.element(document.body).injector()` with Angular DI.
// - `RootController` should be an Angular class too if referenced.
// - Ensure services `NavigatorService` and `UtilitiesService` are implemented as Angular services.
