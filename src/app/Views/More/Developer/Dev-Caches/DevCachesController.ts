import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BaseDevController } from 'src/app/Views/More/Developer/BaseDevController'; // Adjust path
import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';
import { DataSourceService } from 'src/app/services/DataSource';
import { EmptyViewModel } from 'src/app/Framework/EmptyViewModel';
import { NavigatorService } from 'src/app/services/Navigator';
import { Utilities } from 'src/app/services/Utilities';

@Component({
  selector: 'app-dev-caches',
  templateUrl: './dev-caches.page.html',
  styleUrls: ['./dev-caches.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevCachesController extends BaseDevController<EmptyViewModel> {
  constructor(
    navigator: NavigatorService,
    utilities: Utilities,
    protected override ui: UIService,
    protected override plugins: PluginsService,
    private dataSource: DataSourceService
  ) {
    super(EmptyViewModel, navigator, utilities, ui, plugins);
  }

  // Controller Events
  clearCache_click(cacheName: string): void {
    let cacheCleared = false;

    switch (cacheName) {
      case 'all':
        this.dataSource.clear();
        cacheCleared = true;
        break;
      case 'searchResults':
        this.dataSource.clearSearchResults();
        cacheCleared = true;
        break;
      case 'deals':
        this.dataSource.clearSearchResults();
        cacheCleared = true;
        break;
      case 'watches':
        this.dataSource.clearWatches();
        cacheCleared = true;
        break;
      case 'wins':
        this.dataSource.clearWins();
        cacheCleared = true;
        break;
      case 'itemDetail':
        this.dataSource.clearDetail();
        cacheCleared = true;
        break;
      case 'snipes':
        this.dataSource.clearSnipes();
        cacheCleared = true;
        break;
      case 'savedSearches':
        this.dataSource.clearSavedSearches();
        cacheCleared = true;
        break;
      default:
        break;
    }

    if (cacheCleared) {
      this.ui.showSuccessSnackbar('Cache cleared!');
    }
  }
}
