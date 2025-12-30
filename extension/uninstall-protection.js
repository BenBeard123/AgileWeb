// Uninstall protection - prevents extension removal without password
// This runs in the background service worker

chrome.management.onUninstalled.addListener((extensionId) => {
  // Check if this is our extension being uninstalled
  chrome.runtime.getManifest().then((manifest) => {
    if (extensionId === chrome.runtime.id) {
      // Extension is being uninstalled
      chrome.storage.sync.get(['agileweb_parental_password'], (result) => {
        if (result.agileweb_parental_password && result.agileweb_parental_password.hasPassword) {
          // Password is set - show warning
          chrome.tabs.create({
            url: chrome.runtime.getURL('blocked.html?reason=uninstall-protected&message=Extension is password protected. Please enter parental code in extension settings to uninstall.')
          });
        }
      });
    }
  });
});

// Also listen for disable attempts
chrome.management.onDisabled.addListener((extensionInfo) => {
  if (extensionInfo.id === chrome.runtime.id) {
    chrome.storage.sync.get(['agileweb_parental_password'], (result) => {
      if (result.agileweb_parental_password && result.agileweb_parental_password.hasPassword) {
        // Try to re-enable if password protected
        chrome.management.setEnabled(extensionInfo.id, true);
      }
    });
  }
});

