import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

export class AccountNotificationsViewModel {
  showError: boolean = false;
  isLoading: boolean = false;
  preferences!: AuctionSniperApiTypes.NotificationPreferences;
}
