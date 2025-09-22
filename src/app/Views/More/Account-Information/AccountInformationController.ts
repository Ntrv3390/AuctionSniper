import { Component, OnInit } from '@angular/core';
import { TrackerService } from 'src/app/services/Tracker';
import { UIService } from 'src/app/services/UI';
import { DataSourceService } from 'src/app/services/DataSource';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import * as _ from 'lodash';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
// import { on } from 'src/app/Interfaces';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonButtons,
  IonIcon,
  IonItemDivider,
  IonNote,
  IonBackButton,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-account-information',
  templateUrl: './Account-Information.html',
  styleUrls: ['./account-information.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonButtons,
    IonIcon,
    IonItemDivider,
    IonNote,
    IonBackButton,
    IonSpinner
  ]
})
export class AccountInformationComponent implements OnInit {
  accountInfo: any = {};
  countries: any[] = [];
  newPassword: string | null = null;
  confirmNewPassword: string | null = null;
  showError = false;
  isSaving = false;

  constructor(
    private tracker: TrackerService,
    private ui: UIService,
    private dataSource: DataSourceService,
    private auctionApi: AuctionSniperApiService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  async refresh(): Promise<void> {
    this.showError = false;
  
    try {
      // If getAccountInformation() returns an Observable
      const getAccountInfoResult = await firstValueFrom(this.auctionApi.getAccountInformation());
  
      if (!getAccountInfoResult || !getAccountInfoResult.success) {
        this.showError = true;
        return;
      }
  
      this.accountInfo = getAccountInfoResult.info;
    } catch (error) {
      this.showError = true;
      console.error('Error fetching account info', error);
      return;
    }
    try {
      const countries = await this.dataSource.retrieveCountries(); // No firstValueFrom needed
      this.countries = countries;
    } catch (error) {
      this.showError = true;
      console.error('Error retrieving countries', error);
    }
  }

  retry(): void {
    this.refresh();
  }

  userIdClick(): void {
    this.ui.alert('If you would like to change your password or other account details not found here, please visit AuctionSniper.com.');
  }

  async save_click(): Promise<void> {
    // Show loader
    this.isSaving = true;
    
    this.tracker.track(TrackerConstants.Account.UpdateUserInfo);
    const params = _.clone(this.accountInfo) as AuctionSniperApiTypes.AccountInformationParameters;
    try {
      const result = await firstValueFrom(this.auctionApi.updateAccountInformation(params));
      this.showError = false;
  
      if (!result || !result.success) {
        return;
      }

      this.accountInfo = result.info;
      this.newPassword = null;
      this.confirmNewPassword = null;
    } catch (error) {
      this.showError = true;
      console.error('Error updating account information', error);
    } finally {
      // Hide loader
      this.isSaving = false;
    }
  }

  // Add missing methods referenced in template
  save(): void {
    this.save_click();
  }

  showUsernameInfo(): void {
    // Show username information dialog or alert
    console.log('Username info clicked');
  }

}
