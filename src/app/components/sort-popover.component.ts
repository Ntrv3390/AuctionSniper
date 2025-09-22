import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IonList, IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'app-sort-popover',
  standalone: true,
  imports: [IonList, IonItem],
  styles: [`
    .sort-popover {
      min-width: 200px;
      padding: 8px 0;
    }
    
    ion-item {
      --min-height: 44px;
      font-size: 15px;
      cursor: pointer;
    }
    
    ion-item:hover {
      --background: var(--ion-color-light);
    }
  `],
  template: `
    <div class="sort-popover">
      <ion-list>
        <ion-item button (click)="selectSort('MetaEndSort')">Ending Soonest</ion-item>
        <ion-item button (click)="selectSort('MetaNewSort')">Newly Listed</ion-item>
        <ion-item button (click)="selectSort('PriceAndShippingLowestFirst')">Price + Shipping: lowest first</ion-item>
        <ion-item button (click)="selectSort('PriceAndShippingHighestFirst')">Price + Shipping: highest first</ion-item>
      </ion-list>
    </div>
  `
})
export class SortPopover {
  constructor(private popoverCtrl: PopoverController) {}

  selectSort(sortType: string) {
    // Popover close thai ne selected value parent ne mokli devay chhe
    this.popoverCtrl.dismiss({ selectedSort: sortType });
  }
}