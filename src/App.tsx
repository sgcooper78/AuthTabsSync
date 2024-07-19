import React, { useEffect, useState } from 'react';

const App = () => {
  const [loginAction, setLoginAction] = useState('reload');
  const [logoutAction, setLogoutAction] = useState('reload');
  const [reloadDelay, setReloadDelay] = useState(5);
  const [currentHostname, setCurrentHostname] = useState('');
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);

  useEffect(() => {
    chrome.storage.sync.get(['loginAction', 'logoutAction', 'reloadDelay'], (data) => {
      if (data.loginAction) setLoginAction(data.loginAction);
      if (data.logoutAction) setLogoutAction(data.logoutAction);
      if (data.reloadDelay !== undefined) setReloadDelay(data.reloadDelay);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        const hostname = new URL(currentTab.url).hostname;
        setCurrentHostname(hostname);
        setCurrentTabId(currentTab.id ?? null);
      }
    });
  }, []);

  const handleLoginActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLoginAction(value);
    chrome.storage.sync.set({ loginAction: value });
  };

  const handleLogoutActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLogoutAction(value);
    chrome.storage.sync.set({ logoutAction: value });
  };

  const handleReloadDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setReloadDelay(value);
    chrome.storage.sync.set({ reloadDelay: value });
  };

  const handleReloadTabs = () => {
    chrome.runtime.sendMessage({ action: 'reloadTabsWithHostname', hostname: currentHostname, currentTabId: currentTabId });
  };

  const handleCloseTabs = () => {
    chrome.runtime.sendMessage({ action: 'closeTabsWithHostname', hostname: currentHostname, currentTabId: currentTabId });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', width: '300px', padding: '10px' }}>
      <h2>Auth Tabs Sync</h2>
      <h3>Login/Logout Tab Actions</h3>
      <p>Current Tab Hostname: <span>{currentHostname}</span></p>

      <div className="action-group">
        <strong>Action upon sign in for all other tabs:</strong>
        <div className="radio-group">
          <input type="radio" id="loginReload" name="loginAction" value="reload" checked={loginAction === 'reload'} onChange={handleLoginActionChange} />
          <label htmlFor="loginReload">Reload</label>
          <input type="radio" id="loginClose" name="loginAction" value="close" checked={loginAction === 'close'} onChange={handleLoginActionChange} />
          <label htmlFor="loginClose">Close</label>
          <input type="radio" id="loginDisabled" name="loginAction" value="disabled" checked={loginAction === 'disabled'} onChange={handleLoginActionChange} />
          <label htmlFor="loginDisabled">Disabled</label>
        </div>
      </div>

      <div className="action-group">
        <strong>Action upon sign out for all other tabs:</strong>
        <div className="radio-group">
          <input type="radio" id="logoutReload" name="logoutAction" value="reload" checked={logoutAction === 'reload'} onChange={handleLogoutActionChange} />
          <label htmlFor="logoutReload">Reload</label>
          <input type="radio" id="logoutClose" name="logoutAction" value="close" checked={logoutAction === 'close'} onChange={handleLogoutActionChange} />
          <label htmlFor="logoutClose">Close</label>
          <input type="radio" id="logoutDisabled" name="logoutAction" value="disabled" checked={logoutAction === 'disabled'} onChange={handleLogoutActionChange} />
          <label htmlFor="logoutDisabled">Disabled</label>
        </div>
      </div>

      <label>
        <div className="slider-label">
          <span>Time to wait before performing action on all other tabs:</span>
          <span>{reloadDelay}s</span>
        </div>
        <input type="range" id="reloadDelay" min="0" max="30" value={reloadDelay} step="1" onChange={handleReloadDelayChange} />
      </label>

      <div>
        <p>Actions to do to all other tabs:</p>
        <button onClick={handleReloadTabs}>Reload all other tabs from this hostname</button>
        <button onClick={handleCloseTabs}>Close all other tabs from this hostname</button>
      </div>
    </div>
  );
};

export default App;
