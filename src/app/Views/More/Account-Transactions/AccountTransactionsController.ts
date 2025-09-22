

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackerService } from 'src/app/services/Tracker';
import { ConfigurationService } from 'src/app/services/Configuration';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent, 
  IonIcon, 
  IonButton, 
  IonList, 
  IonItem, 
  IonItemDivider, 
  IonLabel 
} from '@ionic/angular/standalone';

// Import icons
import { addIcons } from 'ionicons';
import {
  receiptOutline,
  informationCircleOutline,
  globeOutline,
  helpCircleOutline,
  documentTextOutline,
  cardOutline,
  calendarOutline,
  downloadOutline,
  helpBuoyOutline,
  chatbubbleEllipsesOutline
} from 'ionicons/icons';

// Import Window token
import { WINDOW_TOKEN } from 'src/main';

@Component({
  selector: 'app-account-transactions',
  templateUrl: './Account-Transactions.html',
  styleUrls: ['./account-transactions.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonList,
    IonItem,
    IonItemDivider,
    IonLabel
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AccountTransactionsPage implements OnInit {
  constructor(
    @Inject(WINDOW_TOKEN) private window: Window,
    private tracker: TrackerService,
    private configuration: ConfigurationService
  ) {
    console.log('AccountTransactionsPage: Constructor called');
    
    // Register icons
    addIcons({
      'receipt-outline': receiptOutline,
      'information-circle-outline': informationCircleOutline,
      'globe-outline': globeOutline,
      'help-circle-outline': helpCircleOutline,
      'document-text-outline': documentTextOutline,
      'card-outline': cardOutline,
      'calendar-outline': calendarOutline,
      'download-outline': downloadOutline,
      'help-buoy-outline': helpBuoyOutline,
      'chatbubble-ellipses-outline': chatbubbleEllipsesOutline
    });
  }

  ngOnInit(): void {
    console.log('AccountTransactionsPage: ngOnInit called');
  }

  accountInformationClick(): void {
    this.tracker.track(TrackerConstants.Account.OpenTransactionsOnWebsite);
    this.window.open(`${this.configuration.webSiteUrl}/AccountInfo.aspx`, '_blank');
  }

  contactSupport(): void {
    this.tracker.track(TrackerConstants.Account.Help);
    this.window.open(`${this.configuration.webSiteUrl}/help/support`, '_blank');
  }
}
