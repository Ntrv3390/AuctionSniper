import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';
import { PreferencesService } from 'src/app/services/Preferences';
import { DevUserViewModel } from './DevUserViewModel';

@Component({
  selector: 'app-dev-user',
  templateUrl: './dev-user.component.html',
  styleUrls: ['./dev-user.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DevUserController implements OnInit {
  viewModel = new DevUserViewModel();

  constructor(
    protected UI: UIService,
    protected Plugins: PluginsService,
    private Preferences: PreferencesService,
  ) {}

  ngOnInit(): void {
    this.viewModel.userUid = this.Preferences.userUid;
    this.viewModel.userId = this.Preferences.userId;
    this.viewModel.userEmail = this.Preferences.userEmail;
    this.viewModel.authToken = this.Preferences.token;
    this.viewModel.winsCount = this.Preferences.winsCount;
    this.viewModel.hasPromptedForReview = this.Preferences.hasPromptedForReview;
  }
}
