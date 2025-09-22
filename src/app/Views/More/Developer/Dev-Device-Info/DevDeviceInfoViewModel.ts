export class DevDeviceInfoViewModel {
    deviceNative!: boolean;
    deviceVirtual!: boolean;
    deviceManufacturer!: string;
    deviceModel!: string;
    devicePlatform!: string;
    deviceOsVersion!: string;
    deviceUuid!: string;
    deviceNativeAppVersion!: string;
    deviceNativeAppBuildVersion!: string;
  
    navigatorPlatform!: string;
    navigatorProduct!: string;
    navigatorVendor!: string;
    viewport!: { width: number; height: number };
    userAgent!: string;
  
    detectedAsTablet!: boolean;
    detectedAsAndroid!: boolean;
    detectedAsAndroidTablet!: boolean;
    detectedAsIOS!: boolean;
    detectedAsIPhone!: boolean;
    detectedAsIPad!: boolean;
    detectedAsIPod!: boolean;
  
    constructor(init?: Partial<DevDeviceInfoViewModel>) {
      Object.assign(this, init);
    }
  }
  