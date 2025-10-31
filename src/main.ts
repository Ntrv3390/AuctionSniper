import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { enableProdMode, InjectionToken } from '@angular/core';
import { environment } from './environments/environment';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BUILD_VARS_TOKEN } from './app/constants/build-vars.token';
import { BuildVars } from './app/Interfaces/build-vars.interface';
import { ModalController, LoadingController, PopoverController, ActionSheetController, NavController, ToastController } from '@ionic/angular';
import { HttpInterceptor } from './app/services/HttpInterceptor';
import { PushNotificationsService } from './app/services/PushNotifications';

// Create Window injection token
export const WINDOW_TOKEN = new InjectionToken<Window>('Window', {
  providedIn: 'root',
  factory: () => window
});


if (environment.production) {
  enableProdMode();
}

// Create default build vars
const defaultBuildVars: BuildVars = {
  debug: !environment.production,
  buildTimestamp: new Date().toISOString(),
  commitShortSha: 'dev',
  config: {
    ApplicationName: 'Auction Sniper',
    ApplicationDescription: 'eBay auction sniping application',
    AppVersion: '3.18.0',
    AuthorName: 'AuctionSniper.com',
    AuthorEmail: 'support@auctionsniper.com',
    AuthorWebsite: 'https://auctionsniper.com',
    ApiUrl: 'http://services.main1.auctionsniper.com',
    WebSiteUrl: 'https://auctionsniper.com',
    TermsOfServiceUrl: 'https://auctionsniper.com/terms',
    PrivacyPolicyUrl: 'https://auctionsniper.com/privacy',
    CertificateUrl: 'https://auctionsniper.com/certificate',
    LogEntriesToken: '',
    DebugLoggingUrl: '',
    EnableIosLoggingInDistributionBuilds: false,
    AppReviewURL_iOS: 'https://apps.apple.com/app/auction-sniper',
    AppReviewURL_Android: 'https://play.google.com/store/apps/details?id=com.auctionsniper',
    OpenSourceUrl: 'https://github.com/auctionsniper'
  }
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: BUILD_VARS_TOKEN, useValue: defaultBuildVars },
    { provide: WINDOW_TOKEN, useValue: window },
    provideIonicAngular(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    // Services
    PushNotificationsService,
    // Ionic Controllers
    ModalController,
    LoadingController,
    PopoverController,
    ActionSheetController,
    NavController,
    ToastController,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true
    }
  ],
});
 