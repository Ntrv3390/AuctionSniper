import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device, DeviceInfo } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';

export interface DeviceModel {
  native: boolean;
  virtual: boolean;
  manufacturer: string;
  model: string;
  platform: string;
  uuid: string;
  osVersion: string;
  nativeAppVersion: string;
  nativeAppBuildVersion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private _device: DeviceModel | null = null;
  private _networkStatus: Awaited<ReturnType<typeof Network.getStatus>> | null = null;

  constructor() {}

  async initialize(): Promise<void> {
    try {
      const deviceInfo: DeviceInfo = await Device.getInfo();
      const deviceId = await Device.getId();
      const appInfo = await App.getInfo();

      this._device = {
        native: Capacitor.isNativePlatform(),
        virtual: deviceInfo.isVirtual ?? false,
        manufacturer: deviceInfo.manufacturer ?? 'Unknown',
        model: deviceInfo.model ?? 'Unknown',
        platform: deviceInfo.platform ?? 'Unknown',
        uuid: deviceId.identifier ?? 'Unknown',
        osVersion: deviceInfo.osVersion ?? 'Unknown',
        nativeAppVersion: appInfo.version ?? 'Unknown!',
        nativeAppBuildVersion: appInfo.build ?? 'Unknown!',
      };
    } catch (error: unknown) {
      console.error('Failed to get device info', error);
      this._device = {
        native: Capacitor.isNativePlatform(),
        virtual: false,
        manufacturer: 'Unknown',
        model: 'Unknown',
        platform: 'Unknown',
        uuid: 'Unknown',
        osVersion: 'Unknown',
        nativeAppVersion: 'Unknown',
        nativeAppBuildVersion: 'Unknown',
      };
    }

    try {
      this._networkStatus = await Network.getStatus();

      Network.addListener('networkStatusChange', (status) => {
        this._networkStatus = status;
      });
    } catch (error: unknown) {
      console.error('Failed to get network status', error);
      this._networkStatus = null;
    }
  }

  get native(): boolean {
    return Capacitor.isNativePlatform();
  }

  get tablet(): boolean {
    return this.iPad || this.androidTablet;
  }

  get android(): boolean {
    return this.native
      ? this._device?.platform === 'android'
      : this.userAgent.includes('Android');
  }

  get androidTablet(): boolean {
    return this.android && this.userAgent.includes('Android') && !this.userAgent.includes(' Mobile ');
  }

  get iOS(): boolean {
    return this.native
      ? this._device?.platform === 'ios'
      : /iPhone|iPad|iPod/.test(this.userAgent);
  }

  get iPhone(): boolean {
    return this.native
      ? this._device?.model === 'iPhone'
      : this.userAgent.includes('iPhone;');
  }

  get iPad(): boolean {
    return this.native
      ? this._device?.model === 'iPad'
      : this.userAgent.includes('iPad;');
  }

  get iPod(): boolean {
    return this.native
      ? this._device?.model === 'iPod'
      : this.userAgent.includes('iPod;');
  }

  get device(): DeviceModel | null {
    return this._device;
  }

  get viewport(): { width: number; height: number } {
    const e: any = window;
    let a = 'inner';
    if (!('innerWidth' in window)) {
      a = 'client';
    }
    return { width: e[a + 'Width'], height: e[a + 'Height'] };
  }

  get userAgent(): string {
    return window.navigator.userAgent;
  }

  get hasInternetConnection(): boolean {
    return this._networkStatus?.connected ?? false;
  }

  get hasWiFiConnection(): boolean {
    return this.hasInternetConnection &&
           this._networkStatus?.connectionType === 'wifi';
  }
}
