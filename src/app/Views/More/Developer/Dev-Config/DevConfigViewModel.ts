// src/app/view-models/dev-config-viewmodel.ts

export class DevConfigViewModel {
    isDebug: boolean = false;
    buildTimestamp: string = '';
    buildCommit: string = '';
  
    overriddenKeys: { [key: string]: boolean } = {};
    enableResetButton: boolean = false;
  
    apiUrl: string = '';
    webSiteUrl: string = '';
    debugLoggingUrl: string = '';
    enableIosLoggingInDistributionBuilds: boolean = false;
  
    usePaypalSandbox: boolean = false;
  
    enableAds: boolean = false;
  
    rawAppConfig: string = '';
    showAppConfig: boolean = false;
  
    constructor(init?: Partial<DevConfigViewModel>) {
      Object.assign(this, init);
    }
  }
  