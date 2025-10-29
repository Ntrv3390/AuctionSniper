import { Injectable } from '@angular/core';
import { AuctionSniperApiTypes } from 'src/app/Interfaces/auction-sniper-api-types.interface';

interface CachedSnipes {
  snipes: AuctionSniperApiTypes.Snipe[];
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class SnipeCacheService {
  private cache: Record<number, CachedSnipes> = {};
  private cacheDuration = 15 * 60 * 1000;

  getCachedSnipes(status: number): AuctionSniperApiTypes.Snipe[] | null {
    const cached = this.cache[status];
    if (!cached) return null;
    const now = Date.now();
    if (now - cached.timestamp > this.cacheDuration) {
      delete this.cache[status];
      return null;
    }
    return cached.snipes;
  }

  setCachedSnipes(status: number, snipes: AuctionSniperApiTypes.Snipe[]): void {
    this.cache[status] = {
      snipes,
      timestamp: Date.now(),
    };
  }
  clearCache(): void {
    this.cache = {};
  }
}
