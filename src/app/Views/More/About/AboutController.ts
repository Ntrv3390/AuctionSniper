import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ConfigurationService } from 'src/app/services/Configuration';
import { UIService } from 'src/app/services/UI';
import { AboutViewModel } from './AboutViewModel';

// Import icons
import { addIcons } from 'ionicons';
import {
  logoGithub,
  openOutline,
  informationCircleOutline,
  documentTextOutline,
  lockClosedOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-about',
  templateUrl: './About.html',
  styleUrls: ['./About.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class AboutPage {
  viewModel: AboutViewModel = new AboutViewModel();

  constructor(
    private config: ConfigurationService,
    private ui: UIService,
    private location: Location
  ) {
    // Register icons
    addIcons({
      'logo-github': logoGithub,
      'open-outline': openOutline,
      'information-circle-outline': informationCircleOutline,
      'document-text-outline': documentTextOutline,
      'lock-closed-outline': lockClosedOutline
    });
  }

  ionViewWillEnter() {
    this.viewModel.logoClickCount = 0;
    this.viewModel.applicationName = this.config.values.ApplicationName;
    this.viewModel.versionString = this.config.values.AppVersion;
    this.viewModel.timestamp = this.config.buildTimestamp;
    this.viewModel.commitShortSha = this.config.commitShortSha;
  }

  logoClick(): void {
    this.viewModel.logoClickCount++;

    if (this.viewModel.logoClickCount === 5) {
      this.ui.alert('Development Mode Activated', 'You\'ve unlocked developer mode!');
    }
  }

  visitWebsite(): void {
    window.open(this.config.values.WebSiteUrl, '_system');
  }

  viewTermsOfUse(): void {
    window.open(this.config.values.TermsOfServiceUrl, '_system');
  }

  viewPrivacyPolicy(): void {
    window.open(this.config.values.PrivacyPolicyUrl, '_system');
  }

  openSource(): void {
    window.open(this.config.values.OpenSourceUrl, '_system');
  }
}