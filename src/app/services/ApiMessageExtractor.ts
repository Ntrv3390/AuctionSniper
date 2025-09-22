import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorMessage {
  message: string;
  title: string;
  code?: number;
  isRetryable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiMessageExtractorService {
  
  /**
   * Extracts error message from various API response formats
   * @param error The error object (HttpErrorResponse or plain object)
   * @returns Formatted error message object
   */
  extractErrorMessage(error: any): ApiErrorMessage {
    let message = 'An unexpected error occurred. Please try again.';
    let title = 'Error';
    let code: number | undefined;
    let isRetryable = true;
    
    // Handle HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      code = error.status;
      
      // Try to extract message from error.error (response body)
      if (error.error) {
        // If error.error is a string, use it directly
        if (typeof error.error === 'string') {
          message = error.error;
        } 
        // If error.error is an object, look for message properties
        else if (typeof error.error === 'object') {
          // Try common message field names
          message = this.extractMessageFromObject(error.error) || message;
        }
      }
      
      // If no message found in error.error, use statusText
      if (message === 'An unexpected error occurred. Please try again.' && error.statusText) {
        message = error.statusText;
      }
      
      // Set appropriate title and retryability based on status code
      switch (error.status) {
        case 0:
          title = 'Connection Error';
          message = 'Unable to connect to the server. Please check your internet connection and try again.';
          break;
        case 400:
          title = 'Invalid Request';
          isRetryable = false;
          break;
        case 401:
          title = 'Authentication Error';
          isRetryable = false;
          break;
        case 403:
          title = 'Permission Denied';
          isRetryable = false;
          break;
        case 404:
          title = 'Not Found';
          break;
        case 409:
          title = 'Conflict';
          isRetryable = false;
          break;
        case 422:
          title = 'Validation Error';
          isRetryable = false;
          break;
        case 429:
          title = 'Rate Limited';
          break;
        case 500:
          title = 'Server Error';
          break;
        case 502:
        case 503:
        case 504:
          title = 'Service Unavailable';
          break;
        default:
          if (error.status >= 400 && error.status < 500) {
            isRetryable = false;
          }
          break;
      }
    } 
    // Handle plain error objects
    else if (error && typeof error === 'object') {
      // Try to extract message from the error object
      message = this.extractMessageFromObject(error) || message;
      
      // Check for status code in error object
      if (error.status) {
        code = error.status;
      }
      
      // Check for title in error object
      if (error.title) {
        title = error.title;
      } else if (error.name) {
        title = error.name;
      }
    } 
    // Handle string errors
    else if (typeof error === 'string') {
      message = error;
    }
    
    return {
      message,
      title,
      code,
      isRetryable
    };
  }
  
  /**
   * Extracts message from an object by looking for common message fields
   * @param obj The object to extract message from
   * @returns The extracted message or null if not found
   */
  private extractMessageFromObject(obj: any): string | null {
    if (!obj || typeof obj !== 'object') {
      return null;
    }
    
    // Common message field names in order of preference
    const messageFields = [
      'MessageContent',  // API-specific field
      'messageContent',  // API-specific field (lowercase)
      'Message',         // Standard error message field
      'message',         // Standard error message field (lowercase)
      'error',           // Common error field
      'errorMessage',    // Common error message field
      'msg',             // Short message field
      'description'      // Description field
    ];
    
    // Look for message in the object
    for (const field of messageFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        return obj[field];
      }
    }
    
    // Look for nested message object
    if (obj.message && typeof obj.message === 'object') {
      return this.extractMessageFromObject(obj.message);
    }
    
    // Look for API response structure (success/message pattern)
    if (obj.message && typeof obj.message === 'object' && obj.message.MessageContent) {
      return obj.message.MessageContent;
    }
    
    // If we have a JSON string, try to parse it
    if (obj.error && typeof obj.error === 'string' && obj.error.startsWith('{')) {
      try {
        const parsed = JSON.parse(obj.error);
        return this.extractMessageFromObject(parsed);
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    return null;
  }
  
  /**
   * Extracts success message from API response
   * @param response The API response object
   * @returns The success message or null if not found
   */
  extractSuccessMessage(response: any): string | null {
    if (!response || typeof response !== 'object') {
      return null;
    }
    
    // If response has a success message structure
    if (response.success && response.message && typeof response.message === 'object') {
      if (response.message.MessageContent) {
        return response.message.MessageContent;
      }
    }
    
    // Try to extract from common message fields
    return this.extractMessageFromObject(response);
  }
}