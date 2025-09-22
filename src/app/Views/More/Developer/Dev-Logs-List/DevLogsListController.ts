import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PopoverController, IonContent, AlertController } from '@ionic/angular';
import { Logger } from 'src/app/services/Logger';
import { UIService } from 'src/app/services/UI';
import { DevLogsFilterController } from 'src/app/Views/More/Developer/Dev-Logs-List/Dev-Logs-Filter/DevLogsFilterController';
import {DevLogsListViewModel } from './DevLogsListViewModel'; // adjust imports to your structure
import { DevLogsFilterViewModel } from 'src/app/Views/More/Developer/Dev-Logs-List/Dev-Logs-Filter/DevLogsFilterViewModel';
import { LogEntry } from 'src/app/models/log-entry.model';
import moment from 'moment';
import { DevLogDetailViewModel } from 'src/app/Views/More/Developer/Dev-Log-Detail/DevLogDetailViewModel';
import { LogLevel } from 'src/app/models/log-level.enum';

import { HttpInterceptor } from 'src/app/services/HttpInterceptor';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-dev-logs-list',
  templateUrl: './dev-logs-list.page.html',
  styleUrls: ['./dev-logs-list.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevLogsListController implements OnInit {
  viewModel: any = {
    logs: {},
    showDebug: false,
    showDebugOnlyHTTP: true,
    showInfo: true,
    showError: true,
    showWarn: true
  };

  private filterPopover: HTMLIonPopoverElement | null = null;

  constructor(
    private popoverController: PopoverController,
    private logger: Logger,
    private ui: UIService
  ) {}

  ngOnInit(): void {
    this.view_loaded();
  }

  ionViewWillEnter(): void {
    this.view_beforeEnter();
  }

  // ------ BaseController Defaults -------
  protected async view_loaded(): Promise<void> {
    this.filterPopover = null; // will be created on filter click

    // Set initial filter flags
    this.viewModel.showDebug = false;
    this.viewModel.showDebugOnlyHTTP = true;
    this.viewModel.showInfo = true;
    this.viewModel.showError = true;
    this.viewModel.showWarn = true;
  }

  protected view_beforeEnter(): void {
    this.populateViewModel(this.logger.logs);
  }

  // ------ Events -------
  async filterMenu_filtersChanged(filters: any): Promise<void> {
    this.viewModel.showDebug = filters.showDebug;
    this.viewModel.showDebugOnlyHTTP = filters.showDebugOnlyHTTP;
    this.viewModel.showInfo = filters.showInfo;
    this.viewModel.showWarn = filters.showWarn;
    this.viewModel.showError = filters.showError;

    this.populateViewModel(this.logger.logs);
    // Optionally scroll to top (use Ionic scroll content ref)
    document.querySelector('ion-content')?.scrollToTop(300);
  }

  // ------ Private Helper Methods -------
  private populateViewModel(logEntries: LogEntry[]): void {
    logEntries = logEntries || [];
    this.viewModel.logs = {};

    // Sort and reverse
    logEntries = [...logEntries].sort((a, b) => {
      const at = Number(a.timestamp) || 0;
      const bt = Number(b.timestamp) || 0;
      return at - bt;
    }).reverse();

    logEntries.forEach((logEntry: LogEntry) => {
      if (!this.isApplicableForCurrentFilter(logEntry)) return;
    
      const viewModel: any = {};
      viewModel.logEntry = logEntry;
    
      // Defensive: fallback to '' or current date
      const ts = logEntry.timestamp ?? '';
      viewModel.time = moment(ts).format('h:mm:ss a');
    
        viewModel.color = LogLevel.getColor(logEntry.level ?? LogLevel.Info);
        viewModel.levelDisplay = LogLevel.getDisplayText(logEntry.level ?? LogLevel.Info);
        viewModel.icon = LogLevel.getIcon(logEntry.level ?? LogLevel.Info);
        
      if (logEntry.metadata) {
        viewModel.httpVerb = logEntry.metadata.method ?? logEntry.metadata.config?.method;
        viewModel.httpUrl  = logEntry.metadata.url ?? logEntry.metadata.config?.url;
        viewModel.httpCode = logEntry.metadata.status;
      }
    
      const formattedDate = moment(ts).format('l');
      if (!this.viewModel.logs[formattedDate]) {
        this.viewModel.logs[formattedDate] = [];
      }
      this.viewModel.logs[formattedDate].push(viewModel);
    });
  }

  private isApplicableForCurrentFilter(logEntry: LogEntry): boolean {
    if (!logEntry || logEntry.level == null) return true;
    if (this.viewModel.showDebugOnlyHTTP && logEntry.tag?.includes('HttpInterceptor')) {
      return true;
    }
    switch (logEntry.level) {
      case LogLevel.Debug: return this.viewModel.showDebug;
      case LogLevel.Warn:  return this.viewModel.showWarn;
      case LogLevel.Info:  return this.viewModel.showInfo;
      case LogLevel.Error: return this.viewModel.showError;
      default: return true;
    }
  }

  // ------ Controller Methods -------
  async filter_click(ev: any) {
    const filters = {
      showDebug: this.viewModel.showDebug,
      showDebugOnlyHTTP: this.viewModel.showDebugOnlyHTTP,
      showInfo: this.viewModel.showInfo,
      showWarn: this.viewModel.showWarn,
      showError: this.viewModel.showError
    };

    const popover = await this.popoverController.create({
      component: DevLogsFilterController,
      componentProps: {filters},
      event: ev,
      translucent: true
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.filtersChanged) {
      await this.filterMenu_filtersChanged(data.filtersChanged);
    }
    this.filterPopover = popover;
  }

  async clear_click() {
    const dialogOk = await this.ui.confirm('Are you sure you want to clear the logs?', 'Clear Logs');
    if (dialogOk) {
      this.logger.clear();
      this.viewModel.logs = {};
    }
  }
}