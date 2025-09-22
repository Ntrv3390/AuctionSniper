import { HttpRequest } from '@angular/common/http';

/**
 * Extended request configuration used for HTTP requests.
 * This can be integrated with Angular's HttpClient if needed,
 * though the original was based on AngularJS's IRequestConfig.
 */
export interface RequestConfig {
  __isRequestConfig?: boolean;
  blocking?: boolean;
  blockingText?: string;
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  suppressErrors?: boolean;
  suppressMessages?: boolean;
  isRetry?: boolean;
  retryCount?: number;
  isExternalLogRequest?: boolean;
}
