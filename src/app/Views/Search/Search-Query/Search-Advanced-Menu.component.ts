import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopoverController } from '@ionic/angular/standalone';
import {
  IonItem,
  IonLabel,
  IonRadio,
  IonRadioGroup,
  IonButton,
  IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-search-advanced-menu',
  templateUrl: './Search-Advanced-Menu.html',
  styleUrls: ['./Search-Advanced-Menu.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonItem,
    IonLabel, 
    IonRadio,
    IonRadioGroup,
    IonButton,
    IonContent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchAdvancedMenu implements OnInit {
  @Input() viewModel: any;
  @Input() Localization: any;
  @Input() locationClick: () => void = () => {};
  @Input() countryClick: () => void = () => {};

  // Local variables to hold the selected values
  selectedLocatedIn: boolean = false;
  selectedCountry: number = 1;

  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit(): void {
    // Ensure the radio buttons reflect the current filter settings
    if (this.viewModel) {
      // Set local variables to match the viewModel values
      this.selectedLocatedIn = this.viewModel.isLocatedIn !== undefined ? this.viewModel.isLocatedIn : false;
      this.selectedCountry = this.viewModel.country || 1;
      
      // Also ensure the viewModel has proper values
      this.viewModel.isLocatedIn = this.selectedLocatedIn;
      this.viewModel.country = this.selectedCountry;
    }
  }

  advancedPopover_hide(): void {
    this.popoverCtrl.dismiss();
  }
}
