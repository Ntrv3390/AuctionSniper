import { Component } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { ApiErrorHandlerService } from 'src/app/services/ApiErrorHandler';

@Component({
  selector: 'app-error-dialog-test',
  template: `
    <ion-content class="ion-padding">
      <h2>Error Dialog Test</h2>
      
      <div class="test-buttons">
        <ion-button expand="block" (click)="testNetworkError()">
          Simulate Network Error
        </ion-button>
        
        <ion-button expand="block" (click)="testApiResultError()">
          Simulate API Result Error
        </ion-button>
        
        <ion-button expand="block" (click)="testDetailedError()">
          Show Detailed Error
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .test-buttons {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [IonContent, IonButton]
})
export class ErrorDialogTestComponent {
  constructor(private errorHandler: ApiErrorHandlerService) {}

  testNetworkError() {
    // Simulate a network error
    const networkError = {
      status: 0,
      message: 'Unable to connect to the server'
    };
    
    this.errorHandler.handleError(networkError, 'Connection Test', true, false, true);
  }

  testApiResultError() {
    // Simulate an API result error
    const apiResult = {
      success: false,
      message: {
        MessageContent: 'Invalid credentials provided. Please check your username and password.'
      }
    };
    
    this.errorHandler.handleApiResult(apiResult, 'Login Test', true, false, true);
  }

  testDetailedError() {
    // Simulate a detailed error
    const detailedError = {
      status: 500,
      statusText: 'Internal Server Error',
      url: 'https://api.example.com/users',
      message: 'Server encountered an unexpected condition',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      }
    };
    
    this.errorHandler.showDetailedErrorAlert(detailedError, 'Server Test');
  }
}