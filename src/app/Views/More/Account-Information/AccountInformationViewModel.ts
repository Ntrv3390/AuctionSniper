
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { KeyValuePair } from 'src/app/Interfaces/key-value-pair.interface';

export class AccountInformationViewModel {
  showError: boolean = false;
  accountInfo!: AuctionSniperApiTypes.AccountInformation;
  newPassword: string = '';
  confirmNewPassword: string = '';
  countries: KeyValuePair<number, string>[] = [];
}
