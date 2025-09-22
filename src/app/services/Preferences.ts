import { Injectable } from '@angular/core';
import { Preferences as CapacitorPreferences } from '@capacitor/preferences';

interface Dictionary<T> {
  [key: string]: T;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private static readonly APP_PREFERENCES = 'APP_PREFERENCES';
  private static readonly DEFAULT_SNIPE_DELAY_DEFAULT = 5;

  private static readonly KEYS = {
    USER_UID: 'USER_UID',
    USER_ID: 'USER_ID',
    USER_EMAIL: 'USER_EMAIL',
    TOKEN: 'TOKEN',
    DEFAULT_SNIPE_DELAY: 'DEFAULT_SNIPE_DELAY',
    DEFAULT_ADD_SHIPPING_INSURANCE: 'DEFAULT_ADD_SHIPPING_INSURANCE',
    SHOW_ADD_SHIPPING_INSURANCE: 'SHOW_ADD_SHIPPING_INSURANCE',
    SHOW_ADD_COMMENT: 'SHOW_ADD_COMMENT',
    PIN: 'PIN',
    ALLOW_PUSH_NOTIFICATIONS: 'ALLOW_PUSH_NOTIFICATIONS',
    HAS_PROMPTED_FOR_REVIEW: 'HAS_PROMPTED_FOR_REVIEW',
    WINS_COUNT: 'WINS_COUNT',
    SEARCH_LOCATED_IN_COUNTRY: 'SEARCH_LOCATED_IN_COUNTRY',
    SEARCH_COUNTRY: 'SEARCH_COUNTRY',
    EBAY_TOKEN_EXPIRATION_DATE: 'EBAY_TOKEN_EXPIRATION_DATE',
    EBAY_TOKEN_VALID: 'EBAY_TOKEN_VALID',
    EBAY_TOKEN_NULL: 'EBAY_TOKEN_NULL',
  };

  private _storage: Dictionary<string> = {};
  private _persistTimeout: any;

  async initialize(): Promise<void> {
    const { value } = await CapacitorPreferences.get({ key: PreferencesService.APP_PREFERENCES });

    if (!value) {
      this._storage = {};
      return;
    }

    try {
      const preferences = JSON.parse(value);
      if (typeof preferences !== 'object') throw new Error('Expected object');
      this._storage = preferences;
    } catch (error) {
      console.error('Failed to parse preferences:', error);
      this._storage = {};
    }
  }

  private async persist(): Promise<void> {
    try {
      const json = JSON.stringify(this._storage);
      await CapacitorPreferences.set({ key: PreferencesService.APP_PREFERENCES, value: json });
    } catch (error) {
      console.error('Persist error:', error);
    }
  }

  private queuePersist(): void {
    if (this._persistTimeout) clearTimeout(this._persistTimeout);
    this._persistTimeout = setTimeout(() => this.persist(), 250);
  }

  private getBoolean(key: string, defaultValue = false): boolean {
    const value = this._storage[key];
    return value === 'true' ? true : value === 'false' ? false : defaultValue;
  }

  private setBoolean(key: string, value: boolean): void {
    this._storage[key] = value != null ? value.toString() : '';
    this.queuePersist();
  }

  private getNumber(key: string, defaultValue: number | null = null): number | null {
    const value = this._storage[key];
    return value != null ? parseInt(value, 10) : defaultValue;
  }

  private setNumber(key: string, value: number): void {
    this._storage[key] = value != null ? value.toString() : '';
    this.queuePersist();
  }

  private getString(key: string, defaultValue: string | null = null): string | null {
    const value = this._storage[key];
    return value != null ? value : defaultValue;
  }
  

  private setString(key: string, value: string): void {
    this._storage[key] = value != null ? value : '';
    this.queuePersist();
  }

  get isUserLoggedIn(): boolean {
    return !!this.userUid;
  }

  getUser(): any {
    return {
      Id: this.userUid,
      UserName: this.userId,
      Email: this.userEmail,
      Key: this.token,
      Credits: null
    };
  }

  setAccountPreferences(preferences: any): void {
    this.defaultSnipeDelay = preferences.Delay;
    this.showAddShippingInsurance = preferences.DefaultShowShipInsurance;
    this.defaultAddShippingInsurance = preferences.DefaultShipInsureAll;
    this.showAddComment = preferences.ShowSnipeComment;
  }

  get userUid(): number {
    return this.getNumber(PreferencesService.KEYS.USER_UID)!;
  }
  set userUid(value: number) {
    this.setNumber(PreferencesService.KEYS.USER_UID, value);
  }

  get userId(): string {
    return this.getString(PreferencesService.KEYS.USER_ID)!;
  }
  set userId(value: string) {
    this.setString(PreferencesService.KEYS.USER_ID, value);
  }

  get userEmail(): string {
    return this.getString(PreferencesService.KEYS.USER_EMAIL)!;
  }
  set userEmail(value: string) {
    this.setString(PreferencesService.KEYS.USER_EMAIL, value);
  }

  get token(): string {
    return this.getString(PreferencesService.KEYS.TOKEN)!;
  }
  set token(value: string) {
    this.setString(PreferencesService.KEYS.TOKEN, value);
  }

  get allowPushNotifications(): boolean {
    return this.getBoolean(PreferencesService.KEYS.ALLOW_PUSH_NOTIFICATIONS);
  }
  set allowPushNotifications(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.ALLOW_PUSH_NOTIFICATIONS, value);
  }

  get hasPromptedForReview(): boolean {
    return this.getBoolean(PreferencesService.KEYS.HAS_PROMPTED_FOR_REVIEW);
  }
  set hasPromptedForReview(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.HAS_PROMPTED_FOR_REVIEW, value);
  }

  get winsCount(): number {
    return this.getNumber(PreferencesService.KEYS.WINS_COUNT)!;
  }
  set winsCount(value: number) {
    this.setNumber(PreferencesService.KEYS.WINS_COUNT, value);
  }

  get defaultSnipeDelay(): number {
    return this.getNumber(PreferencesService.KEYS.DEFAULT_SNIPE_DELAY, PreferencesService.DEFAULT_SNIPE_DELAY_DEFAULT)!;
  }
  set defaultSnipeDelay(value: number) {
    this.setNumber(PreferencesService.KEYS.DEFAULT_SNIPE_DELAY, value);
  }

  get defaultAddShippingInsurance(): boolean {
    return this.getBoolean(PreferencesService.KEYS.DEFAULT_ADD_SHIPPING_INSURANCE);
  }
  set defaultAddShippingInsurance(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.DEFAULT_ADD_SHIPPING_INSURANCE, value);
  }

  get showAddShippingInsurance(): boolean {
    return this.getBoolean(PreferencesService.KEYS.SHOW_ADD_SHIPPING_INSURANCE);
  }
  set showAddShippingInsurance(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.SHOW_ADD_SHIPPING_INSURANCE, value);
  }

  get showAddComment(): boolean {
    return this.getBoolean(PreferencesService.KEYS.SHOW_ADD_COMMENT);
  }
  set showAddComment(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.SHOW_ADD_COMMENT, value);
  }

  get pin(): string {
    return this.getString(PreferencesService.KEYS.PIN)!;
  }
  set pin(value: string) {
    this.setString(PreferencesService.KEYS.PIN, value);
  }

  get searchLocatedInCountry(): boolean {
    return this.getBoolean(PreferencesService.KEYS.SEARCH_LOCATED_IN_COUNTRY);
  }
  set searchLocatedInCountry(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.SEARCH_LOCATED_IN_COUNTRY, value);
  }

  get searchCountry(): number {
    return this.getNumber(PreferencesService.KEYS.SEARCH_COUNTRY, 0)!;
  }
  set searchCountry(value: number) {
    this.setNumber(PreferencesService.KEYS.SEARCH_COUNTRY, value);
  }

  get ebayTokenExpirationDate(): string {
    return this.getString(PreferencesService.KEYS.EBAY_TOKEN_EXPIRATION_DATE)!;
  }
  set ebayTokenExpirationDate(value: string) {
    this.setString(PreferencesService.KEYS.EBAY_TOKEN_EXPIRATION_DATE, value);
  }

  get isEbayTokenValid(): boolean {
    return this.getBoolean(PreferencesService.KEYS.EBAY_TOKEN_VALID);
  }
  set isEbayTokenValid(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.EBAY_TOKEN_VALID, value);
  }

  get isEbayTokenNull(): boolean {
    return this.getBoolean(PreferencesService.KEYS.EBAY_TOKEN_NULL);
  }
  set isEbayTokenNull(value: boolean) {
    this.setBoolean(PreferencesService.KEYS.EBAY_TOKEN_NULL, value);
  }

  /**
   * Clears all user authentication data
   */
  async clearUserData(): Promise<void> {
    // Clear user-related keys
    delete this._storage[PreferencesService.KEYS.USER_UID];
    delete this._storage[PreferencesService.KEYS.USER_ID];
    delete this._storage[PreferencesService.KEYS.USER_EMAIL];
    delete this._storage[PreferencesService.KEYS.TOKEN];
    
    // Clear eBay token data
    delete this._storage[PreferencesService.KEYS.EBAY_TOKEN_EXPIRATION_DATE];
    delete this._storage[PreferencesService.KEYS.EBAY_TOKEN_VALID];
    delete this._storage[PreferencesService.KEYS.EBAY_TOKEN_NULL];
    
    // Persist the changes
    await this.persist();
  }
}
