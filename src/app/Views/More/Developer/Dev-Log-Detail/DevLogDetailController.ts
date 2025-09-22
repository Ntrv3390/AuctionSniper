import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';

import { Logger } from 'src/app/services/Logger';
import { PluginsService } from 'src/app/services/Plugins';
import { Utilities } from 'src/app/services/Utilities';
import { ConfigurationService } from 'src/app/services/Configuration';
import { DevLogDetailViewModel } from './DevLogDetailViewModel';
import { LogLevel } from 'src/app/models/log-level.enum';
import { HttpInterceptor } from 'src/app/services/HttpInterceptor';



@Component({
  selector: 'app-dev-log-detail',
  templateUrl: './dev-log-detail.component.html',
  styleUrls: ['./dev-log-detail.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevLogDetailController implements OnInit {

  public viewModel = new DevLogDetailViewModel();
  private logId: string = '';

  constructor(
    private route: ActivatedRoute,
    private logger: Logger,
    private plugins: PluginsService,
    private utilities: Utilities,
    private configuration: ConfigurationService,
    private window: Window
  ) {}

  ngOnInit(): void {
    this.logId = this.route.snapshot.paramMap.get('id') ?? '';
    this.view_beforeEnter();
  }

  protected view_beforeEnter(): void {
    this.viewModel.logEntry = this.logger.getLog(this.logId)!;
    const timestamp = this.viewModel.logEntry.timestamp;
    if (timestamp) {
      this.viewModel.date = moment(timestamp).format('MMMM Do YYYY');
      this.viewModel.time = moment(timestamp).format('h:mm:ss a');
    } else {
      this.viewModel.date = '';
      this.viewModel.time = '';
    }
  
    try {
      this.viewModel.formattedMetadata = JSON.stringify(this.viewModel.logEntry.metadata, null, 1);
    } catch (exception) {
      this.viewModel.formattedMetadata = 'Unable to stringify metadata: ' + exception;
    }
  
    const level = this.viewModel.logEntry.level ?? 0; // or some default enum value

    this.viewModel.icon = this.getIcon(level);
    this.viewModel.color = this.getColor(level);
    this.viewModel.levelDisplay = this.getDisplayText(level);
  
    // If this was a log from the HTTP interceptor, use the network icon.
    if (this.viewModel.logEntry?.tag && this.viewModel.logEntry.tag.indexOf(HttpInterceptor.ID) > -1) {
        this.viewModel.icon = 'ion-ios-world-outline';
      }
  }
  

  protected copy_click(): void {
    const json = JSON.stringify(this.viewModel.logEntry, null, 4);
    this.plugins.clipboard.write({ string: json });
  }

  protected email_click(): void {
    let uri = this.utilities.format(
      `mailto:${this.configuration.values.AuthorEmail}?subject=${this.configuration.values.ApplicationName} Log&body=${JSON.stringify(this.viewModel.logEntry)}`
    );

    uri = encodeURI(uri);
    this.window.open(uri);
  }

  // Helper methods to get icon/color/display, assuming LoggerService has these or replace with your logic
  private getIcon(level: number): string {
    return LogLevel.getIcon(level);
  }

  private getColor(level: number): string {
    return LogLevel.getColor(level);
  }

  private getDisplayText(level: number): string {
    return LogLevel.getDisplayText(level);
  }
}
