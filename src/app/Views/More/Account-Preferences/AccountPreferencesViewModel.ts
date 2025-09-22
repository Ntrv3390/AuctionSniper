import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

export class AccountPreferencesViewModel {
  showError: boolean = false;
  isLoading: boolean = true;
  preferences: AuctionSniperApiTypes.Preferences = {
    Delay: 5,
    DefaultShowShipInsurance: false,
    DefaultShipInsureAll: false,
    ShowSnipeComment: false,
    Thumb: false,
    Timezone: 0,
    TimezoneDST: false
  };
}
