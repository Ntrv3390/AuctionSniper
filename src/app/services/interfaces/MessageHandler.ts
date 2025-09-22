import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface'; // Adjust path as needed

export interface MessageHandler {
  initialize(): void;
  handleMessage(message: AuctionSniperApiTypes.Message): boolean;
}