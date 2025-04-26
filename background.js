// Set the URL to open when the extension is uninstalled.
chrome.runtime.setUninstallURL("http://bloupla.net/don-t-remove/", () => {
  if (chrome.runtime.lastError) {
    console.error("Error setting uninstall URL:", chrome.runtime.lastError);
  }
});