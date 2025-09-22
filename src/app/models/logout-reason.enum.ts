/**
 * Used to indicate the reason that a logout is occurring.
 */
export enum LogoutReason {
    /**
     * The user has initiated this logout by tapping logout in the user interface.
     */
    UserInitiated,
  
    /**
     * The app received an HTTP 401, 403, or 200 with authorized=false during an API
     * request to our backend services, which means the user's session has expired.
     */
    SessionExpired
  }
  