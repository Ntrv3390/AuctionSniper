import { Injectable } from '@angular/core';
import { MessageHandler } from 'src/app/services/interfaces/MessageHandler';
import { SnackbarService, SnackbarLocation } from 'src/app/services/Snackbar';
import {SnackbarLevel  } from 'src/app/services/Snackbar';
import {SnackbarOptions  } from 'src/app/services/Snackbar';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

@Injectable({
  providedIn: 'root',
})
export class SnackbarApiMessageHandler implements MessageHandler {
  static ID = 'SnackbarApiMessageHandler';

  constructor(private snackbar: SnackbarService) {}

  initialize(): void {
    // No initialization required currently
  }

  handleMessage(message: AuctionSniperApiTypes.Message): boolean {
    if (!message || message.Level == null || !message.MessageContent) {
      return false;
    }

    let title: string | null = null;
    let snackbarLevel: SnackbarLevel | null = null;
    let autoClose = true;

    switch (message.Level) {
      case AuctionSniperApiTypes.MessageLevel.Slap:
        title = 'Important Information!';
        snackbarLevel = SnackbarLevel.Info;
        autoClose = false;
        break;
      case AuctionSniperApiTypes.MessageLevel.Info:
        title = 'Information';
        snackbarLevel = SnackbarLevel.Info;
        autoClose = false;
        break;
      case AuctionSniperApiTypes.MessageLevel.Warning:
        title = 'Warning';
        snackbarLevel = SnackbarLevel.Warning;
        autoClose = true;
        break;
      case AuctionSniperApiTypes.MessageLevel.Error:
        title = 'Error';
        snackbarLevel = SnackbarLevel.Error;
        autoClose = true;
        break;
      default:
        return false;
    }

    const options: SnackbarOptions = {
        message: message.MessageContent,
        title: title,
        level: snackbarLevel,
        location: SnackbarLocation.Bottom, // ✅ required valid enum value
        actionText: autoClose ? undefined : 'OK',
        autoClose: autoClose,
      };

    this.snackbar.show(options);

    return true;
  }
}
