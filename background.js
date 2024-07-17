chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['useHostname', 'loginReload', 'logoutReload'], (data) => {
    if (data.useHostname === undefined) {
      chrome.storage.sync.set({ useHostname: true }, () => {
        console.log('Default useHostname set to true on install');
      });
    }
    if (data.loginReload === undefined) {
      chrome.storage.sync.set({ loginReload: true }, () => {
        console.log('Default loginReload set to true on install');
      });
    }
    if (data.logoutReload === undefined) {
      chrome.storage.sync.set({ logoutReload: true }, () => {
        console.log('Default logoutReload set to true on install');
      });
    }
  });
});

let reloadedTabs = {};

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const loginKeywords = ['signin', 'login'];
  const logoutKeywords = ['signout', 'logout'];

  chrome.tabs.get(details.tabId, (tab) => {
    if (tab && tab.url) {
      const oldUrl = new URL(tab.url);
      const oldPathname = oldUrl.pathname.toLowerCase();

      console.log('Navigation event detected:', tab.url);
      console.log('Old pathname:', oldPathname);

      if (loginKeywords.some(keyword => tab.url.toLowerCase().includes(keyword))) {
        console.log('Login navigation detected:', tab.url);
        handleNavigationEvent('loginDetected', oldUrl.hostname, details.tabId, tab.url);
      } else if (logoutKeywords.some(keyword => tab.url.toLowerCase().includes(keyword))) {
        console.log('Logout navigation detected:', tab.url);
        handleNavigationEvent('logoutDetected', oldUrl.hostname, details.tabId, tab.url);
      } else {
        console.log('No matching login/logout pattern found for URL:', tab.url);
      }
    }
  });
});

function handleNavigationEvent(eventType, hostname, currentTabId, currentUrl) {
  const settingKey = eventType === 'loginDetected' ? 'loginReload' : 'logoutReload';

  chrome.storage.sync.get([settingKey], (data) => {
    const reloadSetting = data[settingKey];
    console.log(`Retrieved setting for ${eventType}:`, reloadSetting);

    if (!reloadSetting) {
      console.log(`Reload setting is disabled for ${eventType}`);
      return;
    }

    function reloadMatchingTabs(hostname) {
      console.log('Attempting to match hostname:', hostname);
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          const tabHostname = new URL(tab.url).hostname;
          console.log('Checking tab:', tab.id, 'URL:', tab.url, 'Hostname:', tabHostname);

          if (tab.id !== currentTabId && tabHostname.endsWith(hostname) && !reloadedTabs[tab.id]) {
            console.log('Reloading tab:', tab.id);
            chrome.tabs.reload(tab.id);
            reloadedTabs[tab.id] = true;
            setTimeout(() => {
              delete reloadedTabs[tab.id];
            }, 60000); // Clear the reloaded tab ID after 60 seconds to avoid infinite loop
          } else {
            console.log('No match for tab or it is the current tab or it was recently reloaded:', tab.id);
          }
        });
      });
    }

    // Delay before starting the reload process
    const delay = 5000; // 5 seconds delay
    setTimeout(() => {
      // Start matching from the most specific part of the hostname and trickle up to the base domain
      const hostnameParts = hostname.split('.').reverse();
      for (let i = 1; i <= hostnameParts.length; i++) {
        const partialHostname = hostnameParts.slice(0, i).reverse().join('.');
        console.log(`Checking partial hostname: ${partialHostname}`);
        reloadMatchingTabs(partialHostname);
      }
    }, delay);
  });
}