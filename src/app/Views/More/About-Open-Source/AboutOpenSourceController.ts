import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: 'app-about-open-source',
  templateUrl: './About-Open-Source.html',
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AboutOpenSourceComponent implements OnInit {
  items: KeyValuePair[] = [];

  constructor() {}

  ngOnInit(): void {
    this.items = [
      { key: 'Ionic', value: 'https://github.com/driftyco/ionic/blob/master/LICENSE' },
      { key: 'Capacitor', value: 'https://github.com/ionic-team/capacitor/blob/master/LICENSE' },
      { key: 'Ionic-TypeScript-Starter', value: 'https://github.com/Justin-Credible/Ionic-TypeScript-Starter/blob/master/LICENSE' },
      { key: 'Lodash', value: 'https://github.com/lodash/lodash/blob/master/LICENSE' },
      { key: 'Moment', value: 'https://github.com/moment/moment/blob/develop/LICENSE' },
      { key: 'uri.js', value: 'https://github.com/medialize/URI.js/blob/gh-pages/LICENSE.txt' },
      { key: 'angular-mocks', value: 'https://github.com/angular/bower-angular-mocks' },
      { key: 'async', value: 'https://github.com/caolan/async/blob/master/LICENSE' },
      { key: 'Dark Sharp Edges (no changes)', value: 'http://subtlepatterns.com/dark-sharp-edges/' },
      { key: 'Font Awesome', value: 'http://fortawesome.github.io/Font-Awesome/license/' },
    ];
  }

  async visitWebsite(url: string): Promise<void> {
    await Browser.open({ url });
  }
}
