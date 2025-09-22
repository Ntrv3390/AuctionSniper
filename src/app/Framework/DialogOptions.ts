export class DialogOptions<D = any, R = any> {
    dialogData: D;
    backdropClickToClose: boolean;
    hardwareBackButtonClose: boolean;
    showBackground: boolean;
  
    constructor(dialogData?: D) {
      this.dialogData = dialogData as D;
      this.backdropClickToClose = false;
      this.hardwareBackButtonClose = true;
      this.showBackground = true;
    }
  }
  