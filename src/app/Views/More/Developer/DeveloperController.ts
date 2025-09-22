import { UIService } from 'src/app/services/UI';
import { PluginsService } from 'src/app/services/Plugins';
import { BaseDevController } from './BaseDevController';
import { EmptyViewModel } from 'src/app/Framework/EmptyViewModel';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';
import { NavigatorService } from 'src/app/services/Navigator';
import { Utilities } from 'src/app/services/Utilities';

@Component({
  selector: 'app-developer',
  templateUrl: './Developer.html',
  styleUrls: ['./Developer.scss'], // Fixed path
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  ]
})
export class DeveloperController extends BaseDevController<EmptyViewModel> implements OnInit {

  //#region Injection

  constructor(
    protected UI: UIService,
    protected Plugins: PluginsService,
    protected Navigator: NavigatorService,
    protected Utilities: Utilities
  ) {
    super(EmptyViewModel, Navigator, Utilities, UI, Plugins);
  }


  //#endregion

  ngOnInit(): void {
    // same as AngularJS controller constructor init
  }
}
