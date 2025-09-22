import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBackButton,
  IonButtons,
  IonText,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { PluginsService } from 'src/app/services/Plugins';
import { UIService } from 'src/app/services/UI';
import { DataSourceService } from 'src/app/services/DataSource';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { TrackerService } from 'src/app/services/Tracker';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-search-edit',
  templateUrl: './search-edit.page.html',
  styleUrls: ['./search-edit.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonBackButton,
    IonButtons,
    IonText,
    FormsModule,
    NgIf,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SearchEditController implements OnInit {
  viewModel: any = {
    search: null as AuctionSniperApiTypes.SparseSavedSearch | null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plugins: PluginsService,
    private ui: UIService,
    private dataSource: DataSourceService,
    private auctionSniperApi: AuctionSniperApiService,
    private tracker: TrackerService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const keywords = this.route.snapshot.paramMap.get('keywords');

    if (id && id !== '0') {
      this.auctionSniperApi.retrieveSavedSearch(id).subscribe((result) => {
        if (result.success) {
          this.viewModel.search = result.search;
        }
      });
    } else {
      this.viewModel.search = {
        Page: null,
        Id: null,
        Title: keywords || '',
        AllWords: keywords || '',
        ExcludeWords: null,
        PriceMin: null,
        PriceMax: null,
        Currency: null,
        Category: null,
        PageKey: null,
      };
    }

    // prevent global navigation title override
    if (this.dataSource) {
      this.dataSource.searchTitle = null;
    }
  }

  async save_click(): Promise<void> {
    this.plugins.keyboard.hide();
    const isUpdate = !!(this.viewModel.search && this.viewModel.search.Id);
    this.tracker.track(
      isUpdate
        ? TrackerConstants.Search.UpdateSavedSearch
        : TrackerConstants.Search.CreateSavedSearch
    );

    if (isUpdate && this.viewModel.search) {
      const result = await firstValueFrom(
        this.auctionSniperApi.saveSearch(this.viewModel.search)
      );
      if (result.success) {
        this.viewModel.search = result.search;
        if (this.dataSource.savedSearches) {
          const idx = this.dataSource.savedSearches.findIndex(
            (s) => s.Id === result.search.Id
          );
          if (idx !== -1) {
            this.dataSource.savedSearches.splice(idx, 1, result.search);
          }
        }
        this.ui.showSuccessSnackbar('Search Saved');
        this.dataSource.clearSearchResults();
        this.dataSource.searchId = result.search.Id;
        this.dataSource.searchTitle = result.search.Title;
        this.goBack();
      }
    } else if (this.viewModel.search) {
      this.viewModel.search.Id = 0;
      this.viewModel.search.Currency = '0';
      this.viewModel.search.Page = 0;
      const result = await firstValueFrom(
        this.auctionSniperApi.createSearch(this.viewModel.search)
      );
      if (result.success) {
        this.viewModel.search = result.search;
        this.dataSource.savedSearches?.push(result.search);
        this.ui.showSuccessSnackbar('Search Created');
        this.dataSource.clearSearchResults();
        this.dataSource.searchId = result.search.Id;
        this.dataSource.searchTitle = result.search.Title;
        this.goBack();
      }
    }
  }

  async delete_click(): Promise<void> {
    if (!this.viewModel.search) return;

    this.plugins.keyboard.hide();
    const confirmed = await this.ui.confirm(
      'Are you sure you want to delete this saved search?'
    );
    if (!confirmed) return;
    this.tracker.track(TrackerConstants.Search.DeleteSavedSearch);

    const result = await firstValueFrom(
      this.auctionSniperApi.deleteSearch(this.viewModel.search)
    );
    if (result.success) {
      const idx = this.dataSource.savedSearches?.findIndex(
        (s) => s.Id === this.viewModel.search?.Id
      );
      if (
        typeof idx === 'number' &&
        idx !== -1 &&
        this.dataSource.savedSearches
      ) {
        this.dataSource.savedSearches.splice(idx, 1);
      }
      this.ui.showSuccessSnackbar('Search Deleted');
      this.dataSource.searchId = 0;
      this.goBack();
    }
  }

  goBack(): void {
    // Try to go back in history first
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // Fallback to navigate to search list
      this.router.navigate(['/root/search']);
    }
  }
}
