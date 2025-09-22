## How to Update Existing Components to Use Error Dialogs

To update existing components to use the new error dialog functionality, you need to modify the error handling calls to pass `true` as the `useDialog` parameter.

### Example: Updating LoginController

In the LoginController, you would change these lines:

**Before:**
```typescript
// Handle API-level failure with snackbar
this.errorHandler.handleApiResult(result, 'Registration');

// Handle HTTP error
this.errorHandler.handleError(error, 'Registration');
```

**After:**
```typescript
// Handle API-level failure with dialog
this.errorHandler.handleApiResult(result, 'Registration', true, false, true);

// Handle HTTP error with dialog
this.errorHandler.handleError(error, 'Registration', true, false, true);
```

### Full Example

Here's how the registration error handling would look:

```typescript
this.api.register(registerParams).subscribe({
  next: (result) => {
    this.isLoading = false;
    this.errorHandler.hideLoading();
    
    if (result.success) {
      // Handle success
      this.errorHandler.handleSuccess('Account created successfully! Signing you in...', 'Registration');
      this.signInAfterRegister(userId, password);
    } else {
      // Handle API-level failure with dialog
      this.errorHandler.handleApiResult(result, 'Registration', true, false, true);
    }
  },
  error: (error) => {
    this.isLoading = false;
    this.errorHandler.hideLoading();
    // Handle HTTP error with dialog
    this.errorHandler.handleError(error, 'Registration', true, false, true);
  }
});
```

And the login error handling:

```typescript
this.api.logon(loginParams).subscribe({
  next: (result) => {
    this.errorHandler.hideLoading();
    
    if (result.success) {
      // Handle success
      this.errorHandler.handleSuccess('Welcome back!', 'Login');
      // ... rest of success handling
    } else {
      // Handle API-level failure with dialog
      this.errorHandler.handleApiResult(result, 'Login', true, false, true);
    }
  },
  error: (error) => {
    this.errorHandler.hideLoading();
    // Handle HTTP error with dialog
    this.errorHandler.handleError(error, 'Login', true, false, true);
  }
});
```

### Benefits of Using Error Dialogs

1. **Better User Experience**: More detailed error information in a structured format
2. **Retry Functionality**: Users can retry failed operations directly from the dialog
3. **Technical Details**: Advanced users can see technical information for troubleshooting
4. **Consistent UI**: Uses the same dialog framework as other parts of your application

### Implementation Notes

1. Make sure the `useDialog` parameter is set to `true`
2. You can still use `showSnackbar` and `useAlert` parameters as needed
3. The dialog will automatically fall back to alerts if it fails to display
4. Retry functionality is implemented but can be extended based on your application's needs