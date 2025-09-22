// File: build-config.interface.ts

export interface BuildConfig {
    ApplicationName: string;
    ApplicationDescription: string;
    AppVersion: string;
    AuthorName: string;
    AuthorEmail: string;
    AuthorWebsite: string;
    ApiUrl: string;
    WebSiteUrl: string;
    TermsOfServiceUrl: string;
    PrivacyPolicyUrl: string;
    CertificateUrl: string;
    LogEntriesToken: string;
    DebugLoggingUrl: string;
    EnableIosLoggingInDistributionBuilds: boolean;
    AppReviewURL_iOS: string;
    AppReviewURL_Android: string;
    OpenSourceUrl: string;   // 👈 Add this

  }
  