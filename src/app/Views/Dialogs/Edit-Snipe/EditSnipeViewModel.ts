export class EditSnipeViewModel {
  manualEntry: boolean;
  id: number;
  itemNumber: string;
  title: string;
  leadTime: string;
  maximumBid: string;
  bidEnhancement: string;
  currentPrice: string;
  comment: string;
  addShippingInsurance: any;
  showAddShippingInsurance: boolean;
  showAddComment: boolean;

  constructor(init?: Partial<EditSnipeViewModel>) {
    this.manualEntry = init?.manualEntry ?? false;
    this.id = init?.id ?? 0;
    this.itemNumber = init?.itemNumber ?? '';
    this.title = init?.title ?? '';
    this.leadTime = init?.leadTime ?? '';
    this.maximumBid = init?.maximumBid ?? '';
    this.bidEnhancement = init?.bidEnhancement ?? '';
    this.currentPrice = init?.currentPrice ?? '';
    this.comment = init?.comment ?? '';
    this.addShippingInsurance = init?.addShippingInsurance ?? false;
    this.showAddShippingInsurance = init?.showAddShippingInsurance ?? false;
    this.showAddComment = init?.showAddComment ?? false;
  }
}
