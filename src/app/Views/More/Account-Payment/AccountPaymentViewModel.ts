
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

export class AccountPaymentViewModel {
  showError: boolean = false;
  paymentInfo: AuctionSniperApiTypes.PaymentInformation = {
    Balance: 0,
    Credits: 0,
    UnpaidWinSnipesTotal: 0,
    UnpaidShippingInsuranceTotal: 0,
    UnpaidInvoicesTotal: 0
  };
}
