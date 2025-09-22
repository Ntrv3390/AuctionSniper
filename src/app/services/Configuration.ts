import moment from 'moment';
import {BuildConfig } from 'src/app/Interfaces/build-config.interface'; // update path as needed
import { BuildVars } from 'src/app/Interfaces/build-vars.interface'; // update path as needed
import { Inject, Injectable } from '@angular/core';
import { BUILD_VARS_TOKEN } from 'src/app/constants/build-vars.token';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  constructor(@Inject(BUILD_VARS_TOKEN) private buildVars: BuildVars) {}

  private static readonly KEYS = {
    API_URL: 'API_URL',
    WEB_SITE_URL: 'WEB_SITE_URL',
    USE_PAYPAL_SANDBOX: 'USE_PAYPAL_SANDBOX',
    ENABLE_DEVELOPER_TOOLS: 'ENABLE_DEVELOPER_TOOLS',
    DEBUG_LOGGING_URL: 'DEBUG_LOGGING_URL',
    ENABLE_IOS_LOGGING_IN_DISTRIBUTION_BUILDS: 'ENABLE_IOS_LOGGING_IN_DISTRIBUTION_BUILDS',
    REQUIRE_PIN_THRESHOLD: 'REQUIRE_PIN_THRESHOLD',
    LAST_PAUSED_AT: 'LAST_PAUSED_AT',
    ADS_ENABLED: 'ADS_ENABLED',
  };


  public static readonly OVERRIDE_KEYS = [
    ConfigurationService.KEYS.API_URL,
    ConfigurationService.KEYS.WEB_SITE_URL,
    ConfigurationService.KEYS.USE_PAYPAL_SANDBOX,
    ConfigurationService.KEYS.ENABLE_DEVELOPER_TOOLS,
    ConfigurationService.KEYS.DEBUG_LOGGING_URL,
    ConfigurationService.KEYS.ENABLE_IOS_LOGGING_IN_DISTRIBUTION_BUILDS,
    ConfigurationService.KEYS.REQUIRE_PIN_THRESHOLD,
    ConfigurationService.KEYS.LAST_PAUSED_AT,
    ConfigurationService.KEYS.ADS_ENABLED,
    
  ];

  private static readonly REQUIRE_PIN_THRESHOLD_DEFAULT = 10;

  // === GETTERS ===
  get debug(): boolean {
    return this.buildVars.debug;
  }

  get buildTimestamp(): string {
    return this.buildVars.buildTimestamp;
  }

  get commitShortSha(): string {
    return this.buildVars.commitShortSha;
  }

  get values(): BuildConfig {
    return this.buildVars.config;
  }

  get apiUrl(): string {
    return this.getString(ConfigurationService.KEYS.API_URL, this.values.ApiUrl);
  }

  set apiUrl(value: string) {
    this.setString(ConfigurationService.KEYS.API_URL, value);
  }

  get webSiteUrl(): string {
    return this.getString(ConfigurationService.KEYS.WEB_SITE_URL, this.values.WebSiteUrl);
  }

  set webSiteUrl(value: string) {
    this.setString(ConfigurationService.KEYS.WEB_SITE_URL, value);
  }

  get usePayPalSandbox(): boolean {
    return this.getBoolean(ConfigurationService.KEYS.USE_PAYPAL_SANDBOX, this.buildVars.debug);
  }

  set usePayPalSandbox(value: boolean) {
    this.setBoolean(ConfigurationService.KEYS.USE_PAYPAL_SANDBOX, value);
  }

  get payPalEnvironmentName(): string {
    return this.usePayPalSandbox ? 'PayPalEnvironmentSandbox' : 'PayPalEnvironmentProduction';
  }

  get adsEnabled(): boolean {
    return this.getBoolean(ConfigurationService.KEYS.ADS_ENABLED, false);
  }

  set adsEnabled(value: boolean) {
    this.setBoolean(ConfigurationService.KEYS.ADS_ENABLED, value);
  }

  get enableDeveloperTools(): boolean {
    return this.getBoolean(ConfigurationService.KEYS.ENABLE_DEVELOPER_TOOLS, false);
  }

  set enableDeveloperTools(value: boolean) {
    this.setBoolean(ConfigurationService.KEYS.ENABLE_DEVELOPER_TOOLS, value);
  }

  get enableIosLoggingInDistributionBuilds(): boolean {
    return this.getBoolean(
      ConfigurationService.KEYS.ENABLE_IOS_LOGGING_IN_DISTRIBUTION_BUILDS,
      this.values.EnableIosLoggingInDistributionBuilds
    );
  }

  set enableIosLoggingInDistributionBuilds(value: boolean) {
    this.setBoolean(ConfigurationService.KEYS.ENABLE_IOS_LOGGING_IN_DISTRIBUTION_BUILDS, value);
  }

  get requirePinThreshold(): number {
    return this.getNumber(
      ConfigurationService.KEYS.REQUIRE_PIN_THRESHOLD,
      ConfigurationService.REQUIRE_PIN_THRESHOLD_DEFAULT
    );
  }

  set requirePinThreshold(value: number) {
    this.setNumber(ConfigurationService.KEYS.REQUIRE_PIN_THRESHOLD, value);
  }

  get lastPausedAt(): moment.Moment {
    return this.getMoment(ConfigurationService.KEYS.LAST_PAUSED_AT, moment());
  }

  set lastPausedAt(value: moment.Moment) {
    this.setMoment(ConfigurationService.KEYS.LAST_PAUSED_AT, value);
  }

  get debugLoggingUrl(): string {
    return this.getString(ConfigurationService.KEYS.DEBUG_LOGGING_URL, this.values.DebugLoggingUrl);
  }

  set debugLoggingUrl(value: string) {
    this.setString(ConfigurationService.KEYS.DEBUG_LOGGING_URL, value);
  }

  // === UTILS ===
  private getBoolean(key: string, defaultValue: boolean): boolean {
    const value = localStorage.getItem(key);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
  }

  private setBoolean(key: string, value: boolean): void {
    value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value.toString());
  }

  private getNumber(key: string, defaultValue: number): number {
    const value = localStorage.getItem(key);
    const num = value !== null ? parseInt(value, 10) : NaN;
    return isNaN(num) ? defaultValue : num;
  }

  private setNumber(key: string, value: number): void {
    value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value.toString());
  }

  private getString(key: string, defaultValue: string): string {
    const value = localStorage.getItem(key);
    return value == null ? defaultValue : value;
  }

  private setString(key: string, value: string): void {
    value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value);
  }

  private getMoment(key: string, defaultValue: moment.Moment): moment.Moment {
    const value = localStorage.getItem(key);
    return value && moment(value).isValid() ? moment(value) : defaultValue;
  }

  private setMoment(key: string, value: moment.Moment): void {
    value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value.toISOString());
  }
}
