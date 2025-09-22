import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse as AngularHttpResponse } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';

// Utility function for HTTP logging
const logHttpRequest = (method: string, url: string, data?: any, headers?: any, params?: any) => {
  console.log(`HTTP Request - ${method}: ${url}`, JSON.stringify({ 
    url, 
    method, 
    data, 
    headers,
    params
  }, null, 2));
};

const logHttpResponse = (method: string, url: string, response: any) => {
  console.log(`HTTP Response - ${method}: ${url}`, JSON.stringify({ 
    url, 
    method, 
    response 
  }, null, 2));
};

const logHttpError = (method: string, url: string, error: any) => {
  console.error(`HTTP Error - ${method}: ${url}`, JSON.stringify({ 
    url, 
    method, 
    error 
  }, null, 2));
};

@Injectable({
  providedIn: 'root'
})
export class NativeHttpService {
  constructor(
    private http: HttpClient,
    private platform: Platform
  ) { }

  /**
   * Makes a GET request using native HTTP for Capacitor or Angular HttpClient for web
   */
  get<T>(url: string, options?: { headers?: any; params?: any }): Observable<T> {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      return this.nativeGet<T>(url, options);
    } else {
      return this.webGet<T>(url, options);
    }
  }

  /**
   * Makes a POST request using native HTTP for Capacitor or Angular HttpClient for web
   */
  post<T>(url: string, data?: any, options?: { headers?: any }): Observable<T> {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      return this.nativePost<T>(url, data, options);
    } else {
      return this.webPost<T>(url, data, options);
    }
  }

  /**
   * Makes a PUT request using native HTTP for Capacitor or Angular HttpClient for web
   */
  put<T>(url: string, data?: any, options?: { headers?: any }): Observable<T> {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      return this.nativePut<T>(url, data, options);
    } else {
      return this.webPut<T>(url, data, options);
    }
  }

  /**
   * Makes a DELETE request using native HTTP for Capacitor or Angular HttpClient for web
   */
  delete<T>(url: string, options?: { headers?: any }): Observable<T> {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      return this.nativeDelete<T>(url, options);
    } else {
      return this.webDelete<T>(url, options);
    }
  }

  /**
   * Makes a generic request using native HTTP for Capacitor or Angular HttpClient for web
   */
  request<T>(method: string, url: string, options?: { headers?: any; data?: any; params?: any }): Observable<T> {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      return this.nativeRequest<T>(method, url, options);
    } else {
      return this.webRequest<T>(method, url, options);
    }
  }

  // Native HTTP methods using @capacitor-community/http
  private nativeGet<T>(url: string, options?: { headers?: any; params?: any }): Observable<T> {
    const httpOptions: HttpOptions = {
      url,
      headers: this.formatHeaders(options?.headers)
    };

    // Only add params if they exist and are not null/undefined
    if (options?.params && Object.keys(options.params).length > 0) {
      httpOptions.params = options.params;
    }

    logHttpRequest('GET', url, null, options?.headers, options?.params);
    return from(CapacitorHttp.get(httpOptions)).pipe(
      map((response: HttpResponse) => {
        logHttpResponse('GET', url, response);
        return this.handleNativeResponse<T>(response);
      }),
      catchError(error => {
        logHttpError('GET', url, error);
        return throwError(() => this.formatNativeError(error));
      })
    );
  }

  private nativePost<T>(url: string, data?: any, options?: { headers?: any }): Observable<T> {
    const httpOptions: HttpOptions = {
      url,
      headers: this.formatHeaders(options?.headers)
    };

    // Only add data if it exists and is not null/undefined
    if (data !== null && data !== undefined) {
      httpOptions.data = data;
    }

    logHttpRequest('POST', url, data, options?.headers);
    return from(CapacitorHttp.post(httpOptions)).pipe(
      map((response: HttpResponse) => {
        logHttpResponse('POST', url, response);
        return this.handleNativeResponse<T>(response);
      }),
      catchError(error => {
        logHttpError('POST', url, error);
        return throwError(() => this.formatNativeError(error));
      })
    );
  }

  private nativePut<T>(url: string, data?: any, options?: { headers?: any }): Observable<T> {
    const httpOptions: HttpOptions = {
      url,
      headers: this.formatHeaders(options?.headers)
    };

    // Only add data if it exists and is not null/undefined
    if (data !== null && data !== undefined) {
      httpOptions.data = data;
    }

    logHttpRequest('PUT', url, data, options?.headers);
    return from(CapacitorHttp.put(httpOptions)).pipe(
      map((response: HttpResponse) => {
        logHttpResponse('PUT', url, response);
        return this.handleNativeResponse<T>(response);
      }),
      catchError(error => {
        logHttpError('PUT', url, error);
        return throwError(() => this.formatNativeError(error));
      })
    );
  }

  private nativeDelete<T>(url: string, options?: { headers?: any }): Observable<T> {
    const httpOptions: HttpOptions = {
      url,
      headers: this.formatHeaders(options?.headers)
    };

    logHttpRequest('DELETE', url, null, options?.headers);
    return from(CapacitorHttp.delete(httpOptions)).pipe(
      map((response: HttpResponse) => {
        logHttpResponse('DELETE', url, response);
        return this.handleNativeResponse<T>(response);
      }),
      catchError(error => {
        logHttpError('DELETE', url, error);
        return throwError(() => this.formatNativeError(error));
      })
    );
  }

  private nativeRequest<T>(method: string, url: string, options?: { headers?: any; data?: any; params?: any }): Observable<T> {
    const httpOptions: HttpOptions = {
      url,
      method: method.toUpperCase() as any,
      headers: this.formatHeaders(options?.headers)
    };

    // Only add data if it exists and is not null/undefined
    if (options?.data !== null && options?.data !== undefined) {
      httpOptions.data = options.data;
    }

    // Only add params if they exist and are not null/undefined
    if (options?.params && Object.keys(options.params).length > 0) {
      httpOptions.params = options.params;
    }

    logHttpRequest(method, url, options?.data, options?.headers, options?.params);
    return from(CapacitorHttp.request(httpOptions)).pipe(
      map((response: HttpResponse) => {
        logHttpResponse(method, url, response);
        return this.handleNativeResponse<T>(response);
      }),
      catchError(error => {
        logHttpError(method, url, error);
        return throwError(() => this.formatNativeError(error));
      })
    );
  }

  // Web HTTP methods using Angular HttpClient
  private webGet<T>(url: string, options?: { headers?: any; params?: any }): Observable<T> {
    const httpOptions = this.formatWebOptions(options);
    logHttpRequest('GET', url, null, options?.headers, options?.params);
    return this.http.get<T>(url, httpOptions).pipe(
      map((response: any) => {
        logHttpResponse('GET', url, response);
        return response as T;
      }),
      catchError(error => {
        logHttpError('GET', url, error);
        return throwError(() => error);
      })
    );
  }

  private webPost<T>(url: string, data?: any, options?: { headers?: any }): Observable<T> {
    const httpOptions = this.formatWebOptions(options);
    logHttpRequest('POST', url, data, options?.headers);
    return this.http.post<T>(url, data, httpOptions).pipe(
      map((response: any) => {
        logHttpResponse('POST', url, response);
        return response as T;
      }),
      catchError(error => {
        logHttpError('POST', url, error);
        return throwError(() => error);
      })
    );
  }

  private webPut<T>(url: string, data?: any, options?: { headers?: any }): Observable<T> {
    const httpOptions = this.formatWebOptions(options);
    logHttpRequest('PUT', url, data, options?.headers);
    return this.http.put<T>(url, data, httpOptions).pipe(
      map((response: any) => {
        logHttpResponse('PUT', url, response);
        return response as T;
      }),
      catchError(error => {
        logHttpError('PUT', url, error);
        return throwError(() => error);
      })
    );
  }

  private webDelete<T>(url: string, options?: { headers?: any }): Observable<T> {
    const httpOptions = this.formatWebOptions(options);
    logHttpRequest('DELETE', url, null, options?.headers);
    return this.http.delete<T>(url, httpOptions).pipe(
      map((response: any) => {
        logHttpResponse('DELETE', url, response);
        return response as T;
      }),
      catchError(error => {
        logHttpError('DELETE', url, error);
        return throwError(() => error);
      })
    );
  }

  private webRequest<T>(method: string, url: string, options?: { headers?: any; data?: any; params?: any }): Observable<T> {
    const httpOptions = this.formatWebOptions(options);
    logHttpRequest(method, url, options?.data, options?.headers, options?.params);
    return this.http.request<T>(method, url, { ...httpOptions, body: options?.data }).pipe(
      map((response: any) => {
        logHttpResponse(method, url, response);
        return response as T;
      }),
      catchError(error => {
        logHttpError(method, url, error);
        return throwError(() => error);
      })
    );
  }

  // Helper methods
  private formatHeaders(headers?: any): Record<string, string> {
    if (!headers) {
      return {};
    }

    if (headers instanceof HttpHeaders) {
      const result: Record<string, string> = {};
      headers.keys().forEach(key => {
        const value = headers.get(key);
        if (value !== null && value !== undefined) {
          result[key] = value;
        }
      });
      return result;
    }

    // Ensure all header values are strings and not null/undefined
    const result: Record<string, string> = {};
    Object.keys(headers).forEach(key => {
      const value = headers[key];
      if (value !== null && value !== undefined) {
        result[key] = String(value);
      }
    });

    return result;
  }

  private formatWebOptions(options?: { headers?: any; params?: any }): any {
    const result: any = {};

    if (options?.headers) {
      if (options.headers instanceof HttpHeaders) {
        result.headers = options.headers;
      } else {
        result.headers = new HttpHeaders(options.headers);
      }
    }

    if (options?.params) {
      result.params = options.params;
    }

    return result;
  }

  private handleNativeResponse<T>(response: HttpResponse): T {
    if (response.status >= 200 && response.status < 300) {
      return response.data as T;
    } else {
      throw {
        status: response.status,
        statusText: response.headers?.['status-text'] || 'Unknown Error',
        error: response.data,
        url: response.url
      };
    }
  }

  private formatNativeError(error: any): any {
    return {
      status: error.status || 0,
      statusText: error.message || 'Network Error',
      error: error,
      url: error.url || 'Unknown URL'
    };
  }
}
