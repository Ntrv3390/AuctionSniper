# API Error Handling Documentation

This document explains how API error handling works in the Auction Sniper application.

## Overview

The application has a comprehensive error handling system that:

1. Extracts error messages from API responses
2. Displays appropriate error messages to users
3. Handles different types of errors (HTTP errors, network errors, API result errors)
4. Provides consistent error messaging across the application

## Key Components

### 1. ApiMessageExtractorService

This service is responsible for extracting error messages from various API response formats:

- HttpErrorResponse objects
- Plain error objects
- API result objects with success/error structure

It handles common message field names like:
- `MessageContent` (API-specific)
- `message` (standard)
- `error` (common)
- `errorMessage` (common)
- `msg` (short form)
- `description` (descriptive)

### 2. HttpInterceptor

The HTTP interceptor intercepts all HTTP requests and responses:

- Adds authentication headers
- Handles retry logic for network errors
- Extracts and displays error messages for failed requests
- Shows error snackbars using the UIService

### 3. ApiErrorHandlerService

This service provides a unified interface for handling errors throughout the application:

- `handleError()`: Handles HTTP errors and shows appropriate messages
- `handleApiResult()`: Handles API results that contain success/error information
- `showDetailedErrorAlert()`: Shows detailed error information in a dialog
- `handleSuccess()`: Shows success messages

## Usage Examples

### Handling HTTP Errors

```typescript
this.apiService.getData().subscribe({
  next: (result) => {
    // Handle successful response
  },
  error: (error) => {
    // The interceptor will automatically show the error message
    // But you can also handle it manually:
    this.errorHandler.handleError(error, 'Data Retrieval');
  }
});
```

### Handling API Result Errors

```typescript
this.apiService.updateData(params).subscribe({
  next: (result) => {
    // ApiErrorHandler will automatically show success/error messages
    this.errorHandler.handleApiResult(result, 'Update');
  },
  error: (error) => {
    this.errorHandler.handleError(error, 'Update');
  }
});
```

## Error Message Display

Errors are displayed using the UIService which shows:

1. **Snackbar notifications** for most errors (bottom of screen)
2. **Alert dialogs** for critical errors or when requested
3. **Detailed error dialogs** for debugging information

## Customization

To customize error handling for specific APIs:

1. Modify the `ApiMessageExtractorService` to handle new message formats
2. Update the `HttpInterceptor` for special handling of specific endpoints
3. Override error handling in components when needed

## Testing

Use the `ApiErrorTestService` to create simulated errors for testing:

```typescript
const error = this.errorTestService.createHttpError(404, 'Not Found');
this.errorHandler.handleError(error, 'Test');
```

## Best Practices

1. Always use the `ApiErrorHandlerService` for consistent error handling
2. Provide context to error handlers (e.g., 'Login', 'Registration')
3. Test error scenarios to ensure messages are displayed correctly
4. Log errors appropriately for debugging