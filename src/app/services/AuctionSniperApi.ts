// src/app/services/auction-sniper-api.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { KeyValuePair } from 'src/app/Interfaces/key-value-pair.interface'; // adjust import path
import { environment } from '../../environments/environment';
import { Platform } from '@ionic/angular';
import { NativeHttpService } from './NativeHttpService';
import { PreferencesService } from './Preferences';
import { ApiMessageExtractorService } from './ApiMessageExtractor';
import { DataSourceService } from './DataSource';

// Utility function for API logging
const logApiRequest = (
  method: string,
  url: string,
  data?: any,
  headers?: any
) => {
  console.log(
    `API Request - ${method}: ${url}`,
    JSON.stringify(
      {
        url,
        method,
        data,
        headers,
      },
      null,
      2
    )
  );
};

const logApiResponse = (method: string, url: string, response: any) => {
  console.log(
    `API Response - ${method}: ${url}`,
    JSON.stringify(
      {
        url,
        method,
        response,
      },
      null,
      2
    )
  );
};

const logApiError = (method: string, url: string, error: any) => {
  console.error(
    `API Error - ${method}: ${url}`,
    JSON.stringify(
      {
        url,
        method,
        error,
      },
      null,
      2
    )
  );
};

@Injectable({
  providedIn: 'root',
})
export class AuctionSniperApiService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private nativeHttp: NativeHttpService,
    private preferences: PreferencesService,
    private messageExtractor: ApiMessageExtractorService // private dataSource: DataSourceService
  ) {
    // Initialize baseUrl based on platform
    this.baseUrl = this.getApiUrl('/Account');
  }

  private getApiUrl(endpoint: string): string {
    // ALWAYS use HTTPS for all platforms to ensure secure communication
    // Note: /api is NOT needed in the URL as the server handles this internally
    const url = `https://main.auctionsniper.com${endpoint}`;
    return url;
  }

  private getApiKey(): string {
    return this.preferences.token || '';
  }

  logon(
    loginParams: AuctionSniperApiTypes.LoginParameters
  ): Observable<AuctionSniperApiTypes.LogonResult> {
    const url = `${this.baseUrl}/Logon`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };

    logApiRequest('POST', url, loginParams, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.LogonResult>(url, loginParams, { headers })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  logoff(): Observable<AuctionSniperApiTypes.LogoffResult> {
    const url = `${this.baseUrl}/Logoff`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);

    return this.nativeHttp
      .get<AuctionSniperApiTypes.LogoffResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          this.preferences.token = '';
          //this.dataSource.clear();
          window.location.href = '/';
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  register(
    params: AuctionSniperApiTypes.RegisterParameters
  ): Observable<AuctionSniperApiTypes.RegisterResult> {
    const url = `${this.baseUrl}/Register`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    logApiRequest('POST', url, params, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.RegisterResult>(url, params, { headers })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  deleteAccount(): Observable<AuctionSniperApiTypes.DeleteAccountResult> {
    const url = `${this.baseUrl}/Delete`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('POST', url, {}, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.DeleteAccountResult>(url, {}, { headers })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  getUser(
    userApiToken: string
  ): Observable<AuctionSniperApiTypes.GetUserResult> {
    const url = `${this.baseUrl}/User`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.GetUserResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  getEbayTokenStatus(): Observable<AuctionSniperApiTypes.EbayTokenStatusResult> {
    const url = `${this.baseUrl}/TokenStatus`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.EbayTokenStatusResult>(url, { headers })
      .pipe(
        map((response: any) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  getAccountInformation(): Observable<AuctionSniperApiTypes.AccountInformationResult> {
    const url = `${this.baseUrl}/Information`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.AccountInformationResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  updateAccountInformation(
    params: AuctionSniperApiTypes.AccountInformationParameters
  ): Observable<AuctionSniperApiTypes.AccountInformationResult> {
    const url = `${this.baseUrl}/Information`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('PUT', url, params, headers);
    return this.nativeHttp
      .put<AuctionSniperApiTypes.AccountInformationResult>(url, params, {
        headers,
      })
      .pipe(
        map((response) => {
          logApiResponse('PUT', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('PUT', url, error);
          return throwError(() => error);
        })
      );
  }

  appLaunch(
    params: AuctionSniperApiTypes.AppLaunchParameters
  ): Observable<AuctionSniperApiTypes.AppLaunchResult> {
    const url = `${this.baseUrl}/AppLaunch`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('POST', url, params, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.AppLaunchResult>(url, params, { headers })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  registerDeviceForPushNotifications(
    token: string
  ): Observable<AuctionSniperApiTypes.BaseResult> {
    const url = `${this.baseUrl}/push-notifications-register`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };
    const data = { Token: token };

    logApiRequest('POST', url, data, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.BaseResult>(url, data, { headers })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  unregisterDeviceFromPushNotitifications(
    token: string,
    userApiKey?: string,
    suppressMessages?: boolean
  ): Observable<AuctionSniperApiTypes.BaseResult> {
    const url = `${this.baseUrl}/push-notifications-unregister`;
    const headers: any = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    const data = { Token: token };

    logApiRequest('POST', url, data, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.BaseResult>(url, data, { headers })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  getAccountPreferences(): Observable<AuctionSniperApiTypes.AccountPreferencesResult> {
    const url = `${this.baseUrl}/Preferences`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.AccountPreferencesResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  updateAccountPreferences(
    params: AuctionSniperApiTypes.Preferences
  ): Observable<AuctionSniperApiTypes.AccountPreferencesResult> {
    const url = `${this.baseUrl}/Preferences`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('PUT', url, params, headers);
    return this.nativeHttp
      .put<AuctionSniperApiTypes.AccountPreferencesResult>(url, params, {
        headers,
      })
      .pipe(
        map((response) => {
          logApiResponse('PUT', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('PUT', url, error);
          return throwError(() => error);
        })
      );
  }

  getNotificationPreferences(): Observable<AuctionSniperApiTypes.AccountNotificationPreferencesResult> {
    const url = `${this.baseUrl}/NotificationPreferences`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.AccountNotificationPreferencesResult>(url, {
        headers,
      })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  updateNotificationPreferences(
    params: AuctionSniperApiTypes.NotificationPreferences
  ): Observable<AuctionSniperApiTypes.AccountNotificationPreferencesResult> {
    const url = `${this.baseUrl}/NotificationPreferences`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('PUT', url, params, headers);
    return this.nativeHttp
      .put<AuctionSniperApiTypes.AccountNotificationPreferencesResult>(
        url,
        params,
        { headers }
      )
      .pipe(
        map((response) => {
          logApiResponse('PUT', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('PUT', url, error);
          return throwError(() => error);
        })
      );
  }

  getPaymentInformation(): Observable<AuctionSniperApiTypes.AccountPaymentInformationResult> {
    const url = `${this.baseUrl}/PaymentInformation`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.AccountPaymentInformationResult>(url, {
        headers,
      })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  resendActivationEmail(): Observable<AuctionSniperApiTypes.ResendActivationEmailResult> {
    const url = `${this.baseUrl}/ResendActivationEmail`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('POST', url, null, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.ResendActivationEmailResult>(url, null, {
        headers,
      })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  searchQuery(
    terms: string,
    sort: string,
    page: number,
    id: number,
    country: number,
    locatedIn: boolean,
    blocking: boolean = false
  ): Observable<AuctionSniperApiTypes.SearchQueryResult> {
    const params = {
      AllWords: terms,
      Page: page.toString(),
      Sort: sort,
      Id: id.toString(),
      Country: country.toString(),
      LocatedIn: locatedIn.toString(),
    };

    console.log('API searchQuery called with params:', params);

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    const url = this.getApiUrl('/Search/Query');
    console.log('API searchQuery called with URL:', url);
    logApiRequest('GET', url, null, headers);
    console.log('Making API call to:', url, 'with params:', params);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.SearchQueryResult>(url, { headers, params })
      .pipe(
        map((result: AuctionSniperApiTypes.SearchQueryResult) => {
          console.log('API searchQuery successful, response:', result);
          logApiResponse('GET', url, result);
          console.log('API searchQuery response:', result);
          // Convert EndTimeUtc to local time if needed
          if (result?.items) {
            result.items.forEach((item) => {
              item.EndTime = this.getLocalEndTime(item.EndTimeUtc);
            });
          }
          return result;
        }),
        catchError((error) => {
          console.error('API searchQuery failed, error:', error);
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  private getLocalEndTime(dateString: string): string {
    if (!dateString) {
      return '';
    }

    const datetime = new Date(dateString);
    const offset = datetime.getTimezoneOffset();
    datetime.setMinutes(datetime.getMinutes() - offset);

    return moment.utc(datetime).local().format('MM/DD/YYYY h:mm:ss A');
  }

  public getSavedSearches(): Observable<AuctionSniperApiTypes.ListSavedSearchResults> {
    const url = this.getApiUrl('/Search/List');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.ListSavedSearchResults>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  public retrieveSavedSearch(
    id: string
  ): Observable<AuctionSniperApiTypes.RetrieveSavedSearchResult> {
    const url = this.getApiUrl(`/Search/${id}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.RetrieveSavedSearchResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }
  // You can add more methods here if needed (like app launch, change password, etc.)

  public createSearch(
    search: AuctionSniperApiTypes.SavedSearch
  ): Observable<AuctionSniperApiTypes.RetrieveSavedSearchResult> {
    if (search.Id) {
      return throwError(
        () => new Error('The ID must be empty when creating a search.')
      );
    }

    const url = this.getApiUrl('/V2/Search');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('POST', url, search, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.RetrieveSavedSearchResult>(url, search, {
        headers,
      })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  public saveSearch(
    search: AuctionSniperApiTypes.SavedSearch
  ): Observable<AuctionSniperApiTypes.RetrieveSavedSearchResult> {
    if (!search || !search.Id) {
      return throwError(
        () => new Error('An ID must be populated to save a search.')
      );
    }

    const url = this.getApiUrl(`/Search/${search.Id}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('PUT', url, search, headers);
    return this.nativeHttp
      .put<AuctionSniperApiTypes.RetrieveSavedSearchResult>(url, search, {
        headers,
      })
      .pipe(
        map((response) => {
          logApiResponse('PUT', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('PUT', url, error);
          return throwError(() => error);
        })
      );
  }

  deleteSearch(
    search: AuctionSniperApiTypes.SavedSearch
  ): Observable<AuctionSniperApiTypes.RetrieveSavedSearchResult> {
    if (!search || !search.Id) {
      return throwError(
        () => new Error('An ID must be populated to delete a search.')
      );
    }

    const url = this.getApiUrl(`/Search/${search.Id}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('DELETE', url, search, headers);
    return this.nativeHttp
      .request<AuctionSniperApiTypes.RetrieveSavedSearchResult>('DELETE', url, {
        headers,
        data: search,
      })
      .pipe(
        map((response) => {
          logApiResponse('DELETE', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('DELETE', url, error);
          return throwError(() => error);
        })
      );
  }

  deals(): Observable<AuctionSniperApiTypes.DealsResult> {
    const url = `${this.baseUrl}/Deals`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.DealsResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  getWatchList(
    importWatches: boolean
  ): Observable<AuctionSniperApiTypes.WatchListResult> {
    const url = this.getApiUrl(`/Watch/FullList/${importWatches}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.WatchListResult>(url, { headers })
      .pipe(
        map((result) => {
          logApiResponse('GET', url, result);
          if (result?.watches) {
            result.watches.forEach((watch) => {
              watch.endtime = this.getLocalEndTime(watch.endtimeUtc);
            });
          }
          return result;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  createWatch(
    params: AuctionSniperApiTypes.CreateWatchParameters
  ): Observable<AuctionSniperApiTypes.WatchListResult> {
    const url = this.getApiUrl('/Watch');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('POST', url, params, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.WatchListResult>(url, params, { headers })
      .pipe(
        map((result) => {
          logApiResponse('POST', url, result);
          if (result?.watches) {
            result.watches.forEach((watch) => {
              watch.endtime = this.getLocalEndTime(watch.endtimeUtc);
            });
          }
          return result;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  deleteWatch(watchID: number): Observable<AuctionSniperApiTypes.BaseResult> {
    if (!watchID) {
      return throwError(
        () => new Error('A watch ID must be provided to delete a watch.')
      );
    }

    const url = this.getApiUrl(`/Watch/${watchID}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('DELETE', url, null, headers);
    return this.nativeHttp
      .delete<AuctionSniperApiTypes.BaseResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('DELETE', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('DELETE', url, error);
          return throwError(() => error);
        })
      );
  }

  getItemInfo(
    id: string,
    blocking: boolean = true
  ): Observable<AuctionSniperApiTypes.SearchItemInfoResult> {
    const url = this.getApiUrl('/Search/ItemInfo');
    const params = { Id: id };
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.SearchItemInfoResult>(url, { headers, params })
      .pipe(
        map((result) => {
          logApiResponse('GET', url, result);
          if (result?.item) {
            result.item.EndTime = this.getLocalEndTime(result.item.EndTimeUtc);
          }
          return result;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  getWinList(): Observable<AuctionSniperApiTypes.WinListResult> {
    const url = this.getApiUrl('/Win/List');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.WinListResult>(url, { headers })
      .pipe(
        map((result) => {
          logApiResponse('GET', url, result);
          if (result?.wins) {
            result.wins.forEach((win) => {
              win.EndTime = this.getLocalEndTime(win.EndTimeUtc);
            });
          }
          return result;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  getSnipeList(
    pageNumber: number = 1,
    pageSize: number = 10,
    status: number = 1
  ): Observable<AuctionSniperApiTypes.SnipeListResult> {
    const params = {
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
      Status: status.toString(),
    };
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    const url = this.getApiUrl('/Snipe/List');
    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.SnipeListResult>(url, { headers, params })
      .pipe(
        map((result) => {
          logApiResponse('GET', url, result);
          if (result?.snipes) {
            result.snipes.forEach((snipe) => {
              snipe.EndTime = this.getLocalEndTime(snipe.EndTimeUtc);
            });
          }
          return result;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  getSnipeInfo(id: number): Observable<AuctionSniperApiTypes.SnipeInfoResult> {
    const url = this.getApiUrl(`/Snipe/${id}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.SnipeInfoResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  createSnipe(
    params: AuctionSniperApiTypes.CreateSnipeParameters
  ): Observable<AuctionSniperApiTypes.CreateSnipeResult> {
    const url = this.getApiUrl('/Snipe');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('POST', url, params, headers);
    return this.nativeHttp
      .post<AuctionSniperApiTypes.CreateSnipeResult>(url, params, { headers })
      .pipe(
        map((response) => {
          logApiResponse('POST', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('POST', url, error);
          return throwError(() => error);
        })
      );
  }

  updateSnipe(
    params: AuctionSniperApiTypes.CreateSnipeParameters
  ): Observable<AuctionSniperApiTypes.CreateSnipeResult> {
    const url = this.getApiUrl('/Snipe');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('PUT', url, params, headers);
    return this.nativeHttp
      .put<AuctionSniperApiTypes.CreateSnipeResult>(url, params, { headers })
      .pipe(
        map((response) => {
          logApiResponse('PUT', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('PUT', url, error);
          return throwError(() => error);
        })
      );
  }

  deleteSnipe(snipeID: number): Observable<AuctionSniperApiTypes.BaseResult> {
    if (!snipeID) {
      return throwError(
        () => new Error('Id must be populated to delete a snipe.')
      );
    }
    const url = this.getApiUrl(`/Snipe/${snipeID}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('DELETE', url, null, headers);
    return this.nativeHttp
      .delete<AuctionSniperApiTypes.BaseResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('DELETE', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('DELETE', url, error);
          return throwError(() => error);
        })
      );
  }

  getCountryList(): Observable<KeyValuePair<number, string>[]> {
    const url = this.getApiUrl('/DataList/Countries');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<KeyValuePair<number, string>[]>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          return throwError(() => error);
        })
      );
  }

  public genericGet<T = any>(formedURL: string): Observable<T> {
    if (!formedURL) {
      return throwError(() => new Error('FormedURL is required.'));
    }

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', formedURL, null, headers);
    return this.nativeHttp.get<T>(formedURL, { headers }).pipe(
      map((response) => {
        logApiResponse('GET', formedURL, response);
        return response;
      }),
      catchError((error) => {
        logApiError('GET', formedURL, error);
        // Extract and log the error message
        const errorMessage = this.messageExtractor.extractErrorMessage(error);
        console.error('API Error Details:', errorMessage);
        return throwError(() => error);
      })
    );
  }

  public getConfig(): Observable<AuctionSniperApiTypes.ConfigResult> {
    const osType = this.isAndroid() ? 'Android' : 'iOS';
    const url = this.getApiUrl(`/Config/${osType}`);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Key: this.getApiKey(),
    };

    logApiRequest('GET', url, null, headers);
    return this.nativeHttp
      .get<AuctionSniperApiTypes.ConfigResult>(url, { headers })
      .pipe(
        map((response) => {
          logApiResponse('GET', url, response);
          return response;
        }),
        catchError((error) => {
          logApiError('GET', url, error);
          // Extract and log the error message
          const errorMessage = this.messageExtractor.extractErrorMessage(error);
          console.error('API Error Details:', errorMessage);
          return throwError(() => error);
        })
      );
  }

  private isAndroid(): boolean {
    return /android/i.test(navigator.userAgent); // or use Capacitor/Platform plugin if needed
  }
}
