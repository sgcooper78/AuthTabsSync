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

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const loginKeywords = ['signin', 'login'];
  const logoutKeywords = ['signout', 'logout'];

  chrome.tabs.get(details.tabId, (tab) => {
    if (tab && tab.url) {
      const oldUrl = new URL(tab.url);
      const newUrl = new URL(details.url);
      const oldFullUrl = oldUrl.toString().toLowerCase();
      const newFullUrl = newUrl.toString().toLowerCase();

      console.log('Navigation event detected:', tab.url);
      console.log('Old URL:', oldFullUrl);
      console.log('New URL:', newFullUrl);

      chrome.storage.local.get([`reloaded_${details.tabId}`], (result) => {
        if (result[`reloaded_${details.tabId}`]) {
          console.log('Tab has been reloaded recently, skipping processing:', details.tabId);
          return;
        }

        if (loginKeywords.some(keyword => oldFullUrl.includes(keyword) || newFullUrl.includes(keyword))) {
          console.log('Login navigation detected:', details.url);
          handleNavigationEvent('loginDetected', newUrl.hostname, details.tabId);
        } else if (logoutKeywords.some(keyword => oldFullUrl.includes(keyword) || newFullUrl.includes(keyword))) {
          console.log('Logout navigation detected:', details.url);
          handleNavigationEvent('logoutDetected', newUrl.hostname, details.tabId);
        } else {
          console.log('No matching login/logout pattern found for URL:', details.url);
        }
      });
    }
  });
});

chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.storage.local.remove(`reloaded_${details.tabId}`, () => {
    console.log('Cleared reloaded state for tab:', details.tabId);
  });
  chrome.storage.local.remove(`initiator_${details.tabId}`, () => {
    console.log('Cleared initiator state for tab:', details.tabId);
  });
});

function handleNavigationEvent(eventType, hostname, currentTabId) {
  const settingKey = eventType === 'loginDetected' ? 'loginReload' : 'logoutReload';

  chrome.storage.sync.get([settingKey], (data) => {
    const reloadSetting = data[settingKey];
    console.log(`Retrieved setting for ${eventType}:`, reloadSetting);

    if (!reloadSetting) {
      console.log(`Reload setting is disabled for ${eventType}`);
      return;
    }

    chrome.storage.local.get([`initiator_${currentTabId}`], (result) => {
      if (result[`initiator_${currentTabId}`]) {
        console.log('Initiator tab is already set, skipping reload.');
        return;
      }

      chrome.storage.local.set({ [`initiator_${currentTabId}`]: true }, () => {
        function reloadMatchingTabs(hostname, initialTabId) {
          console.log('Attempting to match hostname:', hostname);
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              const tabHostname = new URL(tab.url).hostname;
              console.log('Checking tab:', tab.id, 'URL:', tab.url, 'Hostname:', tabHostname);

              if (tab.id !== initialTabId && tabHostname.includes(hostname)) {
                chrome.storage.local.get([`reloaded_${tab.id}`], (result) => {
                  if (!result[`reloaded_${tab.id}`]) {
                    console.log('Reloading tab:', tab.id);
                    chrome.tabs.reload(tab.id, () => {
                      // Mark the tab as reloaded and set a timeout to clear this flag after a short delay
                      chrome.storage.local.set({ [`reloaded_${tab.id}`]: true }, () => {
                        console.log('Marked tab as reloaded:', tab.id);
                        setTimeout(() => {
                          chrome.storage.local.remove(`reloaded_${tab.id}`, () => {
                            console.log('Cleared reloaded state for tab after delay:', tab.id);
                          });
                        }, 10000); // 10 seconds delay to prevent immediate re-processing
                      });
                    });
                  } else {
                    console.log('Tab has already been reloaded, skipping:', tab.id);
                  }
                });
              } else {
                console.log('No match for tab or it is the initial tab:', tab.id);
              }
            });
          });
        }

        // Delay before starting the reload process
        const delay = 5000; // 5 seconds delay
        setTimeout(() => {
          // Start matching from the most specific part of the hostname and trickle up to the base domain
          const hostnameParts = hostname.split('.');
          for (let i = 0; i < hostnameParts.length - 1; i++) {
            const partialHostname = hostnameParts.slice(i).join('.');
            console.log(`Checking partial hostname: ${partialHostname}`);
            reloadMatchingTabs(partialHostname, currentTabId);
          }
        }, delay);
      });
    });
  });
}

// Clear the initiator state when the tab is reloaded to allow future reloads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.remove(`initiator_${tabId}`, () => {
      console.log('Cleared initiator state for tab:', tabId);
    });
  }
});
