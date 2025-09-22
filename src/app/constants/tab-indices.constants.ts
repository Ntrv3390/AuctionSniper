// src/app/constants/tab-indices.constants.ts

export const TabIndices = {
  EXTRA: 0,
  LOGIN: 1,
  SEARCH: 2,
  WATCHES: 3,
  SNIPES: 4,
  MORE: 5,

  /**
   * Returns the index of the tab that the given state should be displayed in.
   * The tab a state should be shown in is assigned in the RouteConfig class.
   * 
   * @param state The name of the state to retrieve a tab index for.
   * @returns A tab index for the given state name.
   */
  getByStateName(state: string): number {
    switch (state) {
      case "app.blank":
        return TabIndices.EXTRA;
      case "app.login":
        return TabIndices.LOGIN;
      case "app.search-query":
      case "app.search-list":
      case "app.search-edit":
      case "app.search-create":
      case "app.search-detail":
        return TabIndices.SEARCH;
      case "app.watch-list":
      case "app.watch-detail":
        return TabIndices.WATCHES;
      case "app.snipe-list":
      case "app.snipe-detail":
        return TabIndices.SNIPES;
      case "app.more-list":
      case "app.account-information":
      case "app.account-preferences":
      case "app.account-notifications":
      case "app.account-push-notifications":
      case "app.account-payment":
      case "app.account-transactions":
      case "app.account-delete":
      case "app.configure-pin":
      case "app.about":
      case "app.about-open-source":
      case "app.developer":
      case "app.dev-caches":
      case "app.dev-config":
      case "app.dev-device-info":
      case "app.dev-icon-list":
      case "app.dev-logs-list":
      case "app.dev-log-detail":
      case "app.dev-plugin-tests":
      case "app.dev-push-notifications":
      case "app.dev-user":
      case "app.dev-test-tools":
        return TabIndices.MORE;
      default:
        return TabIndices.EXTRA;
    }
  }
};
