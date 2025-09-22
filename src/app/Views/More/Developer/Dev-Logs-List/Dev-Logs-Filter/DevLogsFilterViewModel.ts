export class DevLogsFilterViewModel {
    showDebug = false;
    showDebugOnlyHTTP = false;
    showInfo = true;
    showWarn = true;
    showError = true;
  
    debugColor = '#000000';   // set your default colors
    debugIcon = 'bug';
  
    httpColor = '#007bff';
    httpIcon = 'network';
  
    infoColor = '#17a2b8';
    infoIcon = 'information-circle';
  
    warnColor = '#ffc107';
    warnIcon = 'warning';
  
    errorColor = '#dc3545';
    errorIcon = 'alert-circle';
  }
  