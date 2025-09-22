// dev-logs-filter.component.ts
import { Component, EventEmitter, Input, OnInit, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import {LogLevel} from 'src/app/models/log-level.enum';

@Component({
  selector: 'app-dev-logs-filter',
  templateUrl: './dev-logs-filter.component.html',
  styleUrls: ['./dev-logs-filter.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevLogsFilterController implements OnInit {
  @Input() filters: any; // external filters passed when opening
  @Output() filtersChanged = new EventEmitter<any>();

  viewModel: any = {
    showDebugOnlyHTTP: false,
    showDebug: true,
    showInfo: true,
    showWarn: true,
    showError: true,


    httpColor: LogLevel.getColor(LogLevel.Debug),
    httpIcon : "ion-ios-world-outline",

    debugColor : LogLevel.getColor(LogLevel.Debug),
    debugIcon : LogLevel.getIcon(LogLevel.Debug),

    infoColor : LogLevel.getColor(LogLevel.Info),
    infoIcon : LogLevel.getIcon(LogLevel.Info),

    warnColor : LogLevel.getColor(LogLevel.Warn),
    warnIcon : LogLevel.getIcon(LogLevel.Warn),

    errorColor : LogLevel.getColor(LogLevel.Error),
    errorIcon : LogLevel.getIcon(LogLevel.Error),
  };

  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {
    // Initialize from parent filters if passed
    if (this.filters) {
      this.viewModel = { ...this.viewModel, ...this.filters };
    }
  }

  private emitChange() {
    this.filtersChanged.emit(this.viewModel);
  }

  debugClick() {
    this.viewModel.showDebug = !this.viewModel.showDebug;
    if (this.viewModel.showDebug) {
      this.viewModel.showDebugOnlyHTTP = false;
    }
    this.emitChange();
  }

  debugOnlyHTTPClick() {
    this.viewModel.showDebugOnlyHTTP = !this.viewModel.showDebugOnlyHTTP;
    if (this.viewModel.showDebugOnlyHTTP) {
      this.viewModel.showDebug = false;
    }
    this.emitChange();
  }

  infoClick() {
    this.viewModel.showInfo = !this.viewModel.showInfo;
    this.emitChange();
  }

  warnClick() {
    this.viewModel.showWarn = !this.viewModel.showWarn;
    this.emitChange();
  }

  errorClick() {
    this.viewModel.showError = !this.viewModel.showError;
    this.emitChange();
  }

  closePopover() {
    this.popoverCtrl.dismiss(this.viewModel);
  }
}
