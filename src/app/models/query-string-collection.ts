import URI from 'urijs';

export class QueryStringCollection {
  private _uri!: URI; // ✅ Definite assignment assertion added

  /**
   * @param urlOrUri A string URL or a URI object.
   */
  constructor(urlOrUri?: string | URI) {
    if (!urlOrUri) return;

    if (typeof urlOrUri === 'string') {
      this._uri = new URI(urlOrUri);
    } else {
      this._uri = urlOrUri;
    }
  }

  /**
   * Used to check if the given query string key is present.
   *
   * This will return true even for blank values.
   *
   * @param key The query string key to check for.
   * @returns True if the given query string key is present, false otherwise.
   */
  public hasKey(key: string): boolean {
    if (!this._uri) return false;

    return this._uri.search(true)[key] != null;
  }

  /**
   * Used to get the value for the given query string key.
   *
   * @param key The query string key to get a value for.
   * @returns The value of the query string for the given key.
   */
  public getValue(key: string): string | null {
    if (!this._uri) return null;

    return this._uri.search(true)[key] ?? null;
  }

  /**
   * Used to get the key/value pairs of the query strings in a dictionary.
   */
  public getDictionary(): Record<string, string> | null {
    if (!this._uri) return null;

    return this._uri.search(true);
  }
}
