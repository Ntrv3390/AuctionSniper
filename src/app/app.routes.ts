import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Views/Splash/SplashController').then((m) => m.SplashController),
  },

  // Authentication Routes
  {
    path: 'login',
    loadComponent: () =>
      import('./Views/Login/LoginController').then((m) => m.LoginPage),
  },

  // About Routes (Working)
  {
    path: 'more-about',
    loadComponent: () =>
      import('./Views/More/About/AboutController').then((m) => m.AboutPage),
  },
  {
    path: 'more-about-opensource',
    loadComponent: () =>
      import('./Views/More/About-Open-Source/AboutOpenSourceController').then(
        (m) => m.AboutOpenSourceComponent
      ),
  },

  // Blank/Home Route
  {
    path: 'blank',
    loadComponent: () =>
      import('./Views/Splash/SplashController').then((m) => m.SplashController),
  },

  // Root/Tabs Route with children
  {
    path: 'root',
    loadComponent: () =>
      import('./Views/Root/RootController').then((m) => m.RootController),
    children: [
      {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full',
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./Views/Search/Search-Query/SearchQueryController').then(
            (m) => m.SearchQueryController
          ),
      },
      {
        path: 'watches',
        loadComponent: () =>
          import('./Views/Watch-List/WatchListController').then(
            (m) => m.WatchListPage
          ),
      },
      {
        path: 'snipes',
        loadComponent: () =>
          import('./Views/Snipe-List/SnipeListController').then(
            (m) => m.SnipeListPage
          ),
      },
      {
        path: 'more',
        loadComponent: () =>
          import('./Views/More/More-List/MoreListController').then(
            (m) => m.MoreListPage
          ),
      },
    ],
  },

  // Search Routes
  {
    path: 'search/query',
    loadComponent: () =>
      import('./Views/Search/Search-Query/SearchQueryController').then(
        (m) => m.SearchQueryController
      ),
  },
  {
    path: 'search/list',
    loadComponent: () =>
      import('./Views/Search/Search-List/SearchListController').then(
        (m) => m.SearchListController
      ),
  },
  {
    path: 'search/edit/:id',
    loadComponent: () =>
      import('./Views/Search/Search-Edit/SearchEditController').then(
        (m) => m.SearchEditController
      ),
  },
  {
    path: 'search/create',
    loadComponent: () =>
      import('./Views/Search/Search-Edit/SearchEditController').then(
        (m) => m.SearchEditController
      ),
  },
  {
    path: 'search/create/:keywords',
    loadComponent: () =>
      import('./Views/Search/Search-Edit/SearchEditController').then(
        (m) => m.SearchEditController
      ),
  },
  {
    path: 'search/detail/:id',
    loadComponent: () =>
      import('./Views/Detail/DetailController').then((m) => m.DetailController),
  },

  // Watch List Routes
  {
    path: 'watch/list',
    loadComponent: () =>
      import('./Views/Watch-List/WatchListController').then(
        (m) => m.WatchListPage
      ),
  },
  {
    path: 'watch/detail/:id',
    loadComponent: () =>
      import('./Views/Detail/DetailController').then((m) => m.DetailController),
  },
  {
    path: 'watch/edit/:id',
    loadComponent: () =>
      import('./Views/Watch-List/Watch-Edit/WatchEditController').then(
        (m) => m.WatchEditController
      ),
  },
  {
    path: 'watch/add',
    loadComponent: () =>
      import('./Views/Watch-List/Watch-Edit/WatchEditController').then(
        (m) => m.WatchEditController
      ),
  },

  {
    path: 'account-information',
    loadComponent: () =>
      import(
        './Views/More/Account-Information/AccountInformationController'
      ).then((m) => m.AccountInformationComponent),
  },
  {
    path: 'account-preferences',
    loadComponent: () =>
      import(
        './Views/More/Account-Preferences/AccountPreferencesController'
      ).then((m) => m.AccountPreferencesPage),
  },
  {
    path: 'account-notifications',
    loadComponent: () =>
      import(
        './Views/More/Account-Notifications/AccountNotificationsController'
      ).then((m) => m.AccountNotificationsPage),
  },
  {
    path: 'account-push-notifications',
    loadComponent: () =>
      import(
        './Views/More/Account-Push-Notifications/AccountPushNotificationsController'
      ).then((m) => m.AccountPushNotificationsPage),
  },
  {
    path: 'account-payment',
    loadComponent: () =>
      import('./Views/More/Account-Payment/AccountPaymentController').then(
        (m) => m.AccountPaymentPage
      ),
  },
  {
    path: 'account-transactions',
    loadComponent: () =>
      import(
        './Views/More/Account-Transactions/AccountTransactionsController'
      ).then((m) => m.AccountTransactionsPage),
  },
  {
    path: 'account-delete',
    loadComponent: () =>
      import('./Views/More/Account-Delete/AccountDeleteController').then(
        (m) => m.AccountDeletePage
      ),
  },
  {
    path: 'configure-pin',
    loadComponent: () =>
      import('./Views/More/Configure-Pin/ConfigurePinController').then(
        (m) => m.ConfigurePinPage
      ),
  },
  {
    path: 'developer',
    loadComponent: () =>
      import('./Views/More/Developer/DeveloperController').then(
        (m) => m.DeveloperController
      ),
  },

  // Snipe List Routes
  {
    path: 'snipe/list',
    loadComponent: () =>
      import('./Views/Snipe-List/SnipeListController').then(
        (m) => m.SnipeListPage
      ),
  },
  {
    path: 'snipe/detail/:id',
    loadComponent: () =>
      import('./Views/Detail/DetailController').then((m) => m.DetailController),
  },
  {
    path: 'snipe/add',
    loadComponent: () =>
      import('./Views/Dialogs/Edit-Snipe/EditSnipeController').then(
        (m) => m.EditSnipeController
      ),
  },
  {
    path: 'snipe/edit/:id',
    loadComponent: () =>
      import('./Views/Dialogs/Edit-Snipe/EditSnipeController').then(
        (m) => m.EditSnipeController
      ),
  },
  {
    path: 'more/developer/config',
    loadComponent: () =>
      import('./Views/More/Developer/Dev-Config/DevConfigController').then(
        (m) => m.DevConfigComponent
      ),
  },
  {
    path: 'more/developer/caches',
    loadComponent: () =>
      import('./Views/More/Developer/Dev-Caches/DevCachesController').then(
        (m) => m.DevCachesController
      ),
  },
  {
    path: 'more/developer/device-info',
    loadComponent: () =>
      import(
        './Views/More/Developer/Dev-Device-Info/DevDeviceInfoController'
      ).then((m) => m.DevDeviceInfoController),
  },
  {
    path: 'more/developer/icon-list',
    loadComponent: () =>
      import('./Views/More/Developer/Dev-Icon-List/DevIconListController').then(
        (m) => m.DevIconListComponent
      ),
  },
  {
    path: 'more/developer/logs/list',
    loadComponent: () =>
      import('./Views/More/Developer/Dev-Logs-List/DevLogsListController').then(
        (m) => m.DevLogsListController
      ),
  },
  {
    path: 'more/developer/logs/detail/:id',
    loadComponent: () =>
      import(
        './Views/More/Developer/Dev-Log-Detail/DevLogDetailController'
      ).then((m) => m.DevLogDetailController),
  },
  {
    path: 'more/developer/plugin-tests',
    loadComponent: () =>
      import(
        './Views/More/Developer/Dev-Plugin-Tests/DevPluginTestsController'
      ).then((m) => m.DevPluginTestsController),
  },
  {
    path: 'more/developer/push-notifications',
    loadComponent: () =>
      import(
        './Views/More/Developer/Dev-Push-Notifications/DevPushNotificationsController'
      ).then((m) => m.DevPushNotificationsController),
  },
  {
    path: 'more/developer/user',
    loadComponent: () =>
      import('./Views/More/Developer/Dev-User/DevUserController').then(
        (m) => m.DevUserController
      ),
  },
  {
    path: 'more/developer/test-tools',
    loadComponent: () =>
      import(
        './Views/More/Developer/Dev-Test-Tools/DevTestToolsController'
      ).then((m) => m.DevTestToolsPage),
  },
  {
    path: 'pin-entry',
    loadComponent: () =>
      import('./Views/Dialogs/Pin-Entry/PinEntryController').then(
        (m) => m.PinEntryPage
      ),
  },
  {
    path: 'ebay-token',
    loadComponent: () =>
      import('./Views/Dialogs/Ebay-Token/EbayTokenController').then(
        (m) => m.EbayTokenController
      ),
  },

  // Wildcard route - should be last
  {
    path: '**',
    redirectTo: '/login',
  },
];
