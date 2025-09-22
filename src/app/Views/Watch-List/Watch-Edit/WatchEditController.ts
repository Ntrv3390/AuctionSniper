import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonToggle,
  IonSpinner
} from '@ionic/angular/standalone';
import { PluginsService } from 'src/app/services/Plugins';
import { UIService } from 'src/app/services/UI';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { DataSourceService } from 'src/app/services/DataSource';
import { TrackerService } from 'src/app/services/Tracker';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-watch-edit',
  templateUrl: './watch-edit.page.html',
  styleUrls: ['./watch-edit.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonToggle,
    IonSpinner
  ]
})
export class WatchEditController implements OnInit {
  viewModel: any = {
    isEditMode: false,
    watch: {
      Id: null,
      itemnumber: '',
      title: '',
      watchQuantity: 1,
      watchPrice: '',
      comment: '',
      folderId: 1,
      notify: true
    },
    isLoading: false,
    error: null
  };

  constructor(
    private route: ActivatedRoute,
    private plugins: PluginsService,
    private ui: UIService,
    private auctionSniperApi: AuctionSniperApiService,
    private dataSource: DataSourceService,
    private tracker: TrackerService,
    private location: Location
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.viewModel.isEditMode = true;
      this.loadWatch(id);
    } else {
      const itemNumber = this.route.snapshot.queryParamMap.get('itemNumber');
      if (itemNumber) {
        this.viewModel.watch.itemnumber = itemNumber;
      }
      this.viewModel.isEditMode = false;
    }
  }

  async loadWatch(id: string) {
    this.viewModel.isLoading = true;
    try {
      // Find in existing watches first
      const watch = this.dataSource.watches?.find(w => w.WID.toString() === id);
      if (watch) {
        this.populateWatchData(watch);
      } else {
        // If not found, fetch from API
        const result = await firstValueFrom(this.auctionSniperApi.getWatchList(false));
        if (result.success) {
          const foundWatch = result.watches?.find(w => w.WID.toString() === id);
          if (foundWatch) {
            this.populateWatchData(foundWatch);
          } else {
            this.ui.showErrorSnackbar('Watch not found');
            this.location.back();
          }
        }
      }
    } catch (error) {
      console.error('Error loading watch:', error);
      this.ui.showErrorSnackbar('Failed to load watch details');
      this.location.back();
    } finally {
      this.viewModel.isLoading = false;
    }
  }

  private populateWatchData(watch: AuctionSniperApiTypes.Watch) {
    this.viewModel.watch = {
      Id: watch.WID,
      itemnumber: watch.itemnumber,
      title: watch.title,
      watchQuantity: watch.quantity,
      watchPrice: watch.watchPrice,
      comment: watch.comment,
      folderId: watch.folderid,
      notify: true // Default to true since there's no notify property in the Watch interface
    };
  }

  async saveWatch() {
    await this.plugins.keyboard.hide();
    
    if (!this.validateForm()) {
      return;
    }

    this.viewModel.isLoading = true;
    
    try {
      if (this.viewModel.isEditMode) {
        // For edit mode, we'll delete the existing watch and create a new one
        // since there's no update API endpoint
        await this.deleteAndRecreateWatch();
      } else {
        await this.createWatch();
      }
    } catch (error) {
      console.error('Error saving watch:', error);
      this.ui.showErrorSnackbar(`Failed to ${this.viewModel.isEditMode ? 'update' : 'create'} watch`);
    } finally {
      this.viewModel.isLoading = false;
    }
  }

  private async deleteAndRecreateWatch() {
    this.tracker.track(TrackerConstants.Watch.RemoveWatch);
    
    // First delete the existing watch
    const deleteResult = await firstValueFrom(this.auctionSniperApi.deleteWatch(this.viewModel.watch.Id));
    
    if (deleteResult.success) {
      // Then create a new watch with updated data
      const createParams: AuctionSniperApiTypes.CreateWatchParameters = {
        itemNumber: this.viewModel.watch.itemnumber,
        watchQuantity: this.viewModel.watch.watchQuantity,
        watchPrice: this.viewModel.watch.watchPrice,
        folderId: this.viewModel.watch.folderId,
        comment: this.viewModel.watch.comment && this.viewModel.watch.comment.trim().length > 0 
          ? this.viewModel.watch.comment.trim() 
          : undefined
      };

      const createResult = await firstValueFrom(this.auctionSniperApi.createWatch(createParams));
      
      if (createResult.success) {
        this.ui.showSuccessSnackbar('Watch updated successfully!');
        // Update in dataSource if it exists
        if (this.dataSource.watches) {
          const index = this.dataSource.watches.findIndex(w => w.WID === this.viewModel.watch.Id);
          if (index !== -1) {
            this.dataSource.watches.splice(index, 1);
          }
          this.dataSource.watches.push(createResult.watches[0]);
        }
        this.location.back();
      } else {
        this.ui.showErrorSnackbar('Failed to update watch: ' + (createResult.message || 'Unknown error'));
      }
    } else {
      this.ui.showErrorSnackbar('Failed to update watch: ' + (deleteResult.message || 'Unknown error'));
    }
  }

  private async createWatch() {
    this.tracker.track(TrackerConstants.Watch.AddWatch);
    
    const params: AuctionSniperApiTypes.CreateWatchParameters = {
      itemNumber: this.viewModel.watch.itemnumber,
      watchQuantity: this.viewModel.watch.watchQuantity,
      watchPrice: this.viewModel.watch.watchPrice,
      folderId: this.viewModel.watch.folderId,
      comment: this.viewModel.watch.comment && this.viewModel.watch.comment.trim().length > 0 
        ? this.viewModel.watch.comment.trim() 
        : undefined
    };

    const result = await firstValueFrom(this.auctionSniperApi.createWatch(params));
    
    if (result.success) {
      this.ui.showSuccessSnackbar('Watch added successfully!');
      if (this.dataSource.watches) {
        this.dataSource.watches.push(result.watches[0]);
      }
      this.location.back();
    } else {
      this.ui.showErrorSnackbar('Failed to add watch: ' + (result.message || 'Unknown error'));
    }
  }

  private validateForm(): boolean {
    if (!this.viewModel.watch.itemnumber) {
      this.ui.showInfoSnackbar('Item number is required');
      return false;
    }
    
    if (!this.viewModel.watch.watchQuantity || this.viewModel.watch.watchQuantity <= 0) {
      this.ui.showInfoSnackbar('Quantity must be greater than 0');
      return false;
    }
    
    if (this.viewModel.watch.watchPrice && parseFloat(this.viewModel.watch.watchPrice) < 0) {
      this.ui.showInfoSnackbar('Max offer cannot be negative');
      return false;
    }
    
    return true;
  }

  cancel() {
    this.location.back();
  }

  async deleteWatch() {
    if (!this.viewModel.isEditMode) return;
    
    const confirmed = await this.ui.confirm('Are you sure you want to delete this watch?');
    if (!confirmed) return;
    
    this.tracker.track(TrackerConstants.Watch.RemoveWatch);
    
    try {
      const result = await firstValueFrom(this.auctionSniperApi.deleteWatch(this.viewModel.watch.Id));
      
      if (result.success) {
        this.ui.showSuccessSnackbar('Watch deleted successfully!');
        // Remove from dataSource if it exists
        if (this.dataSource.watches) {
          const index = this.dataSource.watches.findIndex(w => w.WID === this.viewModel.watch.Id);
          if (index !== -1) {
            this.dataSource.watches.splice(index, 1);
          }
        }
        this.location.back();
      } else {
        this.ui.showErrorSnackbar('Failed to delete watch: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting watch:', error);
      this.ui.showErrorSnackbar('Failed to delete watch');
    }
  }
}