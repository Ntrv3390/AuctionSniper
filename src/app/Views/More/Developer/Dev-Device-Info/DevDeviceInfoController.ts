import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DevDeviceInfoViewModel } from './DevDeviceInfoViewModel'; // adjust path
import { PlatformService } from 'src/app/services/Platform'; // your Platform abstraction service
import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';

@Component({
  selector: 'app-dev-device-info',
  templateUrl: './dev-device-info.component.html',
  styleUrls: ['./dev-device-info.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevDeviceInfoController implements OnInit {
  public viewModel = new DevDeviceInfoViewModel();

  constructor(
    private platform: PlatformService,
    private ui: UIService,
    private plugins: PluginsService,
    private window: Window // Angular injects native window if configured, else use `@Inject(DOCUMENT)` or `window` global
  ) {}

  ngOnInit(): void {
    this.populateDeviceInfo();
  }

  private populateDeviceInfo(): void {
    this.viewModel.deviceNative = this.platform.device?.native ?? false;
    this.viewModel.deviceVirtual = this.platform.device?.virtual ?? false;
    this.viewModel.deviceManufacturer = this.platform.device?.manufacturer ?? '';
    this.viewModel.deviceModel = this.platform.device?.model ?? '';
    this.viewModel.devicePlatform = this.platform.device?.platform ?? '';
    this.viewModel.deviceOsVersion = this.platform.device?.osVersion ?? '';
    this.viewModel.deviceUuid = this.platform.device?.uuid ?? '';
    this.viewModel.deviceNativeAppVersion = this.platform.device?.nativeAppVersion ?? '';
    this.viewModel.deviceNativeAppBuildVersion = this.platform.device?.nativeAppBuildVersion ?? '';

    this.viewModel.navigatorPlatform = this.window.navigator.platform;
    this.viewModel.navigatorProduct = this.window.navigator.product;
    this.viewModel.navigatorVendor = this.window.navigator.vendor;
    this.viewModel.viewport = this.platform.viewport;
    this.viewModel.userAgent = this.window.navigator.userAgent;

    this.viewModel.detectedAsTablet = this.platform.tablet;
    this.viewModel.detectedAsAndroid = this.platform.android;
    this.viewModel.detectedAsAndroidTablet = this.platform.androidTablet;
    this.viewModel.detectedAsIOS = this.platform.iOS;
    this.viewModel.detectedAsIPhone = this.platform.iPhone;
    this.viewModel.detectedAsIPad = this.platform.iPad;
    this.viewModel.detectedAsIPod = this.platform.iPod;
  }
}
