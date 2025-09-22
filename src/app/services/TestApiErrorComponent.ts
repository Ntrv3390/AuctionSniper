import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { ApiErrorHandlerService } from 'src/app/services/ApiErrorHandler';

@Component({
  selector: 'app-test-api-error',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>API Error Test</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-button expand="block" (click)="testApiError()">
            Test API Error Handling
          </ion-button>
        </ion-item>
        <ion-item>
          <ion-button expand="block" (click)="testNetworkError()">
            Test Network Error
          </ion-button>
        </ion-item>
        <ion-item>
          <ion-button expand="block" (click)="test404Error()">
            Test 404 Error
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TestApiErrorComponent {
  constructor(
    private api: AuctionSniperApiService,
    private errorHandler: ApiErrorHandlerService
  ) {}

  testApiError() {
    // This will trigger an API error since we're not providing valid parameters
    this.api.logon({
      UserName: '',
      Password: '',
      ADID: '',
      LaunchLinkInfo: ''
    }).subscribe({
      next: (result) => {
        console.log('API call succeeded:', result);
      },
      error: (error) => {
        console.log('API error caught in component:', error);
        // Let the interceptor and error handler take care of displaying the error
      }
    });
  }

  testNetworkError() {
    // Test with an invalid URL to simulate network error
    this.api.genericGet('https://invalid-domain-that-does-not-exist-12345.com/api/test')
      .subscribe({
        next: (result) => {
          console.log('Network test succeeded:', result);
        },
        error: (error) => {
          console.log('Network error caught in component:', error);
          // Let the interceptor and error handler take care of displaying the error
        }
      });
  }

  test404Error() {
    // Test with a URL that returns 404
    this.api.genericGet('https://httpstat.us/404')
      .subscribe({
        next: (result) => {
          console.log('404 test succeeded:', result);
        },
        error: (error) => {
          console.log('404 error caught in component:', error);
          // Let the interceptor and error handler take care of displaying the error
        }
      });
  }
}