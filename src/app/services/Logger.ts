// Migrated Logger class into TypeScript ES6 module format


import { Injectable, Injector } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import moment from 'moment';
import URI from 'urijs';
import { NativeHttpService } from './NativeHttpService';

// Assuming lodash-es or native methods
import _ from 'lodash';

import { ConfigurationService } from 'src/app/services/Configuration';
import { PlatformService } from 'src/app/services/Platform';
import { Utilities } from 'src/app/services/Utilities';
import { PluginsService } from 'src/app/services/Plugins';
import { PreferencesService } from 'src/app/services/Preferences';
import { LogEntry } from 'src/app/models/log-entry.model';
import { LogLevel } from 'src/app/models/log-level.enum';

import { LogHttpFields } from 'src/app/models/log-http-fields.model';
import { Exception } from 'src/app/Framework/Exception';
import { QueryStringCollection } from 'src/app/models/query-string-collection';

declare const LE: any; // LogEntries / Rapid7 Insights logger

@Injectable({ providedIn: 'root' })
export class Logger  {
  private _logs: LogEntry[] = [];
  private _maxLogEntries = 75;
  private _currentRoute: string | null = null;

  constructor(
    private router: Router,
    private injector: Injector,
    private http: HttpClient,
    private configuration: ConfigurationService,
    private platform: PlatformService,
    private utilities: Utilities,
    private plugins: PluginsService,
    private nativeHttp: NativeHttpService
  ) {
    // Listen for route changes (replaces $rootScope.$on('$locationChangeStart'))
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.angular_locationChangeStart(event.url);
      });
  }

  private get preferences(): PreferencesService {
    return this.injector.get(PreferencesService);
  }

  public get logs(): LogEntry[] {
    return this._logs;
  }

  public initialize(): void {
    LE.init({
      token: this.configuration.values.LogEntriesToken,
      ssl: true,
      catchall: false,
      page_info: 'per-page',
      print: false
    });
  }

  public debug(tagPrefix: string, tag: string, message: string, metadata?: any): void {
    this.log(LogLevel.Debug, `${tagPrefix}.${tag}`, message, metadata);
  }

  public info(tagPrefix: string, tag: string, message: string, metadata?: any): void {
    this.log(LogLevel.Info, `${tagPrefix}.${tag}`, message, metadata);
  }

  public warn(tagPrefix: string, tag: string, message: string, metadata?: any): void {
    this.log(LogLevel.Warn, `${tagPrefix}.${tag}`, message, metadata);
  }

  public error(tagPrefix: string, tag: string, message: string, metadata?: any): void {
    this.log(LogLevel.Error, `${tagPrefix}.${tag}`, message, metadata);
  }

  public clear(): void {
    this._logs = [];
  }

  public getLog(id: string): LogEntry | undefined {
    return this._logs.find(logEntry => logEntry.id === id);
  }

  private angular_locationChangeStart(newRoute: string): void {
    this._currentRoute = newRoute;
  }

  private getShortRoute(route: string): string | null {
    if (!route) return null;
    try {
      const newUri = new URI(route);
      return newUri.fragment();
    } catch {
      return '[error getting short route]';
    }
  }

  private log(level: LogLevel, tag: string, message: string, metadata?: any) {
    try {
      if (level === LogLevel.Error && metadata) {
        const isHttpZero =
          metadata.status === 0 ||
          metadata.innerError?.status === 0 ||
          metadata.context?.status === 0;
        const isHttpNegativeOne =
          metadata.status === -1 ||
          metadata.innerError?.status === -1 ||
          metadata.context?.status === -1;
        if (isHttpZero || isHttpNegativeOne) {
          level = LogLevel.Warn;
        }
      }

      const preppedMetadata = this.utilities.prepareMetadataForLogging(metadata);

      this.logToInMemoryArray(level, tag, message, preppedMetadata);

      if (level === LogLevel.Warn || level === LogLevel.Error) {
        const httpFields = this.getHttpFields(metadata);
        this.logToLogEntries(level, tag, message, preppedMetadata, httpFields);
      }

      if (this.platform.native) {
        this.logToConsoleOnNativeDevices(level, tag, message, preppedMetadata);
      } else {
        this.logToConsoleInDevelopmentBrowser(level, tag, message, metadata);
      }

      if (this.configuration.debugLoggingUrl) {
        this.logToArbitraryExternalUrl(this.configuration.debugLoggingUrl, level, tag, message, preppedMetadata);
      }
    } catch (error) {
      console.error('[ERROR] Logger.log: Uncaught error.', error);
    }
  }

  private logToInMemoryArray(level: LogLevel, tag: string, message: string, metadata?: any) {
    if (this._logs.length >= this._maxLogEntries) {
      this._logs.shift();
    }
    const entry = new LogEntry();
    entry.id = this.utilities.generateGuid();
    entry.timestamp = moment().toDate();
    entry.level = level;
    entry.tag = tag;
    entry.message = message;
    entry.metadata = metadata;
    this._logs.push(entry);
  }

  private logToLogEntries(level: LogLevel, tag: string, message: string, metadata?: any, httpFields?: LogHttpFields) {
    const data: any = {
      level: LogLevel.getMarkerText(level),
      tag,
      message,
      currentRoute: this._currentRoute ? this.getShortRoute(this._currentRoute) : null,
      stateName: this.router.url,
      userUid: this.preferences.userUid,
      userId: this.preferences.userId,
      deviceId: this.platform.device?.uuid ?? '',
      platform: this.platform.device?.platform ?? '',
      model: this.platform.device?.model ?? '',
      osVer: this.platform.device?.osVersion ?? '',
      os: `${this.platform.device?.platform ?? ''} ${this.platform.device?.osVersion ?? ''}`,
      appVer: this.configuration.values.AppVersion,
      appVerNative: this.platform?.device?.nativeAppVersion ?? "",
      appBuildVerNative: this.platform?.device?.nativeAppBuildVersion ?? "",
      commit: this.configuration.commitShortSha,
      userAgent: this.platform.userAgent
    };

    if (metadata) data.metadata = metadata;
    if (httpFields) Object.assign(data, httpFields);

    try {
      switch (level) {
        case LogLevel.Debug:
          LE.log(data);
          break;
        case LogLevel.Info:
          LE.info(data);
          break;
        case LogLevel.Warn:
          LE.warn(data);
          break;
        case LogLevel.Error:
          LE.error(data);
          break;
        default:
          LE.log(data);
      }
    } catch (exception) {
      console.error('[ERROR] Logger.logToLogEntries', exception);
    }
  }

  private logToConsoleOnNativeDevices(level: LogLevel, tag: string, message: string, metadata?: any) {
    const levelMarker = LogLevel.getMarkerText(level);
    if (this.platform.iOS) {
      if (this.configuration.enableIosLoggingInDistributionBuilds) {
        let formattedMessage = `[App Logger] ${levelMarker} ${tag}: ${message}`;
        if (metadata) formattedMessage += ` [Metadata]: ${this.utilities.serializeToJson(metadata)}`;
        this.plugins.sharedNative.nsLog({ message: formattedMessage });
      } else {
        this.logToConsole(level, `${levelMarker} ${tag}: ${message}`, metadata);
      }
    } else if (this.platform.android) {
      let formattedMessage = `${levelMarker} ${tag}: ${message}`;
      if (metadata) formattedMessage += ` [Metadata]: ${this.utilities.serializeToJson(metadata)}`;
      this.logToConsole(level, formattedMessage, null);
    }
  }

  private logToConsoleInDevelopmentBrowser(level: LogLevel, tag: string, message: string, metadata?: any) {
    const levelMarker = LogLevel.getMarkerText(level);
    this.logToConsole(level, `${levelMarker} ${tag}: ${message}`, metadata);

    if (metadata instanceof Exception) {
      if (metadata.innerError) {
        this.logToConsole(level, `${levelMarker} ${tag}: Exception Inner Error: ${metadata.innerError.message || ''}`, metadata.innerError);
      }
      if (metadata.context) {
        this.logToConsole(level, `${levelMarker} ${tag}: Exception Context`, metadata.context);
      }
    }
  }

  private logToConsole(level: LogLevel, message: string, metadata?: any) {
    try {
      if (metadata) {
        switch (level) {
          case LogLevel.Debug: console.debug(message, metadata); break;
          case LogLevel.Info: console.info(message, metadata); break;
          case LogLevel.Warn: console.warn(message, metadata); break;
          case LogLevel.Error: console.error(message, metadata); break;
          default: console.log(message, metadata); break;
        }
      } else {
        switch (level) {
          case LogLevel.Debug: console.debug(message); break;
          case LogLevel.Info: console.info(message); break;
          case LogLevel.Warn: console.warn(message); break;
          case LogLevel.Error: console.error(message); break;
          default: console.log(message); break;
        }
      }
    } catch (exception) {
      console.error('[ERROR] Logger.logToConsole', exception);
    }
  }

  private logToArbitraryExternalUrl(url: string, level: LogLevel, tag: string, message: string, metadata?: any) {
    const body = {
      level: LogLevel.getMarkerText(level),
      tag,
      message,
      metadata
    };
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      console.log('Logger: Making logToArbitraryExternalUrl request to:', url);
      this.nativeHttp.post(url, body, { headers }).subscribe();
    } catch (exception) {
      console.error('[ERROR] Logger.logToArbitraryExternalUrl', exception);
    }
  }

  private getHttpFields(response: any): LogHttpFields | undefined {
    if (!response) return;
    const data: LogHttpFields = {};

    if (typeof response.config === 'object' && typeof response.status === 'number' && typeof response.config.url === 'string') {
      try {
        const uri = new URI(response.config.url);
        data.httpRequestUrl = uri.path();
      } catch (error) {
        console.error('Error parsing HTTP URL', error);
      }
      try {
        const collection = new QueryStringCollection(response.config.url);
        data.httpQueryParams = collection.getDictionary() ?? undefined;
    } catch (error) {
        console.error('Error parsing HTTP query params', error);
      }
    }

    if (typeof response.config === 'object' && typeof response.status === 'number' && typeof response.headers === 'function') {
      data.httpResponseHeaders = {};
      const headers = ['CF-RAY'];
      for (const header of headers) {
        try {
          data.httpResponseHeaders[header] = response.headers(header);
        } catch (error) {
          console.error(`Error reading HTTP header ${header}`, error);
        }
      }
    }
    return data;
  }
}























// import { IRootScopeService } from 'angular';
// import { IStateService } from '@uirouter/angularjs';
// import * as angular from 'angular';

// type IHttpService = angular.IHttpService;
// type IInjectorService = angular.auto.IInjectorService;

// import { Configuration } from './Configuration';
// import { Platform } from './Platform';
// import { Utilities } from './Utilities';
// import { Plugins } from './Plugins';
// import { Preferences } from './Preferences';
// import { LogLevel, LogEntry, LogHttpFields } from '../Models/LogModels';
// import { RequestConfig } from '../Interfaces/RequestConfig';
// import URI from 'urijs';
// import _ from 'lodash';
// import LE from 'le'; // assuming LogEntries client
// import { Exception } from '../Models/Exception';
// import { QueryStringCollection } from '../Models/QueryStringCollection';
// import moment from 'moment';

// export class Logger {

//     public static ID = 'Logger';

//     private _logs: LogEntry[] = [];
//     private _maxLogEntries = 75;
//     private _currentRoute: string;

//     constructor(
//         private $rootScope: IRootScopeService,
//         private $state: IStateService,
//         private $injector: IInjectorService,
//         private $http: IHttpService,
//         private Configuration: Configuration,
//         private Platform: Platform,
//         private Utilities: Utilities,
//         private Plugins: Plugins,
//     ) {
//         $rootScope.$on('$locationChangeStart', this.angular_locationChangeStart.bind(this));
//     }

//     private get Preferences(): Preferences {
//         return this.$injector.get(Preferences.ID);
//     }

//     public get logs(): LogEntry[] {
//         return this._logs;
//     }

//     public initialize(): void {
//         this.$rootScope.$on('$locationChangeStart', this.angular_locationChangeStart.bind(this));
//         LE.init({
//             token: this.Configuration.values.LogEntriesToken,
//             ssl: true,
//             catchall: false,
//             page_info: 'per-page',
//             print: false
//         });
//     }

//     public debug(tagPrefix: string, tag: string, message: string, metadata?: any): void {
//         this.log(LogLevel.Debug, `${tagPrefix}.${tag}`, message, metadata);
//     }

//     public info(tagPrefix: string, tag: string, message: string, metadata?: any): void {
//         this.log(LogLevel.Info, `${tagPrefix}.${tag}`, message, metadata);
//     }

//     public warn(tagPrefix: string, tag: string, message: string, metadata?: any): void {
//         this.log(LogLevel.Warn, `${tagPrefix}.${tag}`, message, metadata);
//     }

//     public error(tagPrefix: string, tag: string, message: string, metadata?: any): void {
//         this.log(LogLevel.Error, `${tagPrefix}.${tag}`, message, metadata);
//     }

//     public clear(): void {
//         this._logs = [];
//     }

//     public getLog(id: string): LogEntry {
//         return _.find(this._logs, (entry) => entry.id === id);
//     }

//     private angular_locationChangeStart(event: ng.IAngularEvent, newRoute: string): void {
//         this._currentRoute = newRoute;
//     }

//     private getShortRoute(route: string): string {
//         try {
//             const uri = new URI(route);
//             return uri.fragment();
//         } catch {
//             return '[error getting short route]';
//         }
//     }

//     private log(level: LogLevel, tag: string, message: string, metadata?: any): void {
//         try {
//             const preppedMetadata = this.Utilities.prepareMetadataForLogging(metadata);

//             if ([0, -1].includes(metadata?.status)) level = LogLevel.Warn;

//             this.logToInMemoryArray(level, tag, message, preppedMetadata);

//             if (level === LogLevel.Warn || level === LogLevel.Error) {
//                 const httpFields = this.getHttpFields(metadata);
//                 this.logToLogEntries(level, tag, message, preppedMetadata, httpFields);
//             }

//             if (this.Platform.native) {
//                 this.logToConsoleOnNativeDevices(level, tag, message, preppedMetadata);
//             } else {
//                 this.logToConsoleInDevelopmentBrowser(level, tag, message, metadata);
//             }

//             if (this.Configuration.debugLoggingUrl) {
//                 this.logToArbitraryExternalUrl(this.Configuration.debugLoggingUrl, level, tag, message, preppedMetadata);
//             }
//         } catch (error) {
//             console.error('[ERROR] Logger.log: Uncaught error.', error);
//         }
//     }

//     private logToInMemoryArray(level: LogLevel, tag: string, message: string, metadata?: any): void {
//         if (this._logs.length >= this._maxLogEntries) {
//             this._logs.shift();
//         }

//         const entry = new LogEntry();
//         entry.id = this.Utilities.generateGuid();
//         entry.timestamp = moment();
//         entry.level = level;
//         entry.tag = tag;
//         entry.message = message;
//         entry.metadata = metadata;

//         this._logs.push(entry);
//     }

//     private logToLogEntries(level: LogLevel, tag: string, message: string, metadata?: any, httpFields?: LogHttpFields): void {
//         const data: any = {
//             level: LogLevel.getMarkerText(level),
//             tag,
//             message,
//             currentRoute: this.getShortRoute(this._currentRoute),
//             stateName: this.$state.current.name,
//             userUid: this.Preferences.userUid,
//             userId: this.Preferences.userId,
//             deviceId: this.Platform.device.uuid,
//             platform: this.Platform.device.platform,
//             model: this.Platform.device.model,
//             osVer: this.Platform.device.osVersion,
//             os: `${this.Platform.device.platform} ${this.Platform.device.osVersion}`,
//             appVer: this.Configuration.values.AppVersion,
//             appVerNative: this.Platform.device.naviteAppVersion,
//             appBuildVerNative: this.Platform.device.nativeAppBuildVersion,
//             commit: this.Configuration.commitShortSha,
//             userAgent: this.Platform.userAgent,
//             metadata,
//             ...httpFields
//         };

//         try {
//             switch (level) {
//                 case LogLevel.Debug: LE.log(data); break;
//                 case LogLevel.Info: LE.info(data); break;
//                 case LogLevel.Warn: LE.warn(data); break;
//                 case LogLevel.Error: LE.error(data); break;
//                 default: LE.log(data);
//             }
//         } catch (ex) {
//             console.error('[ERROR] Logger.logToLogEntries:', ex);
//         }
//     }

//     private logToConsoleOnNativeDevices(level: LogLevel, tag: string, message: string, metadata?: any): void {
//         const levelMarker = LogLevel.getMarkerText(level);
//         let formatted = `${levelMarker} ${tag}: ${message}`;

//         if (this.Platform.iOS && this.Configuration.enableIosLoggingInDistributionBuilds) {
//             if (metadata) formatted += ` [Metadata]: ${this.Utilities.serializeToJson(metadata)}`;
//             this.Plugins.sharedNative.nsLog({ message: `[App Logger] ${formatted}` });
//         } else if (this.Platform.android) {
//             if (metadata) formatted += ` [Metadata]: ${this.Utilities.serializeToJson(metadata)}`;
//             this.logToConsole(level, formatted);
//         } else {
//             this.logToConsole(level, formatted, metadata);
//         }
//     }

//     private logToConsoleInDevelopmentBrowser(level: LogLevel, tag: string, message: string, metadata?: any): void {
//         const levelMarker = LogLevel.getMarkerText(level);
//         this.logToConsole(level, `${levelMarker} ${tag}: ${message}`, metadata);

//         if (metadata instanceof Exception) {
//             if (metadata.innerError) this.logToConsole(level, `${levelMarker} ${tag}: Exception Inner Error: ${metadata.innerError.message}`, metadata.innerError);
//             if (metadata.context) this.logToConsole(level, `${levelMarker} ${tag}: Exception Context`, metadata.context);
//         }
//     }

//     private logToConsole(level: LogLevel, message: string, metadata?: any): void {
//         try {
//             if (metadata) {
//                 switch (level) {
//                     case LogLevel.Debug: console.debug(message, metadata); break;
//                     case LogLevel.Info: console.info(message, metadata); break;
//                     case LogLevel.Warn: console.warn(message, metadata); break;
//                     case LogLevel.Error: console.error(message, metadata); break;
//                     default: console.log(message, metadata);
//                 }
//             } else {
//                 switch (level) {
//                     case LogLevel.Debug: console.debug(message); break;
//                     case LogLevel.Info: console.info(message); break;
//                     case LogLevel.Warn: console.warn(message); break;
//                     case LogLevel.Error: console.error(message); break;
//                     default: console.log(message);
//                 }
//             }
//         } catch (ex) {
//             console.error('[ERROR] Logger.logToConsole:', ex);
//         }
//     }

//     private logToArbitraryExternalUrl(url: string, level: LogLevel, tag: string, message: string, metadata?: any): void {
//         const httpConfig: RequestConfig = {
//             method: 'POST',
//             url,
//             data: { level: LogLevel.getMarkerText(level), tag, message, metadata },
//             blocking: false,
//             logRequestBody: false,
//             logResponseBody: false,
//             isExternalLogRequest: true
//         };

//         try {
//             this.$http(httpConfig);
//         } catch (ex) {
//             console.error('[ERROR] Logger.logToArbitraryExternalUrl:', ex);
//         }
//     }

//     private getHttpFields(response: ng.IHttpPromiseCallbackArg<any>): LogHttpFields {
//         if (!response) return;

//         const fields: LogHttpFields = {};

//         try {
//             if (response.config?.url) {
//                 const uri = new URI(response.config.url);
//                 fields.httpRequestUrl = uri.path();
//                 fields.httpQueryParams = new QueryStringCollection(response.config.url).getDictionary();
//             }

//             if (typeof response.headers === 'function') {
//                 fields.httpResponseHeaders = {
//                     'CF-RAY': response.headers('CF-RAY')
//                 };
//             }
//         } catch (ex) {
//             console.error('[ERROR] Logger.getHttpFields:', ex);
//         }

//         return fields;
//     }
// }
