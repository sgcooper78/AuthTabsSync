document.addEventListener('DOMContentLoaded', function() {
    console.log('chrome object:', chrome); // Check if chrome object is available
    const reloadButton = document.getElementById('reloadTabs');
    const useHostnameCheckbox = document.getElementById('useHostname');
    const loginReloadCheckbox = document.getElementById('loginReload');
    const logoutReloadCheckbox = document.getElementById('logoutReload');
    const currentHostnameSpan = document.getElementById('currentHostname');
  
    // Load current settings
    chrome.storage.sync.get(['useHostname', 'loginReload', 'logoutReload'], (data) => {
      useHostnameCheckbox.checked = data.useHostname !== undefined ? data.useHostname : true;
      loginReloadCheckbox.checked = data.loginReload !== undefined ? data.loginReload : true;
      logoutReloadCheckbox.checked = data.logoutReload !== undefined ? data.logoutReload : true;
      // Debugging storage values
      console.log('Loaded settings:', data);
    });
  
    // Save settings when checkboxes are changed
    useHostnameCheckbox.addEventListener('change', () => {
      chrome.storage.sync.set({ useHostname: useHostnameCheckbox.checked }, () => {
        console.log('useHostname set to:', useHostnameCheckbox.checked);
      });
    });
    loginReloadCheckbox.addEventListener('change', () => {
      chrome.storage.sync.set({ loginReload: loginReloadCheckbox.checked }, () => {
        console.log('loginReload set to:', loginReloadCheckbox.checked);
      });
    });
    logoutReloadCheckbox.addEventListener('change', () => {
      chrome.storage.sync.set({ logoutReload: logoutReloadCheckbox.checked }, () => {
        console.log('logoutReload set to:', logoutReloadCheckbox.checked);
      });
    });
  
    // Display the current tab hostname
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      const hostname = new URL(currentTab.url).hostname;
      currentHostnameSpan.textContent = hostname;
    });
  
    // Reload tabs button click handler
    reloadButton.addEventListener('click', function() {
      const useHostname = useHostnameCheckbox.checked;
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentTab = tabs[0];
        const message = {
          type: 'reloadTabs',
          useHostname: useHostname,
          hostname: new URL(currentTab.url).hostname
        };
        chrome.runtime.sendMessage(message);
      });
    });
  });