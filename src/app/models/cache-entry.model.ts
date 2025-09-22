export class CacheEntry<T> {
  private _createdAt: Date;
  private _lifespan: number | null; // in milliseconds
  private _item: T;

  constructor(item?: T, lifespanInMs?: number | null) {
    this._item = item!;
    this._createdAt = new Date();
    this._lifespan = lifespanInMs ?? null;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get lifespan(): number | null {
    return this._lifespan;
  }

  get hasExpired(): boolean {
    if (this._lifespan == null) {
      return false;
    }

    const expiresAt = this._createdAt.getTime() + this._lifespan;
    return Date.now() > expiresAt;
  }

  expire(): void {
    this._lifespan = 0;
  }

  touch(): void {
    this._createdAt = new Date();
  }

  get item(): T {
    return this._item;
  }
}
