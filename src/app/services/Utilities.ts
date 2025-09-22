import { Injectable, Inject, InjectionToken } from '@angular/core';
// import { Exception } from '../models/exception';
// import { RequestConfig } from '../interfaces/request-config';
import { Injector } from '@angular/core';
import { cloneDeep, bind } from 'lodash';

// Import the Window token from main.ts
import { WINDOW_TOKEN } from '../../main';


@Injectable({
  providedIn: 'root'
})
export class Utilities {
  public static ID = 'Utilities';
  // static $inject = ['$window', '$injector', '$q'];
  globalData = {
    Enums: {},
    awaitOn: () => {}
  };
  private _tagBodyRegExpString = "(?:[^\"'>]|\"[^\"]*\"|'[^']*')*";
  private _tagOrCommentRegExp = new RegExp(
    "<(?:" +
    "!--(?:(?:-*[^->])*--+|-?)" +
    "|script\\b" + this._tagBodyRegExpString + ">[\\s\\S]*?</script\\s*" +
    "|style\\b" + this._tagBodyRegExpString + ">[\\s\\S]*?</style\\s*" +
    "|/?[a-z]" +
    this._tagBodyRegExpString +
    ")>",
    "gi"
  );

  constructor(
    @Inject(WINDOW_TOKEN) private window: Window,
    private injector: Injector
  ) { }

  public endsWith(str: string, suffix: string): boolean {
    if (!str) return false;
    if (!suffix) return true;
    return str.substr(str.length - suffix.length) === suffix;
  }

  public startsWith(str: string, prefix: string): boolean {
    if (!str) return false;
    if (!prefix) return true;
    return str.substr(0, prefix.length) === prefix;
  }

  public toTitleCase(str: string): string {
    if (!str) return '';
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  public format(formatString: string, ...args: any[]): string {
    if (!formatString) return '';
    let dollarRegExp = /\$/g;
    for (let i = 0; i < args.length; i++) {
      let replacement = args[i] ?? '';
      if (typeof replacement !== 'string') {
        replacement = typeof replacement.toString === 'function' ? replacement.toString() : String(replacement);
      }
      if (replacement.indexOf('$') > -1) {
        replacement = replacement.replace(dollarRegExp, '$$$$');
      }
      let regExp = new RegExp(`\\{${i}\\}`, 'gm');
      formatString = formatString.replace(regExp, replacement);
    }
    return formatString;
  }

  public stripHtml(str: string): string {
    if (!str) return str;
    let oldStr;
    do {
      oldStr = str;
      str = str.replace(this._tagOrCommentRegExp, '');
    } while (str !== oldStr);
    return str.replace(/</g, '&lt;');
  }

  public getValue(object: any, propertyString: string): any {
    if (!object || !propertyString) return null;
    if (typeof object[propertyString] !== 'undefined') {
      return object[propertyString];
    }
    return propertyString.split('.').reduce((o, p) => (o ? o[p] : null), object);
  }

  public setValue(object: any, propertyString: string, value: any, instantiateObjects: boolean = true): void {
    if (!object || !propertyString) return;
    const properties = propertyString.split('.');
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      if (i === properties.length - 1) {
        object[property] = value;
      } else {
        if (object[property]) {
          object = object[property];
        } else if (instantiateObjects) {
          object[property] = {};
          object = object[property];
        } else {
          return;
        }
      }
    }
  }

  public derivesFrom(TargetClass: Function, BaseClass: Function): boolean {
    if (TargetClass.prototype === BaseClass.prototype) return true;
    const prototypes = [TargetClass.prototype];
    let CurrentClass = TargetClass;
    while (true) {
      CurrentClass = Object.getPrototypeOf(CurrentClass.prototype).constructor;
      if (CurrentClass.prototype === Object.prototype) break;
      prototypes.push(CurrentClass.prototype);
      if (Object.getPrototypeOf(CurrentClass.prototype) === Object.prototype) break;
    }
    return prototypes.some(p => p === BaseClass.prototype);
  }

  public getFunction(
    scopeOrPropertyString?: unknown,
    propertyString?: string,
    inferContext: boolean = true
  ): (() => unknown) | null {
    let scope: unknown;
  
    // If first arg is a string, treat it as the property string and use this.window as scope
    if (typeof scopeOrPropertyString === 'string') {
      scope = (this as any).window;
      propertyString = scopeOrPropertyString;
    } else {
      scope = scopeOrPropertyString;
    }
  
    if (!propertyString) return null;
  
    const fn = this.getValue(scope, propertyString);
  
    if (typeof fn !== 'function') return null;
  
    if (inferContext) {
      const context = propertyString.includes('.')
        ? this.getValue(scope, propertyString.substring(0, propertyString.lastIndexOf('.')))
        : scope;
  
      return fn.bind(context ?? null);
    }
  
    return fn;
  }
  

  public exposeAllServices(): void {
    let services: Record<string, any> = {};
    this.setValue(services, 'get', (id: string) => this.injector.get(id as any));
    this.setValue(this.window as any, '__services', services);
  }

  public wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  public getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public generateGuid(): string {
    let guid = '';
    for (let j = 0; j < 32; j++) {
      if (j === 8 || j === 12 || j === 16 || j === 20) guid += '-';
      guid += Math.floor(Math.random() * 16).toString(16).toUpperCase();
    }
    return guid;
  }

  public serializeToJson(data: any): string | null {
    try {
      return data ? JSON.stringify(data) : null;
    } catch {
      return null;
    }
  }
  
  public deserializeFromJson(json: string): any {
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  public prepareMetadataForLogging(metadata: any): any {
    if (!metadata) return null;
    try {
      const filter = (key: string, value: any) => {
        if (value == null) return value;
        if (value instanceof Error) return this.serializeError(value);
        if (value.__isRequestConfig) return this.serializeRequestConfig(value);
        if (value.config && value.config.__isRequestConfig) return this.serializeHttpResponse(value);
        if (typeof value === 'string') return value.length > 500 ? value.substr(0, 500) : value;
        return value;
      };
      return JSON.parse(JSON.stringify(metadata, filter));
    } catch (error) {
      console.error('[ERROR] Utilities.prepareMetadataForLogging', error);
      return metadata;
    }
  }

  private serializeError(error: Error): any {
    return { type: 'Error', message: error.message, stack: error.stack };
  }

  private serializeRequestConfig(config: any): any {
    if (!config.__isRequestConfig) return config;
    let serializedConfig = cloneDeep(config);
    delete serializedConfig.__isRequestConfig;
    delete serializedConfig.blocking;
    delete serializedConfig.blockingText;
    delete serializedConfig.logRequestBody;
    delete serializedConfig.logResponseBody;
    delete serializedConfig.suppressErrors;
    delete serializedConfig.suppressMessages;
    delete serializedConfig.isExternalLogRequest;
    if (serializedConfig.headers) {
      if (serializedConfig.headers.Authorization) serializedConfig.headers.Authorization = '[FILTERED]';
      if (serializedConfig.headers.Key) serializedConfig.headers.Key = '[FILTERED]';
    }
    if (config.logRequestBody === false) serializedConfig.data = '[FILTERED]';
    return serializedConfig;
  }

  private serializeHttpResponse(response: any): any {
    if (!response) return response;
    let config = response.config;
    if (!config || !config.__isRequestConfig) return response;
    let serializedResponse = cloneDeep(response);
    if (config.logResponseBody === false) serializedResponse.data = '[FILTERED]';
    return serializedResponse;
  }
}
