import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonContent, 
  IonRefresher, 
  IonRefresherContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonNote, 
  IonItemDivider,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBackButton
} from '@ionic/angular/standalone';
import { AccountPaymentViewModel } from './AccountPaymentViewModel';
import { TrackerService } from 'src/app/services/Tracker';
import { Logger } from 'src/app/services/Logger';
import { UIService } from 'src/app/services/UI';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { ConfigurationService } from 'src/app/services/Configuration';
import { PayPalService } from 'src/app/services/PayPal';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { firstValueFrom } from 'rxjs';
import { IconPanelComponent } from 'src/app/directives/Icon-Panel/IconPanelDirective';

// Import icons
import { addIcons } from 'ionicons';
import {
  cardOutline,
  rainyOutline,
  informationCircleOutline,
  logoPaypal
} from 'ionicons/icons';

@Component({
  selector: 'app-account-payment',
  templateUrl: './Account-Payment.html',
  styleUrls: ['./account-payment.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonItemDivider,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IconPanelComponent,
    IonBackButton
  ]
})
export class AccountPaymentPage implements OnInit {

  viewModel: AccountPaymentViewModel = new AccountPaymentViewModel();

  constructor(
    private tracker: TrackerService,
    private logger: Logger,
    private ui: UIService,
    private auctionSniperApi: AuctionSniperApiService,
    private configuration: ConfigurationService,
    private payPal: PayPalService
  ) {
    console.log('AccountPaymentPage: Constructor called');
    
    // Register icons
    addIcons({
      'card-outline': cardOutline,
      'rainy-outline': rainyOutline,
      'information-circle-outline': informationCircleOutline,
      'logo-paypal': logoPaypal
    });
  }

  ngOnInit(): void {
    console.log('AccountPaymentPage: ngOnInit called');
    this.view_beforeEnter();
  }

  //#region BaseController Overrides

  private async view_beforeEnter(): Promise<void> {
    await this.refresh();
  }

  //#endregion

  //#region Controller Methods

  retry_click(): void {
    this.refresh();
  }

  refresher_refresh(event: any): void {
    this.refresh().then(() => {
      event.target.complete();
    });
  }

  viewPricingDetails_click(): void {
    this.tracker.track(TrackerConstants.Account.OpenPricingDetailsOnWebsite);
    window.open(`${this.configuration.webSiteUrl}/help/auction-sniper-pricing`, '_blank');
  }

  async payWithPayPal_click(): Promise<void> {
    // Using any type to avoid type conflicts with the UI service
    const actions: any[] = [
        { title: '$5.00', style: 'DEFAULT' },
        { title: '$10.00', style: 'DEFAULT' },
        { title: 'Other', style: 'DEFAULT' },
        { title: 'Cancel', style: 'CANCEL' }
      ];

    const result = await this.ui.showActions('Choose an amount.', 'Make Payment', actions);

    if (!result || result === 'Cancel') return;

    let amount = 0;

    if (result === '$5.00') amount = 5;
    else if (result === '$10.00') amount = 10;
    else if (result === 'Other') {
        const customResult = await this.ui.prompt(
            'Please enter an amount between $5.00 USD and $25.00 USD.',
            'Make Payment',
            undefined,   // instead of null
            undefined,   // instead of null
            '5.00'
          );

      if (customResult.cancelled) return;
      amount = parseFloat(customResult.value);
    } else {
      this.logger.warn('AccountPaymentPage', 'payWithPayPal_click', 'Invalid result amount encountered.', result);
      return;
    }

    if (!amount || isNaN(amount) || amount < 5 || amount > 25) {
      this.ui.showErrorSnackbar('Please enter an amount between $5.00 USD and $25.00 USD.');
      return;
    }

    this.tracker.track(TrackerConstants.Account.PayWithPaypal);

    try {
      await this.payPal.requestPayment(amount);
    } catch (error) {
      this.logger.error('AccountPaymentPage', 'payWithPayPal_click', 'Unexpected error requesting PayPal payment.', error);
      this.ui.showErrorSnackbar('Unexpected error; please try again.');
    }
  }

  viewAccountInformation_click(): void {
    this.tracker.track(TrackerConstants.Account.OpenPaymentsOnWebsite);
    window.open(`${this.configuration.webSiteUrl}/AccountInfo.aspx`, '_blank');
  }

  //#endregion

  //#region Private Methods

  private async refresh(): Promise<void> {
    console.log('AccountPaymentPage: refresh called');
    this.viewModel.showError = false;

    try {
      const result = await firstValueFrom(this.auctionSniperApi.getPaymentInformation());
      console.log('AccountPaymentPage: API response received', result);
      if (!result || !result.success) {
        console.log('AccountPaymentPage: API call failed or unsuccessful');
        this.viewModel.showError = true;
        return;
      }
      console.log('AccountPaymentPage: Setting paymentInfo', result.paymentInfo);
      this.viewModel.paymentInfo = result.paymentInfo;
      console.log('AccountPaymentPage: Updated viewModel paymentInfo', this.viewModel.paymentInfo);
    } catch (error) {
      this.viewModel.showError = true;
      console.error('Error fetching payment information', error);
    }
  }

  //#endregion
}