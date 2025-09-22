import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorTestService {
  
  /**
   * Creates a simulated HTTP error response for testing
   * @param status HTTP status code
   * @param message Error message
   * @returns HttpErrorResponse object
   */
  createHttpError(status: number, message: string): HttpErrorResponse {
    return new HttpErrorResponse({
      status: status,
      statusText: 'Test Error',
      error: {
        message: message,
        MessageContent: message
      }
    });
  }
  
  /**
   * Creates a simulated API result with error
   * @param message Error message
   * @returns API result object with error
   */
  createApiErrorResult(message: string): any {
    return {
      success: false,
      message: {
        MessageContent: message,
        Level: 2 // Error level
      }
    };
  }
  
  /**
   * Creates a simulated API result with success message
   * @param message Success message
   * @returns API result object with success
   */
  createApiSuccessResult(message: string): any {
    return {
      success: true,
      message: {
        MessageContent: message,
        Level: 0 // Info level
      }
    };
  }
  
  /**
   * Simulates an API call that throws an error
   * @param error The error to throw
   * @returns Observable that throws the error
   */
  simulateApiError(error: any) {
    return throwError(() => error);
  }
}