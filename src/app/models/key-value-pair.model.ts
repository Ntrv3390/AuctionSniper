// src/app/models/key-value-pair.model.ts
export class KeyValuePair<K, V> {
  constructor(
    public key?: K,
    public value?: V
  ) {}
}
