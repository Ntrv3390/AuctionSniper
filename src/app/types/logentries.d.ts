/**
 * Type definitions for the LogEntries JavaScript API (le_js)
 * https://github.com/logentries/le_js/wiki/API
 */

    interface LogEntriesStatic {
      init(token: string): void;
      init(config: Config): void;
  
      log(message: any): void;
      info(message: any): void;
      warn(message: any): void;
      error(message: any): void;
    }
  
    interface Config {
      token: string;
      ssl?: boolean;
      catchall?: boolean;
      trace?: boolean;
      no_format?: boolean;
      page_info?: string;
      print?: boolean;
    }
    