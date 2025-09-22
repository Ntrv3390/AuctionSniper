// log-level.ts

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

export namespace LogLevel {
  /**
   * Get an icon name for the given log level.
   */
  export function getIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.Debug:
        return 'ion-bug';
      case LogLevel.Info:
        return 'ion-ios-information';
      case LogLevel.Warn:
        return 'ion-alert-circled';
      case LogLevel.Error:
        return 'ion-android-alert';
      default:
        return 'ion-android-alert';
    }
  }

  /**
   * Get a color (hex) for the given log level.
   */
  export function getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.Debug:
        return '#000080'; // Navy
      case LogLevel.Info:
        return '#000000'; // Black
      case LogLevel.Warn:
        return '#ff8000'; // Orange
      case LogLevel.Error:
        return '#ff0000'; // Red
      default:
        return '#000000'; // Black
    }
  }

  /**
   * Get user-friendly display name for the given log level.
   */
  export function getDisplayText(level: LogLevel): string {
    switch (level) {
      case LogLevel.Debug:
        return 'Debug';
      case LogLevel.Info:
        return 'Info';
      case LogLevel.Warn:
        return 'Warning';
      case LogLevel.Error:
        return 'Error';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get log marker text for the given log level.
   */
  export function getMarkerText(level: LogLevel): string {
    switch (level) {
      case LogLevel.Debug:
        return '[DEBUG]';
      case LogLevel.Info:
        return '[INFO]';
      case LogLevel.Warn:
        return '[WARN]';
      case LogLevel.Error:
        return '[ERROR]';
      default:
        return '[LOG]';
    }
  }
}
