/**
 * Interface representing a tracking event, used for analytics/logging.
 */
export interface TrackingEvent<T = any> {
    __dummy?: T; // Can be used for generic inference or suppression
    category: string; // Event category (e.g. 'User', 'Navigation', 'ButtonClick')
    action: string;   // Event action (e.g. 'Login', 'OpenSettings')
    isFirebaseEvent?: boolean; // Whether to forward this event to Firebase
  }
  