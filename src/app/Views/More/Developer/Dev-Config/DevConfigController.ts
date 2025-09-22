import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonItemDivider,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonToggle
} from '@ionic/angular/standalone';
import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';
import { PlatformService } from 'src/app/services/Platform';
import { ConfigurationService } from 'src/app/services/Configuration';
import { DevConfigViewModel } from './DevConfigViewModel';

@Component({
  selector: 'app-dev-config',
  templateUrl: './Dev-Config.html',
  styleUrls: ['./dev-config.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonItemDivider,
    IonIcon,
    IonItem,
    IonLabel,
    IonNote,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonToggle
  ]
})
export class DevConfigComponent implements OnInit {
  viewModel = new DevConfigViewModel();

  constructor(
    private ui: UIService,
    private plugins: PluginsService,
    private platform: PlatformService,
    private configuration: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.populateViewModel();
  }

  async resetAll_click(): Promise<void> {
    const message = 'Reset environment modifications and return to the defaults?';
    const confirmed = await this.ui.confirm(message);
    if (confirmed) {
      this.resetEnvironment();
      this.ui.showSuccessSnackbar('Overrides cleared!');
    }
  }

  apiUrl_click(): void {
    const message = 'Here you can edit the API URL to override the build configuration.';
    if (this.platform.native && this.platform.android) {
        this.plugins.clipboard.write({ string: this.configuration.apiUrl });
        this.ui.showInfoSnackbar('Existing URL copied to clipboard.');
      }

    this.ui.prompt(message, 'API URL', this.configuration.apiUrl).then(result => {
      if (!result.cancelled && result.value) {
        this.configuration.apiUrl = result.value;
        this.viewModel.apiUrl = result.value;
        this.ui.showSuccessSnackbar('API URL changed');
      }
    });
  }

  webSiteUrl_click(): void {
    const message = 'Here you can edit the website URL to override the build configuration.';
    if (this.platform.native && this.platform.android) {
      this.plugins.clipboard.write({ string: this.configuration.webSiteUrl });
      this.ui.showInfoSnackbar('Existing URL copied to clipboard.');
    }

    this.ui.prompt(message, 'Website URL', this.configuration.webSiteUrl).then(result => {
      if (!result.cancelled && result.value) {
        this.configuration.webSiteUrl = result.value;
        this.viewModel.webSiteUrl = result.value;
        this.ui.showSuccessSnackbar('Web URL changed');
      }
    });
  }

  debugLoggingUrl_click(): void {
    const message = 'Here you can edit the external debug logging URL to override the build configuration.';
    if (this.platform.native && this.platform.android) {
      this.plugins.clipboard.write({ string: this.configuration.debugLoggingUrl });
      this.ui.showInfoSnackbar('Existing URL copied to clipboard.');
    }

    this.ui.prompt(message, 'Debug Logging URL', this.configuration.debugLoggingUrl).then(result => {
      if (result.cancelled) {
        return;
      }
      this.configuration.debugLoggingUrl = result.value || null;
      this.viewModel.debugLoggingUrl = this.configuration.debugLoggingUrl;
      this.ui.showSuccessSnackbar('Debug Logging URL changed');
    });
  }

  enableIosLoggingInDistributionBuilds_change(): void {
    this.configuration.enableIosLoggingInDistributionBuilds = this.viewModel.enableIosLoggingInDistributionBuilds;
  }

  usePaypalSandbox_change(): void {
    this.configuration.usePayPalSandbox = this.viewModel.usePaypalSandbox;
  }

  enableAds_change(): void {
    this.configuration.adsEnabled = this.viewModel.enableAds;
  }

  toggleShowAppConfig_click(): void {
    this.viewModel.showAppConfig = !this.viewModel.showAppConfig;
  }

  private populateViewModel(): void {
    this.viewModel.isDebug = this.configuration.debug;
    this.viewModel.buildTimestamp = this.configuration.buildTimestamp;
    this.viewModel.buildCommit = this.configuration.commitShortSha;

    this.viewModel.apiUrl = this.configuration.apiUrl;
    this.viewModel.webSiteUrl = this.configuration.webSiteUrl;
    this.viewModel.debugLoggingUrl = this.configuration.debugLoggingUrl;
    this.viewModel.enableIosLoggingInDistributionBuilds = this.configuration.enableIosLoggingInDistributionBuilds;

    this.viewModel.usePaypalSandbox = this.configuration.usePayPalSandbox;
    this.viewModel.enableAds = this.configuration.adsEnabled;

    this.viewModel.rawAppConfig = JSON.stringify(this.configuration.values, null, 2);
    this.viewModel.showAppConfig = false;
  }

  private resetEnvironment(): void {
    for (const key of ConfigurationService.OVERRIDE_KEYS) {
      localStorage.removeItem(key);
    }
    this.populateViewModel();
  }

  // Add missing methods
  help_click(message: string) {
    console.log('Help clicked:', message);
    this.ui.showInfoSnackbar(message);
  }

  copyValue_click(value: string, label: string) {
    console.log('Copy value clicked:', label, value);
    if (this.platform.native) {
      this.plugins.clipboard.write({ string: value });
      this.ui.showInfoSnackbar(`${label} copied to clipboard.`);
    }
  }
}
