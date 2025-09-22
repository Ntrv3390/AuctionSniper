// src/app/view-models/more-list.viewmodel.ts

export class MoreListViewModel {
    isDebugMode = false;
    isDeveloperMode = false;
    showLogout = false;
    userName = '';
    showRegisterReminder = false;
  
    constructor(init?: Partial<MoreListViewModel>) {
      Object.assign(this, init);
    }
  }
  