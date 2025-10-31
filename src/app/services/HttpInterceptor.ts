import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor as NgHttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Utilities } from 'src/app/services/Utilities';
import { UIService } from 'src/app/services/UI';
import { PreferencesService } from 'src/app/services/Preferences';
import { ConfigurationService } from 'src/app/services/Configuration';
import { Logger } from 'src/app/services/Logger';
import { AppEvents } from 'src/app/constants/constants';
import { Platform } from '@ionic/angular';
import { ApiMessageExtractorService } from 'src/app/services/ApiMessageExtractor';

@Injectable()
export class HttpInterceptor implements NgHttpInterceptor {
  private blockingRequestsInProgress = 0;
  public static ID = "HttpInterceptor";

  constructor(
    private utilities: Utilities,
    private ui: UIService,
    private preferences: PreferencesService,
    private configuration: ConfigurationService,
    private logger: Logger,
    private platform: Platform,
    private messageExtractor: ApiMessageExtractorService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let config = { ...req, __isRequestConfig: true, isRetry: false, retryCount: 2, blocking: true } as any;

    // Skip .html or external logs
    if (this.utilities.endsWith(config.url, '.html') || config.isExternalLogRequest) {
      return next.handle(req);
    }

    // Handle direct HTTPS URLs - skip interceptor processing for direct HTTPS URLs
    const isDirectHttpsUrl = config.url.startsWith('https://main.auctionsniper.com');

    // Add Key header to all requests if we have a token
    let headers = req.headers;
    
    // Always add the Key header for all requests if we have a token
    if (this.preferences.token) {
      headers = headers.set('Key', this.preferences.token);
    }
    
    // Also add standard headers
    headers = headers.set('Content-Type', 'application/json')
                     .set('Accept', 'application/json');

    // Handle ~ URLs (for web development)
    if (this.utilities.startsWith(config.url, '~')) {
      if (this.configuration.apiUrl) {
        let baseUrl = this.configuration.apiUrl;
        config.url = config.url.substring(1);

        if (this.utilities.endsWith(baseUrl, '/') && this.utilities.startsWith(config.url, '/')) {
          config.url = config.url.substr(1);
        }
        if (!this.utilities.endsWith(baseUrl, '/') && !this.utilities.startsWith(config.url, '/')) {
          config.url = '/' + config.url;
        }
        config.url = baseUrl + config.url;
      } else {
        throw new Error('An HTTP call cannot be made because a Configuration.apiUrl was not specified.');
      }
    }
    // For direct URLs in Capacitor, we keep the URL as is but add headers
    else if (isDirectHttpsUrl) {
      // Keep the URL as is for direct HTTPS URLs
    }

    req = req.clone({ url: config.url, headers });

    this.handleRequestStart(config);

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.logger.debug(HttpInterceptor.name, 'response', 'A response was received.', event);
          this.handleResponseEnd(config);
          this.ensureMessageIsPopulated(event.body);

          if (event.body?.success === false && event.body?.authorized === false) {
            // equivalent to $rootScope.$broadcast
            document.dispatchEvent(new CustomEvent(AppEvents.HTTP_API_UNAUTHORIZED, { detail: event }));
          }

          if (event.body?.message &&
              typeof event.body.message.Level === 'number' &&
              typeof event.body.message.MessageContent === 'string') {
            document.dispatchEvent(new CustomEvent(AppEvents.HTTP_API_MESSAGE_RECEIVED, { detail: { event, message: event.body.message } }));
          }
        }
        return event;
      }),
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          // Retry logic for status 0 or -1
          if ((error.status === 0 || error.status === -1) && config.retryCount > 0) {
            config.isRetry = true;
            config.retryCount--;
            this.logger.debug(HttpInterceptor.name, 'responseError', `Retrying request due to status ${error.status}`, config);
            return timer(2000).pipe(switchMap(() => next.handle(req)));
          }

          if (this.utilities.endsWith(config.url, '.html')) {
            return throwError(() => error);
          }

          this.logger.debug(HttpInterceptor.name, 'responseError', 'A non-200 level status code was received.', error);
          this.handleResponseEnd(config);

          // Extract error message and show it to user
          const errorMessage = this.messageExtractor.extractErrorMessage(error);
          this.ui.showErrorSnackbar(errorMessage.message, errorMessage.title);

          document.dispatchEvent(new CustomEvent(AppEvents.HTTP_ERROR, { detail: error }));
        } else if (error instanceof Error) {
          this.logger.error(HttpInterceptor.name, 'responseError', 'An uncaught exception occurred.', error);
          this.handleFatalError();
        }

        return throwError(() => error);
      })
    );
  }

  private handleRequestStart(config: any) {
    if (config.isRetry) return;
    if (typeof config.blocking === 'undefined') {
      config.blocking = true;
    }
    if (config.blocking) {
      this.blockingRequestsInProgress++;
      if (this.blockingRequestsInProgress > 1) {
        this.ui.activityStop();
      }
      this.ui.activityStart(config.blockingText || null);
    }
  }

  private handleResponseEnd(config: any) {
    if (config.blocking) {
      this.blockingRequestsInProgress--;
    }
    if (config.blocking && this.blockingRequestsInProgress === 0) {
      this.ui.activityStop();
    }
  }

  private handleFatalError() {
    this.blockingRequestsInProgress = 0;
    this.ui.activityStop();
  }

  private ensureMessageIsPopulated(data: any): void {
    if (!data) return;
    if (!data.message) {
      data.message = { Level: -1, MessageContent: '' };
    }
    if (data.message.Level == null) {
      data.message.Level = 0;
    }
    if (!data.message.MessageContent) {
      data.message.MessageContent = '';
    }
    if (data.message.MessageContent.indexOf('<') >= 0) {
      data.message.MessageContent = this.utilities.stripHtml(data.message.MessageContent);
    }
  }
}
