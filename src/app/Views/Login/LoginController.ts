import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonCheckbox,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';

import { PluginsService } from 'src/app/services/Plugins';
import { UIService } from 'src/app/services/UI';
import { ConfigurationService } from 'src/app/services/Configuration';
import { PreferencesService } from 'src/app/services/Preferences';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';
import { TrackerService } from 'src/app/services/Tracker';
import { NavigatorService } from 'src/app/services/Navigator';
import { Utilities } from 'src/app/services/Utilities';
import { TrackerConstants } from 'src/app/constants/tracker.constants';
import { AuctionSniperApiService } from 'src/app/services/AuctionSniperApi';
import { TimeZoneList } from 'src/app/models/timezone-list.constant';
import { ApiErrorHandlerService } from 'src/app/services/ApiErrorHandler';
import { ToastController } from '@ionic/angular';
import { DataSourceService } from 'src/app/services/DataSource';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { SnipeCacheService } from 'src/app/services/SnipeCacheService';

@Component({
  selector: 'app-login',
  templateUrl: './Login.html',
  styleUrls: ['./Login.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonCheckbox,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardContent,
  ],
})
export class LoginPage implements OnInit {
  form!: FormGroup;
  isSignIn = true;
  versionDisplay = '';
  showDebugOptions = false;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  successMessage = ''; // ✅ new field

  private _versionClickCount = 0;
  timeZoneList = TimeZoneList;

  constructor(
    private fb: FormBuilder,
    private plugins: PluginsService,
    private ui: UIService,
    private configuration: ConfigurationService,
    private preferences: PreferencesService,
    private tracker: TrackerService,
    private navigator: NavigatorService,
    private utilities: Utilities,
    private api: AuctionSniperApiService,
    private errorHandler: ApiErrorHandlerService,
    private toastController: ToastController,
    private dataSource: DataSourceService,
    private cacheService: SnipeCacheService
  ) {
    addIcons({
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
    });
  }

  ngOnInit(): void {
    this.cacheService.clearCache();
    this.setupForm();
    this.versionDisplay = `${this.configuration.values.AppVersion}`;
    this.showDebugOptions =
      this.configuration.debug || this.configuration.enableDeveloperTools;
    this.dataSource.clear();
  }

  setupForm(): void {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: [''],
      email: [''],
      timeZone: [null],
    });

    this.toggleAuthMode(true);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleAuthMode(signIn: boolean): void {
    this.isSignIn = signIn;
    this.form.reset();
    this.successMessage = '';

    if (this.isSignIn) {
      this.form.get('confirmPassword')?.clearValidators();
      this.form.get('email')?.clearValidators();
      this.form.get('timeZone')?.clearValidators();
    } else {
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
      this.form
        .get('email')
        ?.setValidators([Validators.required, Validators.email]);
      this.form.get('timeZone')?.setValidators([Validators.required]);
    }

    this.form.get('confirmPassword')?.updateValueAndValidity();
    this.form.get('email')?.updateValueAndValidity();
    this.form.get('timeZone')?.updateValueAndValidity();
  }

  onForgotPassword(): void {
    const forgotUrl = `https://main1.auctionsniper.com/resetpassword.aspx`;
    window.open(forgotUrl, '_system');
  }

  onCreateAccount(): void {
    if (this.form.invalid) {
      this.successMessage = '';
      this.errorHandler.handleError(
        new Error('Please fill all required fields'),
        'Validation Error',
        true,
        false,
        true
      );
      return;
    }

    const { userId, password, confirmPassword, email, timeZone } =
      this.form.value;

    if (password !== confirmPassword) {
      this.successMessage = '';
      this.errorHandler.handleError(
        new Error('Passwords do not match'),
        'Password Mismatch',
        true,
        false,
        true
      );
      return;
    }

    const params = {
      UserName: userId,
      Password: password,
      Email: email,
      Timezone: timeZone,
      ADID: '',
    };

    this.tracker.track(TrackerConstants.Account.RegisterAccount);
    this.isLoading = true;

    this.api.register(params).subscribe({
      next: (result) => {
        this.isLoading = false;

        if (result.success) {
          this.successMessage = 'Registration successful!';
          setTimeout(() => {
            this.signInAfterRegister(userId, password);
          }, 2500);
        } else {
          this.successMessage = '';
          this.errorHandler.handleApiResult(result, 'Registration', true, false, true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.successMessage = '';
        this.errorHandler.handleError(error, 'Registration', true, false, true);
      },
    });
  }

  private signInAfterRegister(userId: string, password: string): void {
    const loginParams: AuctionSniperApiTypes.LoginParameters = {
      UserName: userId,
      Password: password,
      ADID: '',
      LaunchLinkInfo: '',
    };

    this.api.logon(loginParams).subscribe({
      next: (loginResult) => {
        if (loginResult.success) {
          this.successMessage = '✅ Registration and auto login successful!';
          setTimeout(() => {
            if (loginResult.user?.Key) {
              this.preferences.token = loginResult.user.Key;
              this.preferences.userUid = loginResult.user.Id;
              this.preferences.userId = loginResult.user.UserName;
              this.preferences.userEmail = loginResult.user.Email;
              this.navigator.continueAfterSuccessfulLogin(loginResult.user);
            }
          }, 2500);
          this.form.reset();
        } else {
          this.successMessage = '';
          this.isSignIn = true;
        }
      },
      error: () => {
        this.successMessage = '';
        this.isSignIn = true;
      },
    });
  }

  onSignIn(): void {
    if (this.form.invalid) {
      this.successMessage = '';
      this.errorHandler.handleError(
        new Error('Please enter username and password'),
        'Missing Credentials',
        true,
        false,
        true
      );
      return;
    }

    const { userId, password } = this.form.value;
    this.tracker.track(TrackerConstants.Account.Login);
    this.isLoading = true;

    const loginParams: AuctionSniperApiTypes.LoginParameters = {
      UserName: userId,
      Password: password,
      ADID: '',
      LaunchLinkInfo: '',
    };

    this.api.logon(loginParams).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.successMessage = 'Login success!';
          setTimeout(() => {
            if (result.user?.Key) {
              this.preferences.token = result.user.Key;
              this.preferences.userUid = result.user.Id;
              this.preferences.userId = result.user.UserName;
              this.preferences.userEmail = result.user.Email;
              this.navigator.continueAfterSuccessfulLogin(result.user);
            }
          }, 2500);
          this.form.reset();
        } else {
          this.successMessage = '';
          this.errorHandler.handleApiResult(result, 'Login', true, false, true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.successMessage = '';
        this.errorHandler.handleError(error, 'Login', true, false, true);
      },
    });
  }

  onVersionClick(): void {
    if (this.configuration.enableDeveloperTools) return;
    this._versionClickCount++;
    if (this._versionClickCount > 9) this.showDebugOptions = true;
  }

  developerTools_click(): void {
    this.navigator.performNavigation(
      { stateName: 'app.developer', stateParam: null },
      true
    );
  }

  about_click(): void {
    this.navigator.performNavigation(
      { stateName: 'app.about', stateParam: null },
      true
    );
  }
}
