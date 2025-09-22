export class PinEntryViewModel {
    pin: string;
    pinToMatch: string;
    showBackButton: boolean;
    promptText: string;
  
    constructor(
      pin: string = '',
      pinToMatch: string = '',
      showBackButton: boolean = false,
      promptText: string = ''
    ) {
      this.pin = pin;
      this.pinToMatch = pinToMatch;
      this.showBackButton = showBackButton;
      this.promptText = promptText;
    }
  }
  