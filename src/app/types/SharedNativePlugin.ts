// shared-native-plugin.ts

export interface FirebaseTrackingEventData {
  label?: string;
  builtInEventName?: string;
}

export interface PushNotificationMessage {
  body: string;
  title: string;
  clickAction: string;
  tag: string;
  imageUrl: string;
  linkUrl: string;
  notificationCount: number;
}

export interface PushNotificationTokenResult {
  token: string;
}

export interface SharedNativePlugin {
  // iOS-specific logging
  nsLog(params: { message: string }): Promise<void>;

  // Firebase Analytics
  firebaseAnalytics_setUserId(params: { userId: string }): Promise<void>;
  firebaseAnalytics_setScreenName(params: { screenName: string }): Promise<void>;
  firebaseAnalytics_logEvent(params: {
    eventName: string;
    eventData: FirebaseTrackingEventData;
  }): Promise<void>;

  // Crashlytics
  crashlytics_crash(): Promise<void>;
  crashlytics_setUserIdentifier(params: { userIdentifier: string }): Promise<void>;
  crashlytics_setBoolValue(params: { key: string; boolValue: boolean }): Promise<void>;
  crashlytics_setStringValue(params: { key: string; stringValue: string }): Promise<void>;

  // Firebase Push Notifications
  firebasePushNotifications_getToken(): Promise<PushNotificationTokenResult>;
}
