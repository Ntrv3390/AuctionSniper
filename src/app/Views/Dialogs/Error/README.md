# API Error Dialog Implementation

This document explains how to use the new error dialog functionality in your Ionic application.

## Overview

The error dialog provides a more user-friendly way to display API errors compared to simple alerts. It includes:
- Clear error title and message
- Technical details section (collapsed by default)
- Retry button for retryable errors
- Close button

## Usage

### 1. Basic Error Handling with Dialog

To show an error dialog instead of a simple alert, pass `true` as the `useDialog` parameter:

```typescript
this.apiService.someApiCall().subscribe({
  next: (result) => {
    // Handle success
  },
  error: (error) => {
    // Show error dialog instead of alert
    this.errorHandler.handleError(error, 'Operation Context', true, false, true);
  }
});
```

### 2. Handling API Results with Dialog

For API calls that return a result object with success/failure information:

```typescript
this.apiService.someApiCall().subscribe((result) => {
  if (result.success) {
    // Handle success
  } else {
    // Show error dialog for API-level failures
    this.errorHandler.handleApiResult(result, 'Operation Context', true, false, true);
  }
});
```

### 3. Showing Detailed Error Information

For more detailed error information:

```typescript
this.apiService.someApiCall().subscribe({
  next: (result) => {
    if (result.success) {
      // Handle success
    } else {
      // Show detailed error dialog
      this.errorHandler.showDetailedErrorAlert(result, 'Operation Context');
    }
  },
  error: (error) => {
    // Show detailed error dialog for HTTP errors
    this.errorHandler.showDetailedErrorAlert(error, 'Operation Context');
  }
});
```

## Parameters

The `handleError` and `handleApiResult` methods now accept these parameters:

1. `error/result` - The error or result object
2. `context` - Optional context for the error (e.g., 'Login', 'Registration')
3. `showSnackbar` - Whether to show a snackbar (default: true)
4. `useAlert` - Whether to show an alert instead of snackbar (default: false)
5. `useDialog` - Whether to show a dialog instead of snackbar/alert (default: false)

## Implementation Notes

1. The error dialog includes a retry button for retryable errors (network errors, server errors, etc.)
2. Technical details are shown in a collapsible section for advanced users
3. If the dialog fails to show for any reason, it falls back to a simple alert
4. The dialog uses the existing BaseDialogController framework for consistency

## Example Implementation

Here's a complete example of how to implement error dialogs in a component:

```typescript
import { Component } from '@angular/core';
import { ApiErrorHandlerService } from 'src/app/services/ApiErrorHandler';

@Component({
  selector: 'app-example',
  template: `
    <ion-content>
      <ion-button (click)="performApiCall()">Make API Call</ion-button>
    </ion-content>
  `
})
export class ExampleComponent {
  constructor(private api: SomeApiService, private errorHandler: ApiErrorHandlerService) {}

  performApiCall() {
    this.api.someCall().subscribe({
      next: (result) => {
        if (result.success) {
          // Handle success
        } else {
          // Show error dialog
          this.errorHandler.handleApiResult(result, 'API Call', true, false, true);
        }
      },
      error: (error) => {
        // Show error dialog
        this.errorHandler.handleError(error, 'API Call', true, false, true);
      }
    });
  }
}
```

## Customization

You can customize the error dialog by modifying:
- `src/app/Views/Dialogs/Error/ErrorDialog.html` - Template structure
- `src/app/Views/Dialogs/Error/ErrorDialog.scss` - Styling
- `src/app/Views/Dialogs/Error/ErrorDialogController.ts` - Component logic

The dialog supports these data properties:
- `title`: Error title
- `message`: User-friendly error message
- `errorDetails`: Technical details (JSON stringified)
- `isRetryable`: Whether to show the retry button