// Dialog Constants
export const DialogConstants = {
  DIALOG_ALREADY_OPEN: 'DIALOG_ALREADY_OPEN',
  DIALOG_ID_NOT_REGISTERED: 'DIALOG_ID_NOT_REGISTERED',
  CRASHLYTICS_CURRENT_STATE_NAME_KEY: 'current_state_name',
  CRASHLYTICS_DEBUG_KEY: 'debug',
};

// Dialog Button Titles
export const DialogButtons = {
  YES: 'Yes',
  NO: 'No',
  OK: 'OK',
  CANCEL: 'Cancel',
  SHOW_ME: 'Show Me',
  NOT_NOW: 'Not Now',
};

// Application-wide Event Constants
export const AppEvents = {
  HTTP_ERROR: 'http.error',
  HTTP_API_UNAUTHORIZED: 'http.apiUnauthorized',
  HTTP_API_MESSAGE_RECEIVED: 'http.apiMessageReceived',

  SCROLL_REFRESH_COMPLETE: 'scroll.refreshComplete',
  SCROLL_INFINITE_SCROLL_COMPLETE: 'scroll.infiniteScrollComplete',

  APP_USER_LOGGED_IN: 'app.userLoggedIn',
  APP_USER_LOGGED_OUT: 'app.userLoggedOut',
  APP_SHOW_TABS: 'app.showTabs',
  APP_HIDE_TABS: 'app.hideTabs',
  APP_CLOSE_DIALOG: 'app.appCloseDialog',
  APP_PUSH_NOTIFICATION_RECEIVED: 'app.pushNotificationReceived',

  APP_BADGES_UPDATED: 'app.badgesUpdated',
};
