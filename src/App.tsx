import React, { useEffect, useState } from 'react';
import '@mantine/core/styles.css';
import { Button, Title, Text, Group, Slider, Space, Tooltip } from '@mantine/core';
import ActionGroup from './components/ActionGroup';


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

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        const hostname = new URL(currentTab.url).hostname;
        setCurrentHostname(hostname);
        setCurrentTabId(currentTab.id ?? null);
      }
    });
  }, []);

  const handleLoginActionChange = (value: string) => {
    setLoginAction(value);
    chrome.storage.sync.set({ loginAction: value });
  };

  const handleLogoutActionChange = (value: string) => {
    setLogoutAction(value);
    chrome.storage.sync.set({ logoutAction: value });
  };

  const handleReloadDelayChange = (value: number) => {
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
      <Group justify="center">
      <Title order={2}>Auth Tabs Sync</Title>
      {/* <Title order={3}>Login/Logout Tab Actions</Title> */}
      <Text>
        Current Tab Hostname: <Text span  fw={700}>{currentHostname}</Text>
      </Text>
      </Group>

      <Space h="md" />

      <ActionGroup
        name="loginActionGroup"
        label='Action upon sign in for all other tabs:'
        description='This will change the setting for what happens on sign in'
        onChange={handleLoginActionChange}
        value={loginAction}
        radios={[
          {
            name: 'loginAction',
            id: 'loginReload',
            value: 'reload',
            label: 'Reload',
          },
          {
            name: 'loginAction',
            id: 'loginClose',
            value: 'close',
            label: 'Close',
          },
          {
            name: 'loginAction',
            id: 'loginDisabled',
            value: 'disabled',
            label: 'Disabled',

          },
        ]}
      />

      <ActionGroup
        name="logoutAction"
        label='Action upon sign out for all other tabs:'
        description='This will change the setting for what happens on sign out'
        onChange={handleLogoutActionChange}
        value={logoutAction}
        radios={[
          {
            name: 'logoutAction',
            id: 'logoutReload',
            value: 'reload',
            label: 'Reload',
          },
          {
            name: 'logoutAction',
            id: 'logoutClose',
            value: 'close',
            label: 'Close',
          },
          {
            name: 'logoutAction',
            id: 'logoutDisabled',
            value: 'disabled',
            label: 'Disabled',

          },
        ]}
      />

      <Text size="sm" mt="xl">Time to wait before performing action on all other tabs: <Text span fw={700}>{reloadDelay} Seconds</Text> </Text>
      <Slider defaultValue={3} value={reloadDelay} label={(reloadDelay) => `${reloadDelay} Seconds`} min={0} max={60} onChange={setReloadDelay} onChangeEnd={handleReloadDelayChange} step={1}/>

      <Space h="md" />

      <Group justify="center">
        <Text>Actions to do to all other tabs:</Text>
        <Button onClick={handleReloadTabs} variant="filled" size="compact-xs">Reload all other tabs from this hostname</Button>
        <Button onClick={handleCloseTabs} variant="filled" size="compact-xs">Close all other tabs from this hostname</Button>
      </Group>
      </div>
  );
};

export default App;
