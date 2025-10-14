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
import { LoadingController, ToastController } from '@ionic/angular';
import { DataSourceService } from 'src/app/services/DataSource';
import { eyeOutline } from 'ionicons/icons';
import { eyeOffOutline } from 'ionicons/icons';

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
    private toastCtrl: ToastController,
    private dataSource: DataSourceService
  ) {
    addIcons({
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
    });
  }

  ngOnInit(): void {
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

    // Set initial validators based on sign in mode
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

    // Reset form validators based on mode
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
    // const forgotUrl = `${this.configuration.webSiteUrl}/resetpassword.aspx`;
    const forgotUrl = `http://rtwebservice.paperbirdtech.com/resetpassword.aspx`;
    window.open(forgotUrl, '_system');
  }

  onCreateAccount(): void {
    if (this.form.invalid) {
      this.errorHandler.handleError(
        new Error(
          'Please fill all required fields:\n• Username\n• Password\n• Confirm Password\n• Email Address\n• Time Zone'
        ),
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
      this.errorHandler.handleError(
        new Error(
          'The passwords you entered do not match.\n\nPlease ensure both password fields contain the same value.'
        ),
        'Password Mismatch',
        true,
        false,
        true
      );
      return;
    }

    if (!email || !timeZone) {
      this.errorHandler.handleError(
        new Error(
          'Please complete all required fields:\n• Email Address is required for account recovery\n• Time Zone is required for proper auction timing'
        ),
        'Missing Information',
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

    // Show loading indicator
    this.isLoading = true;
    this.errorHandler.showLoading('Creating account');

    this.api.register(params).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.errorHandler.hideLoading();

        if (result.success) {
          this.errorHandler.handleSuccess(
            'Account created successfully! Signing you in...',
            'Registration'
          );
          this.signInAfterRegister(userId, password);
        } else {
          // Handle API-level failure with dialog
          this.errorHandler.handleApiResult(
            result,
            'Registration',
            true,
            false,
            true
          );
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandler.hideLoading();
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

    this.errorHandler.showLoading('Signing you in');

    this.api.logon(loginParams).subscribe({
      next: (loginResult) => {
        this.errorHandler.hideLoading();

        if (loginResult.success) {
          // Store the Key from the login response
          if (loginResult.user?.Key) {
            this.preferences.token = loginResult.user.Key;
            this.preferences.userUid = loginResult.user.Id;
            this.preferences.userId = loginResult.user.UserName;
            this.preferences.userEmail = loginResult.user.Email;
          }
          this.form.reset();
          this.navigator.continueAfterSuccessfulLogin(loginResult.user, true);
        } else {
          // Auto-login failed after registration, switch to sign-in mode
          this.errorHandler.handleError(
            new Error(
              'Your account was created successfully! However, the automatic sign-in failed. Please sign in manually using your new credentials.'
            ),
            'Account Created',
            true,
            false,
            true
          );
          this.isSignIn = true;
          this.form.reset();
        }
      },
      error: (error) => {
        this.errorHandler.hideLoading();
        console.error('Auto-login error after registration:', error);

        // Auto-login failed, switch to sign-in mode
        this.errorHandler.handleError(
          new Error(
            'Your account was created successfully! However, the automatic sign-in failed. Please sign in manually using your new credentials.'
          ),
          'Account Created',
          true,
          false,
          true
        );
        this.isSignIn = true;
        this.form.reset();
      },
    });
  }

  onSignIn(): void {
    if (this.form.invalid) {
      this.errorHandler.handleError(
        new Error(
          'Please enter both username and password to sign in.\n\nBoth fields are required for authentication.'
        ),
        'Missing Credentials',
        true,
        false,
        true
      );
      return;
    }

    const { userId, password } = this.form.value;
    this.tracker.track(TrackerConstants.Account.Login);

    // Show loading indicator
    this.isLoading = true;
    this.errorHandler.showLoading('Signing in');

    const loginParams: AuctionSniperApiTypes.LoginParameters = {
      UserName: userId,
      Password: password,
      ADID: '',
      LaunchLinkInfo: '',
    };

    this.api.logon(loginParams).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.errorHandler.hideLoading();

        if (result.success) {
          // Handle successful login and store the Key
          this.errorHandler.handleSuccess('Welcome back!', 'Login');
          if (result.user?.Key) {
            this.preferences.token = result.user.Key;
            this.preferences.userUid = result.user.Id;
            this.preferences.userId = result.user.UserName;
            this.preferences.userEmail = result.user.Email;
          }
          this.form.reset();
          this.navigator.continueAfterSuccessfulLogin(result.user);
        } else {
          // Handle API-level failure with dialog
          this.errorHandler.handleApiResult(result, 'Login', true, false, true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandler.hideLoading();
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
