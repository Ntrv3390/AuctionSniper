import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

export enum SnackbarLevel {
  Info,
  Success,
  Warning,
  Error,
}

export enum SnackbarLocation {
  Bottom = 'bottom',
  Top = 'top',
}

export class SnackbarOptions {
  constructor(
    public message: string,
    public title?: string,
    public level: SnackbarLevel = SnackbarLevel.Info,
    public location: SnackbarLocation = SnackbarLocation.Bottom,
    public actionText?: string,
    public autoClose: boolean = true
  ) {}
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  constructor(private toastController: ToastController) {}

  info(message: string, title?: string): Promise<boolean> {
    return this.show(new SnackbarOptions(message, title, SnackbarLevel.Info));
  }

  success(message: string, title?: string): Promise<boolean> {
    return this.show(new SnackbarOptions(message, title, SnackbarLevel.Success));
  }

  warning(message: string, title?: string): Promise<boolean> {
    return this.show(new SnackbarOptions(message, title, SnackbarLevel.Warning));
  }

  error(message: string, title?: string): Promise<boolean> {
    return this.show(new SnackbarOptions(message, title, SnackbarLevel.Error));
  }

  async show(options: SnackbarOptions): Promise<boolean> {
    if (!options.message) return false;

    const color =
      options.level === SnackbarLevel.Error
        ? 'danger'
        : options.level === SnackbarLevel.Success
        ? 'success'
        : options.level === SnackbarLevel.Warning
        ? 'warning'
        : 'primary';

    const toast = await this.toastController.create({
      header: options.title,
      message: options.message,
      duration: options.autoClose ? 5000 : 0,
      position: options.location,
      color: color,
      buttons: [
        {
          text: options.actionText || 'Dismiss',
          role: options.actionText ? 'action' : 'cancel',
        },
      ],
    });

    await toast.present();
    const { role } = await toast.onDidDismiss();

    return role === 'action';
  }
}
