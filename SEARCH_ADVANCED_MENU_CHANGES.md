# Search Advanced Menu - Radio Button Selection Fix

## Problem
The radio buttons in the SearchAdvancedMenu were not showing as selected when filters were already applied. Users would see the default selection instead of the currently applied filters.

## Solution
Enhanced the SearchAdvancedMenu component to ensure that radio buttons properly reflect the current filter settings when the component is initialized by explicitly setting the `checked` attribute on the radio buttons.

## Changes Made

### 1. Enhanced Component Initialization
Modified `src/app/Views/Search/Search-Query/Search-Advanced-Menu.component.ts` to add proper initialization logic:

```typescript
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
```

### 2. Updated HTML Template
Modified `src/app/Views/Search/Search-Query/Search-Advanced-Menu.html` to explicitly set the `checked` attribute on radio buttons:

```html
<!-- Located In options -->
<ion-radio-group [(ngModel)]="viewModel.isLocatedIn" (ionChange)="locationClick()">
  <ion-item>
    <ion-radio slot="start" [value]="false" [checked]="viewModel.isLocatedIn === false"></ion-radio>
    <ion-label>{{ Localization.Search.Advanced.Available }}</ion-label>
  </ion-item>
  <ion-item>
    <ion-radio slot="start" [value]="true" [checked]="viewModel.isLocatedIn === true"></ion-radio>
    <ion-label>{{ Localization.Search.Advanced.Located }}</ion-label>
  </ion-item>
</ion-radio-group>

<!-- Country options -->
<ion-radio-group [(ngModel)]="viewModel.country" (ionChange)="countryClick()">
  <ion-item>
    <ion-radio slot="start" [value]="1" [checked]="viewModel.country === 1"></ion-radio>
    <ion-label>{{ Localization.Search.Advanced.USA }}</ion-label>
  </ion-item>
  <!-- ... other country options with similar [checked] attributes ... -->
</ion-radio-group>
```

## How It Works
The component now ensures that:
1. When the advanced menu is opened, the radio buttons correctly reflect the currently applied filters
2. The `checked` attribute is explicitly set based on the current filter values
3. The existing `[(ngModel)]` binding continues to work for handling changes

## Testing Instructions

1. Open the application and navigate to the search page
2. Apply some filters using the advanced search menu:
   - Select "Located in Country" instead of "Available to Country"
   - Select a country other than USA (the default)
3. Close the advanced search menu
4. Reopen the advanced search menu
5. Verify that:
   - The previously selected "Located in Country" radio button is filled
   - The previously selected country radio button is filled
6. Try different combinations of filters and verify they are correctly reflected when reopening the menu

## Technical Details
The fix works by explicitly setting the `checked` attribute on each radio button based on the current filter values. This ensures that when the component is dynamically created (as a popover), the radio buttons immediately reflect the correct state rather than relying solely on the `[(ngModel)]` binding which might have timing issues during component initialization.

The implementation maintains backward compatibility and doesn't change any existing functionality.