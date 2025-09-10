import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonRefresher, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonList, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';
import { DataSourceService } from 'src/app/services/DataSource'; // migrated DataSource
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface'; // your model

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.page.html',
  styleUrls: ['./search-list.page.scss'],
  standalone: true,
  imports: [
    IonRefresher,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    NgFor
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchListController implements OnInit {
  viewModel = {
    isRefreshing: false,
    searches: [] as AuctionSniperApiTypes.SparseSavedSearch[]
  };

  constructor(
    private dataSource: DataSourceService,
    private router: Router
  ) {}

  ngOnInit() {
    // Replace view_beforeEnter
    this.ionViewWillEnter();
  }

  /**
   * Ionic 7 lifecycle hook (replaces view_beforeEnter)
   */
  ionViewWillEnter(): void {
    this.refresh(false);
  }

  /**
   * Increments badge counter for the given tab.
   * @param refreshFromServer if true, fetch fresh data from server
   */
  private refresh(refreshFromServer: boolean): void {
    this.viewModel.isRefreshing = true;

    if (refreshFromServer || !this.dataSource.savedSearches) {
      this.dataSource.retrieveSavedSearches().then((results: AuctionSniperApiTypes.SparseSavedSearch[]) => {
        this.viewModel.searches = results;
        this.viewModel.isRefreshing = false;
      }).catch((error) => {
        console.error('Error retrieving saved searches:', error);
        this.viewModel.isRefreshing = false;
        // Keep existing searches if available, or set to empty array
        if (!this.viewModel.searches) {
          this.viewModel.searches = [];
        }
      });
    } else {
      this.viewModel.searches = this.dataSource.savedSearches;
      this.viewModel.isRefreshing = false;
    }
  }

  /**
   * Event handler for Ionic refresher (pull-to-refresh).
   */
  protected refresher_refresh(event?: CustomEvent): void {
    this.refresh(true);

    // complete refresher UI when done
    setTimeout(() => {
      if (event?.target) {
        (event.target as any).complete();
      }
    }, 500); // small delay to allow refresh
  }

  /**
   * Execute a saved search when clicked
   */
  protected savedSearchItem_click(savedSearch: AuctionSniperApiTypes.SparseSavedSearch): void {
    // Navigate to the search query page with the saved search parameters
    this.router.navigate(['/root/search'], {
      queryParams: {
        searchId: savedSearch.Id,
        searchTerms: savedSearch.AllWords,
        searchTitle: savedSearch.Title
      }
    });
  }
}
