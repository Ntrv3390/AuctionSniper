// src/app/services/api-message-manager.service.ts

import { Injectable, Injector } from '@angular/core';
import { Logger } from 'src/app/services/Logger';
import { MessageHandler } from 'src/app/services/interfaces/MessageHandler';
import { SnackbarApiMessageHandler } from 'src/app/services/SnackbarApiMessageHandler';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface'; // Assuming Message is defined here

@Injectable({
  providedIn: 'root',
})
export class ApiMessageManagerService {
  private handlers: string[] = [
    SnackbarApiMessageHandler.ID
  ];

  private initialized = false;

  constructor(
    private injector: Injector,
    private logger: Logger
  ) {}

  initialize(): void {
    this.initialized = true;

    for (const handlerToken of this.handlers) {
      try {
        const handler = this.injector.get<MessageHandler>(handlerToken as any);

        if (!handler) {
          this.logger.warn('ApiMessageManagerService', 'initialize', 'Could not locate handler', handlerToken);
          continue;
        }

        handler.initialize();
      } catch (error) {
        this.logger.error('ApiMessageManagerService', 'initialize', 'Error initializing handler', {
          handlerToken,
          error
        });
      }
    }
  }

  handleMessage(message: AuctionSniperApiTypes.Message): boolean {
    if (!this.initialized) {
      return false;
    }

    for (const handlerToken of this.handlers) {
      try {
        const handler = this.injector.get<MessageHandler>(handlerToken as any);

        if (!handler) {
          this.logger.warn('ApiMessageManagerService', 'handleMessage', 'Handler not found', handlerToken);
          continue;
        }

        const handled = handler.handleMessage(message);

        if (handled) {
          return true;
        }
      } catch (error) {
        this.logger.error('ApiMessageManagerService', 'handleMessage', 'Handler error', {
          handlerToken,
          message,
          error
        });
      }
    }

    return false;
  }
}
