import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ApiErrorHandlerService } from './ApiErrorHandler';
import { ApiErrorTestService } from './ApiErrorTestService';

@Component({
  selector: 'app-error-handler-test',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Error Handler Test</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-label>Test 400 Error</ion-label>
          <ion-button (click)="test400Error()">Test</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Test 401 Error</ion-label>
          <ion-button (click)="test401Error()">Test</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Test 404 Error</ion-label>
          <ion-button (click)="test404Error()">Test</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Test 500 Error</ion-label>
          <ion-button (click)="test500Error()">Test</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Test Network Error</ion-label>
          <ion-button (click)="testNetworkError()">Test</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Test API Error Result</ion-label>
          <ion-button (click)="testApiErrorResult()">Test</ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Test API Success Result</ion-label>
          <ion-button (click)="testApiSuccessResult()">Test</ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ErrorHandlerTestComponent {
  
  constructor(
    private errorHandler: ApiErrorHandlerService,
    private errorTestService: ApiErrorTestService,
    private toastController: ToastController
  ) {}
  
  test400Error() {
    const error = this.errorTestService.createHttpError(400, 'Bad Request: The request could not be understood by the server.');
    this.errorHandler.handleError(error, 'Validation');
  }
  
  test401Error() {
    const error = this.errorTestService.createHttpError(401, 'Unauthorized: Authentication is required and has failed or has not yet been provided.');
    this.errorHandler.handleError(error, 'Authentication');
  }
  
  test404Error() {
    const error = this.errorTestService.createHttpError(404, 'Not Found: The requested resource could not be found.');
    this.errorHandler.handleError(error, 'Resource');
  }
  
  test500Error() {
    const error = this.errorTestService.createHttpError(500, 'Internal Server Error: The server encountered an unexpected condition.');
    this.errorHandler.handleError(error, 'Server');
  }
  
  testNetworkError() {
    const error = this.errorTestService.createHttpError(0, 'Network Error: Unable to connect to the server.');
    this.errorHandler.handleError(error, 'Connection');
  }
  
  testApiErrorResult() {
    const result = this.errorTestService.createApiErrorResult('API Error: The operation could not be completed due to a validation error.');
    this.errorHandler.handleApiResult(result, 'Operation');
  }
  
  testApiSuccessResult() {
    const result = this.errorTestService.createApiSuccessResult('Operation completed successfully!');
    this.errorHandler.handleApiResult(result, 'Operation');
  }
}