import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UIService } from './UI';
import { DialogOptions } from '../Framework/DialogOptions';
import { ApiMessageExtractorService } from './ApiMessageExtractor';


export interface ApiErrorInfo {
  message: string;
  title: string;
  code?: number;
  isRetryable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHandlerService {
  
  constructor(
    private ui: UIService,
    private messageExtractor: ApiMessageExtractorService
  ) {}

  /**
   * Handles API errors and shows appropriate snackbars, alerts, or dialogs
   * @param error The HTTP error response
   * @param context Optional context for the error (e.g., 'Login', 'Registration')
   * @param showSnackbar Whether to show a snackbar (default: true)
   * @param useAlert Whether to show an alert instead of snackbar (default: false)
   * @param useDialog Whether to show a dialog instead of snackbar/alert (default: false)
   * @returns Error information object
   */
  handleError(error: any, context?: string, showSnackbar: boolean = true, useAlert: boolean = false, useDialog: boolean = false): ApiErrorInfo {
    // Enhanced console logging
    console.group(`⚠️ API Error${context ? ` (${context})` : ''}`);
    console.error('Error Object:', error);
    console.error('Stringified:', this.stringifyErrorObject(error));
    console.groupEnd();

    const errorInfo = this.messageExtractor.extractErrorMessage(error);

    // Add context to title if provided
    if (context) {
      errorInfo.title = `${context} ${errorInfo.title}`;
    }

    if (useDialog) {
      this.showErrorDialog(error, errorInfo, context);
    } else if (showSnackbar && !useAlert) {
      this.ui.showErrorSnackbar(errorInfo.message, errorInfo.title);
    } else if (useAlert) {
      this.ui.alert(errorInfo.message, errorInfo.title);
    }

    return errorInfo;
  }

  /**
   * Handles successful API responses that contain error information
   * @param result The API result object
   * @param context Optional context for the error
   * @param showSnackbar Whether to show a snackbar (default: true)
   * @param useAlert Whether to show an alert instead of snackbar (default: false)
   * @param useDialog Whether to show a dialog instead of snackbar/alert (default: false)
   * @returns Error information object or null if no error
   */
  handleApiResult(result: any, context?: string, showSnackbar: boolean = true, useAlert: boolean = false, useDialog: boolean = false): ApiErrorInfo | null {
    if (result.success) {
      // Handle success messages if any
      const successMessage = this.messageExtractor.extractSuccessMessage(result);
      if (successMessage) {
        this.handleSuccess(successMessage, context);
      }
      return null; // No error
    }

    // Enhanced console logging for API result errors
    console.group(`📋 API Result Error${context ? ` (${context})` : ''}`);
    console.error('API Result:', result);
    console.error('Stringified Result:', this.stringifyErrorObject(result));
    console.groupEnd();

    // Extract error message from result
    let errorMessage = 'Operation failed. Please try again.';
    let errorTitle = context ? `${context} Failed` : 'Operation Failed';
    
    // Try to extract message from the result structure
    if (result.message) {
      if (typeof result.message === 'string') {
        errorMessage = result.message;
      } else if (result.message.MessageContent) {
        errorMessage = result.message.MessageContent;
      } else if (result.message.message) {
        errorMessage = result.message.message;
      }
    }
    
    // If we still don't have a good message, try to get it from the error field
    if (errorMessage === 'Operation failed. Please try again.' && result.error) {
      if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (result.error.message) {
        errorMessage = result.error.message;
      }
    }

    const errorInfo: ApiErrorInfo = {
      message: errorMessage,
      title: errorTitle,
      isRetryable: true
    };

    if (useDialog) {
      this.showErrorDialog(result, errorInfo, context);
    } else if (showSnackbar && !useAlert) {
      this.ui.showErrorSnackbar(errorInfo.message, errorInfo.title);
    } else if (useAlert) {
      this.ui.alert(errorInfo.message, errorInfo.title);
    }

    return errorInfo;
  }

  /**
   * Shows a detailed alert for API result failures
   * @param result The API result object
   * @param context Optional context for the error
   * @returns Error information object or null if no error
   */
  showDetailedApiResultAlert(result: any, context?: string): ApiErrorInfo | null {
    if (result.success) {
      return null; // No error
    }

    // Enhanced console logging for API result errors
    console.group(`📋 Detailed API Result Error${context ? ` (${context})` : ''}`);
    console.error('API Result:', result);
    console.error('Stringified Result:', this.stringifyErrorObject(result));
    console.groupEnd();

    // Extract error message from result
    let errorMessage = 'Operation failed. Please try again.';
    let errorTitle = context ? `${context} Failed` : 'Operation Failed';
    
    // Try to extract message from the result structure
    if (result.message) {
      if (typeof result.message === 'string') {
        errorMessage = result.message;
      } else if (result.message.MessageContent) {
        errorMessage = result.message.MessageContent;
      } else if (result.message.message) {
        errorMessage = result.message.message;
      }
    }

    let detailedMessage = errorMessage;

    // Add technical details about the API response
    detailedMessage += `\n\nAPI Response Details:`;
    detailedMessage += `\n• Success: ${result.success}`;

    if (result.authorized !== undefined) {
      detailedMessage += `\n• Authorized: ${result.authorized}`;
    }

    if (result.message) {
      detailedMessage += `\n• Message Level: ${result.message.Level || 'Unknown'}`;
      if (result.message.MessageContent) {
        detailedMessage += `\n• Message Content: ${result.message.MessageContent}`;
      }
    }

    if (result.user) {
      detailedMessage += `\n• User Data: ${this.stringifyErrorObject(result.user)}`;
    }

    // Add any other properties from the result
    const otherProps = Object.keys(result).filter(key =>
      !['success', 'authorized', 'message', 'user'].includes(key)
    );

    if (otherProps.length > 0) {
      detailedMessage += `\n• Other Properties: ${otherProps.join(', ')}`;
      otherProps.forEach(prop => {
        if (result[prop] !== null && result[prop] !== undefined) {
          detailedMessage += `\n  - ${prop}: ${this.stringifyErrorObject(result[prop])}`;
        }
      });
    }

    detailedMessage += `\n• Time: ${new Date().toLocaleString()}`;

    const errorInfo: ApiErrorInfo = {
      message: detailedMessage,
      title: errorTitle,
      isRetryable: true
    };

    this.ui.alert(errorInfo.message, errorInfo.title);

    return errorInfo;
  }

  /**
   * Shows a comprehensive error alert with detailed information
   * @param error The error object
   * @param context Optional context for the error
   * @returns Error information object
   */
  showDetailedErrorAlert(error: any, context?: string): ApiErrorInfo {
    // Enhanced console logging
    console.group(`🚨 Detailed API Error${context ? ` (${context})` : ''}`);
    console.error('Error Object:', error);

    const errorInfo = this.messageExtractor.extractErrorMessage(error);
    
    // Add context to title if provided
    if (context) {
      errorInfo.title = `${context} ${errorInfo.title}`;
    }

    let detailedMessage = errorInfo.message;

    // Add additional technical details for debugging
    if (error instanceof HttpErrorResponse) {
      console.error('HTTP Status:', error.status);
      console.error('Status Text:', error.statusText);
      console.error('URL:', error.url);
      console.error('Headers:', error.headers);
      console.error('Error Body:', error.error);
      
      detailedMessage += `\n\nTechnical Details:`;
      detailedMessage += `\n• Status Code: ${error.status}`;
      detailedMessage += `\n• Status Text: ${error.statusText || 'Unknown'}`;

      if (error.url) {
        detailedMessage += `\n• URL: ${error.url}`;
      }

      // Add response body details if available
      if (error.error) {
        detailedMessage += `\n• Server Response: ${this.stringifyErrorObject(error.error)}`;
      }

      // Add request headers if available
      if (error.headers) {
        const headerKeys = error.headers.keys();
        if (headerKeys.length > 0) {
          detailedMessage += `\n• Request Headers: ${headerKeys.join(', ')}`;
        }
      }

      // Add timestamp
      detailedMessage += `\n• Time: ${new Date().toLocaleString()}`;

      // Add retry suggestion if applicable
      if (errorInfo.isRetryable) {
        detailedMessage += `\n\n💡 This error may be temporary. Please try again.`;
      }
    } else if (error.message) {
      detailedMessage += `\n\nError Details: ${error.message}`;
      detailedMessage += `\n• Time: ${new Date().toLocaleString()}`;
    } else {
      // Handle any other error types
      detailedMessage += `\n\nError Object: ${this.stringifyErrorObject(error)}`;
      detailedMessage += `\n• Time: ${new Date().toLocaleString()}`;
    }

    console.error('Stringified Error:', this.stringifyErrorObject(error));
    console.groupEnd();

    // Show error dialog with detailed information
    this.showErrorDialog(error, {...errorInfo, message: detailedMessage}, context);

    return {...errorInfo, message: detailedMessage};
  }

  /**
   * Shows a success snackbar for successful operations
   * @param message Success message
   * @param context Optional context for the success
   */
  handleSuccess(message: string, context?: string, duration=5000): void {
    const title = context ? `${context} Successful` : 'Success';
    this.ui.showSuccessSnackbar(message, title, duration);
  }

  /**
   * Shows a loading indicator with context
   * @param context The operation context (e.g., 'Signing in', 'Creating account')
   */
  showLoading(context: string): void {
    this.ui.activityStart(context + '...');
  }

  /**
   * Hides the loading indicator
   */
  hideLoading(): void {
    this.ui.activityStop();
  }

  /**
   * Shows a custom error dialog with retry option
   * @param error The HTTP error response
   * @param errorInfo The processed error information
   * @param context Optional context for the error
   */
  async showErrorDialog(error: any, errorInfo: ApiErrorInfo, context?: string): Promise<void> {
    try {
      const errorDetails = this.stringifyErrorObject(error);
      
      const dialogData = {
        title: errorInfo.title,
        message: errorInfo.message,
        errorDetails: errorDetails,
        isRetryable: errorInfo.isRetryable
      };

      const options = new DialogOptions(dialogData);
      
      // Show the error dialog
      const result = await this.ui.showDialog('ErrorDialogController', options);
      
      // Handle retry action if implemented in your application
      if (result?.action === 'retry' && errorInfo.isRetryable) {
        // You can implement retry logic here or emit an event for the calling component to handle
        console.log('Retry action requested for error:', error);
      }
    } catch (dialogError) {
      // Fallback to alert if dialog fails
      console.error('Failed to show error dialog, falling back to alert:', dialogError);
      try {
        this.ui.alert(errorInfo.message, errorInfo.title);
      } catch (alertError) {
        console.error('Failed to show alert, falling back to console:', alertError);
        // Final fallback to console
        console.error(`${errorInfo.title}: ${errorInfo.message}`);
      }
    }
  }

  /**
   * Properly stringify error objects for display
   * @param obj The object to stringify
   * @returns Formatted string representation
   */
  private stringifyErrorObject(obj: any): string {
    if (obj === null || obj === undefined) {
      return 'null';
    }

    if (typeof obj === 'string') {
      return obj;
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }

    try {
      // Handle circular references and format nicely
      const seen = new WeakSet();
      const replacer = (key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }
        return value;
      };

      const jsonString = JSON.stringify(obj, replacer, 2);

      // If it's a simple object, format it more readably
      if (jsonString.length < 200) {
        return jsonString.replace(/[{}]/g, '').replace(/\"/g, '').replace(/,\s*/g, ', ').trim();
      }

      return jsonString;
    } catch (error) {
      // Fallback for objects that can't be stringified
      try {
        return Object.prototype.toString.call(obj);
      } catch {
        return '[Unable to stringify object]';
      }
    }
  }
}