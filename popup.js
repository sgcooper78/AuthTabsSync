document.addEventListener('DOMContentLoaded', function() {
  const loginActionRadios = document.getElementsByName('loginAction');
  const logoutActionRadios = document.getElementsByName('logoutAction');
  const reloadDelaySlider = document.getElementById('reloadDelay');
  const sliderValueSpan = document.getElementById('sliderValue');
  const currentHostnameSpan = document.getElementById('currentHostname');
  const reloadHostnameTabsButton = document.getElementById('reloadHostnameTabs');
  const closeHostnameTabsButton = document.getElementById('closeHostnameTabs');
  let currentHostname = '';
  let currentTabId = null;

  if (!loginActionRadios || !logoutActionRadios || !reloadDelaySlider || !sliderValueSpan || !currentHostnameSpan || !reloadHostnameTabsButton || !closeHostnameTabsButton) {
    console.error('Some elements are missing in the DOM.');
    return;
  }

  console.log('All elements are present.');

  // Load current settings
  chrome.storage.sync.get(['loginAction', 'logoutAction', 'reloadDelay'], (data) => {
    if (data.loginAction) {
      const loginActionElement = document.getElementById(`login${capitalizeFirstLetter(data.loginAction)}`);
      if (loginActionElement) loginActionElement.checked = true;
    }
    if (data.logoutAction) {
      const logoutActionElement = document.getElementById(`logout${capitalizeFirstLetter(data.logoutAction)}`);
      if (logoutActionElement) logoutActionElement.checked = true;
    }

    if (data.reloadDelay !== undefined) {
      reloadDelaySlider.value = data.reloadDelay;
      sliderValueSpan.textContent = `${data.reloadDelay}s`;
    }

    // Display the current tab hostname and ID
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        currentHostname = new URL(currentTab.url).hostname;
        currentTabId = currentTab.id;
        currentHostnameSpan.textContent = currentHostname;
        reloadHostnameTabsButton.textContent = `Reload all other tabs from ${currentHostname}`;
        closeHostnameTabsButton.textContent = `Close all other tabs from ${currentHostname}`;
      }
    });
  });

  // Save settings when radio buttons are changed
  loginActionRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const loginAction = getCheckedValue(loginActionRadios);
      chrome.storage.sync.set({ loginAction: loginAction });
    });
  });

  logoutActionRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const logoutAction = getCheckedValue(logoutActionRadios);
      chrome.storage.sync.set({ logoutAction: logoutAction });
    });
  });

  // Save slider value and update display
  reloadDelaySlider.addEventListener('input', () => {
    const delay = reloadDelaySlider.value;
    sliderValueSpan.textContent = `${delay}s`;
    chrome.storage.sync.set({ reloadDelay: delay });
  });

  // Reload tabs with the current hostname
  reloadHostnameTabsButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'reloadTabsWithHostname', hostname: currentHostname, currentTabId: currentTabId });
  });

  // Close tabs with the current hostname
  closeHostnameTabsButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'closeTabsWithHostname', hostname: currentHostname, currentTabId: currentTabId });
  });

  function getCheckedValue(radioNodeList) {
    for (let i = 0; i < radioNodeList.length; i++) {
      if (radioNodeList[i].checked) {
        return radioNodeList[i].value;
      }
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
