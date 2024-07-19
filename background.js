chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['loginAction', 'logoutAction', 'reloadDelay'], (data) => {
    if (data.loginAction === undefined) {
      chrome.storage.sync.set({ loginAction: 'reload' });
    }
    if (data.logoutAction === undefined) {
      chrome.storage.sync.set({ logoutAction: 'reload' });
    }
    if (data.reloadDelay === undefined) {
      chrome.storage.sync.set({ reloadDelay: 5 });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.currentTabId) {
    if (message.action === 'reloadTabsWithHostname') {
      handleHostnameTabs(message.hostname, 'reload', message.currentTabId);
    } else if (message.action === 'closeTabsWithHostname') {
      handleHostnameTabs(message.hostname, 'close', message.currentTabId);
    }
  }
});

function handleHostnameTabs(hostname, action, currentTabId) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const tabHostname = new URL(tab.url).hostname;
      if (tab.id !== currentTabId && tabHostname.includes(hostname)) {
        if (action === 'reload') {
          chrome.tabs.reload(tab.id);
        } else if (action === 'close') {
          chrome.tabs.remove(tab.id);
        }
      }
    });
  });
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const loginKeywords = ['signin', 'login'];
  const logoutKeywords = ['signout', 'logout'];

  chrome.tabs.get(details.tabId, (tab) => {
    if (tab && tab.url) {
      const oldUrl = new URL(tab.url);
      const newUrl = new URL(details.url);
      const oldFullUrl = oldUrl.toString().toLowerCase();
      const newFullUrl = newUrl.toString().toLowerCase();

      chrome.storage.local.get([`reloaded_${details.tabId}`], (result) => {
        if (result[`reloaded_${details.tabId}`]) {
          console.log(`Tab ${details.tabId} has been reloaded recently, skipping processing.`);
          return;
        }

        if (loginKeywords.some(keyword => oldFullUrl.includes(keyword) || newFullUrl.includes(keyword))) {
          console.log('Login navigation detected:', newUrl.hostname);
          handleNavigationEvent('loginDetected', newUrl.hostname, details.tabId);
        } else if (logoutKeywords.some(keyword => oldFullUrl.includes(keyword) || newFullUrl.includes(keyword))) {
          console.log('Logout navigation detected:', newUrl.hostname);
          handleNavigationEvent('logoutDetected', newUrl.hostname, details.tabId);
        }
      });
    }
  });
});

chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.storage.local.remove(`reloaded_${details.tabId}`);
  chrome.storage.local.remove(`initiator_${details.tabId}`);
});

function handleNavigationEvent(eventType, hostname, currentTabId) {
  const settingKey = eventType === 'loginDetected' ? 'loginAction' : 'logoutAction';

  chrome.storage.sync.get([settingKey, 'reloadDelay'], (data) => {
    const action = data[settingKey];
    const delay = action === 'close' ? 0 : (data.reloadDelay || 5) * 1000; // Default delay to 5 seconds
    console.log(`Action for ${eventType}:`, action);
    console.log(`Delay for ${eventType}:`, delay);

    if (!action || action === 'disabled') {
      console.log(`Action for ${eventType} is disabled.`);
      return;
    }

    chrome.storage.local.get([`initiator_${currentTabId}`], (result) => {
      if (result[`initiator_${currentTabId}`] && action !== 'close') {
        console.log(`Initiator tab ${currentTabId} is already set, skipping reload.`);
        return;
      }

      chrome.storage.local.set({ [`initiator_${currentTabId}`]: true }, () => {
        function handleMatchingTabs(hostname, initialTabId) {
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              const tabHostname = new URL(tab.url).hostname;

              if (tab.id !== initialTabId && tabHostname.includes(hostname)) {
                chrome.storage.local.get([`reloaded_${tab.id}`], (result) => {
                  if (action === 'reload' && !result[`reloaded_${tab.id}`]) {
                    console.log(`Reloading tab ${tab.id} after ${delay / 1000} seconds`);
                    setTimeout(() => {
                      chrome.tabs.reload(tab.id, () => {
                        chrome.storage.local.set({ [`reloaded_${tab.id}`]: true });
                        setTimeout(() => {
                          chrome.storage.local.remove(`reloaded_${tab.id}`);
                        }, 10000);
                      });
                    }, delay);
                  } else if (action === 'close') {
                    console.log(`Closing tab ${tab.id}`);
                    chrome.tabs.remove(tab.id);
                  } else {
                    console.log(`Tab ${tab.id} has already been reloaded, skipping.`);
                  }
                });
              }
            });
          });
        }

        setTimeout(() => {
          const hostnameParts = hostname.split('.');
          for (let i = 0; i < hostnameParts.length - 1; i++) {
            const partialHostname = hostnameParts.slice(i).join('.');
            handleMatchingTabs(partialHostname, currentTabId);
          }
        }, delay);
      });
    });
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.remove(`initiator_${tabId}`);
  }
});
