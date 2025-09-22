// src/app/models/exception.ts

export class Exception extends Error {
    public readonly originalMessage: string;
  
    constructor(
      message?: string,
      public innerError?: any,
      public context?: any,
    ) {
      super(
        message +
          (innerError && innerError.message
            ? ' Inner Error: ' + innerError.message
            : '')
      );
  
      // Fix prototype chain
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      } else {
        // Fallback for older environments
        (this as any).__proto__ = actualProto;
      }
  
      this.originalMessage = message || '';
    }
  }
  