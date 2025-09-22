/**
 * Input type for the EbayTokenController dialog.
 *
 * Indicates if the dialog is being used for the onboarding case (e.g. user logging in).
 * This adjusts the messaging for new users vs users who are already logged in.
 * Default: false.
 */
export interface EbayTokenModel {
    onboarding: boolean;
  }
  