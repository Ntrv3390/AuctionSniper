// Define a generic interface for tracking events
export interface TrackingEvent<T> {
  category: string;
  action: string;
  isFirebaseEvent: boolean;
}

export const TrackerConstants = {
  Search: {
    IdSearch: { category: 'Search', action: 'ID Search', isFirebaseEvent: true } as TrackingEvent<string>,
    KeywordSearch: { category: 'Search', action: 'Keyword Search', isFirebaseEvent: true } as TrackingEvent<string>,
    LoadPage: { category: 'Search', action: 'Load Page', isFirebaseEvent: true } as TrackingEvent<number>,
    LoadNextGroup: { category: 'Search', action: 'Load Next Group', isFirebaseEvent: true } as TrackingEvent<void>,
    SavedSearch: { category: 'Search', action: 'Saved Search', isFirebaseEvent: true } as TrackingEvent<void>,
    Clear: { category: 'Search', action: 'Clear', isFirebaseEvent: true } as TrackingEvent<void>,
    Save: { category: 'Search', action: 'Save', isFirebaseEvent: true } as TrackingEvent<void>,
    CreateSavedSearch: { category: 'Search', action: 'Create Saved Search', isFirebaseEvent: true } as TrackingEvent<void>,
    UpdateSavedSearch: { category: 'Search', action: 'Update Saved Search', isFirebaseEvent: true } as TrackingEvent<void>,
    DeleteSavedSearch: { category: 'Search', action: 'Delete Saved Search', isFirebaseEvent: true } as TrackingEvent<void>,
  },

  Item: {
    ViewDailyDeal: { category: 'Item', action: 'View Daily Dal', isFirebaseEvent: true } as TrackingEvent<void>,
    ViewOnEbay: { category: 'Item', action: 'View on eBay', isFirebaseEvent: true } as TrackingEvent<void>,
  },

  Watch: {
    AddWatch: { category: 'Watch', action: 'Add Watch', isFirebaseEvent: true } as TrackingEvent<void>,
    RemoveWatch: { category: 'Watch', action: 'Remove Watch', isFirebaseEvent: true } as TrackingEvent<void>,
  },

  Snipe: {
    Add: { category: 'Snipe', action: 'Add', isFirebaseEvent: true } as TrackingEvent<void>,
    Update: { category: 'Snipe', action: 'Update', isFirebaseEvent: true } as TrackingEvent<void>,
    Remove: { category: 'Snipe', action: 'Remove', isFirebaseEvent: true } as TrackingEvent<void>,
    Filter: { category: 'Snipe', action: 'Filter', isFirebaseEvent: true } as TrackingEvent<string>,
    FilterLabel: {
      Active: 'Active',
      Won: 'Won',
      Lost: 'Lost',
    },
  },

  Account: {
    UpdateUserInfo: { category: 'Account', action: 'Update User Info', isFirebaseEvent: true } as TrackingEvent<void>,
    Delete: { category: 'Account', action: 'Delete', isFirebaseEvent: true } as TrackingEvent<void>,
    UpdateUserPreferences: { category: 'Account', action: 'Update User Preferences', isFirebaseEvent: true } as TrackingEvent<void>,
    UpdateUserNotifications: { category: 'Account', action: 'Update User Notifications', isFirebaseEvent: true } as TrackingEvent<void>,
    OpenPricingDetailsOnWebsite: { category: 'Account', action: 'Open Pricing Details on Website', isFirebaseEvent: true } as TrackingEvent<void>,
    OpenPaymentsOnWebsite: { category: 'Account', action: 'Open Payments on Website', isFirebaseEvent: true } as TrackingEvent<void>,
    PayWithPaypal: { category: 'Account', action: 'Pay with PayPal', isFirebaseEvent: true } as TrackingEvent<void>,
    OpenTransactionsOnWebsite: { category: 'Account', action: 'Open Transactions Page on Website', isFirebaseEvent: true } as TrackingEvent<void>,
    SetPin: { category: 'Account', action: 'Set PIN', isFirebaseEvent: true } as TrackingEvent<void>,
    ChangePin: { category: 'Account', action: 'Change PIN', isFirebaseEvent: true } as TrackingEvent<void>,
    RemovePin: { category: 'Account', action: 'Remove PIN', isFirebaseEvent: true } as TrackingEvent<void>,
    Help: { category: 'Account', action: 'Help', isFirebaseEvent: true } as TrackingEvent<void>,
    RegisterAccount: { category: 'Account', action: 'Register Account', isFirebaseEvent: true } as TrackingEvent<void>,
    Login: { category: 'Account', action: 'Login', isFirebaseEvent: true } as TrackingEvent<void>,
    Logout: { category: 'Account', action: 'Logout', isFirebaseEvent: true } as TrackingEvent<void>,
  },

  PushNotification: {
    Launch: { category: 'Push Notification', action: 'Launch', isFirebaseEvent: true } as TrackingEvent<string>,
    Received: { category: 'Push Notification', action: 'Received', isFirebaseEvent: true } as TrackingEvent<string>,
    UserAcceptedDeepLink: { category: 'Push Notification', action: 'User Accepted Deep Link', isFirebaseEvent: true } as TrackingEvent<string>,
    UserDeclinedDeepLink: { category: 'Push Notification', action: 'User Declined Deep Link', isFirebaseEvent: true } as TrackingEvent<string>,
    ManualOptIn: { category: 'Push Notification', action: 'Manual Opt-In', isFirebaseEvent: true } as TrackingEvent<void>,
    ManualOptOut: { category: 'Push Notification', action: 'Manual Opt-Out', isFirebaseEvent: true } as TrackingEvent<void>,
  },

  Review: {
    ReviewAccepted: { category: 'Review', action: 'Review Accepted', isFirebaseEvent: true } as TrackingEvent<void>,
    ReviewDeclined: { category: 'Review', action: 'Review Declined', isFirebaseEvent: true } as TrackingEvent<void>,
  },
};
