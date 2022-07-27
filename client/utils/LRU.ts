export class LRU<K, V> extends Map<K, V> {
  readonly max: number;

  constructor(max: number, ...args: any[]) {
    super(...args);
    this.max = max;
  }

  get(key: K): V | undefined {
    const val = super.get(key);
    if (val) {
      this.delete(key);
      this.set(key, val);
    }
    return val;
  }

  set(key: K, val: V): this {
    if (this.has(key)) {
      this.delete(key);
    } else if (this.size === this.max) {
      this.delete(this.#oldest());
    }
    return super.set(key, val);
  }

  #oldest(): K {
    return this.keys().next().value as K;
  }
}
