// file: async-await-helper.ts

export type PromiseFactory<T> = () => Promise<T>;

export interface OnResult<T> {
  error: any;
  data: T | null;
}

export function on<T>(promiseOrFactory: Promise<T> | PromiseFactory<T>): Promise<OnResult<T>> {
  let promise: Promise<T> | null = null;
  let factoryFunctionError: any;

  if (typeof promiseOrFactory === 'function') {
    try {
      const factory = promiseOrFactory as PromiseFactory<T>;
      promise = factory();
    } catch (error) {
      factoryFunctionError = error;
    }
  } else {
    promise = promiseOrFactory;
  }

  return new Promise<OnResult<T>>((resolve) => {
    if (!promise) {
      const reason = factoryFunctionError ?? 'No promise was provided.';
      const error = new Error(`AsyncAwaitHelper.on(): No promise was available. Reason: ${reason}`);
      resolve({ error, data: null });
      return;
    }

    promise.then(
      (data: T) => {
        resolve({ error: null, data });
      },
      (error: any) => {
        resolve({ error, data: null });
      }
    );
  });
}
