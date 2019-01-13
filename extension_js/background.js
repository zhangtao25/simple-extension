function init() {
  console.log('runtime onInstalled');
  const setting = new Setting(() => {

    console.log('隐身模式注入cookies');
    for (const domain in setting.data) {
      const data = setting.data[domain];
      if (!data.cookies.selected)
        continue;
      SetCookies(data.cookies.cookies[data.cookies.selected]);
    }
  });
  const menu = new MyMenu(setting);


  const tabCache = {};
  /**
   * @param tab
   */
  const update = (tab) => {
    const domain = GetDomain(tab.url);
    if (!domain) {
      chrome.browserAction.disable(tab.id);
      chrome.browserAction.setTitle({
        tabId: tab.id,
        title: GetLanguageString(StringBrowserActionDisabled)
      });
      return;
    }
    chrome.browserAction.enable(tab.id);
    chrome.browserAction.setTitle({
      tabId: tab.id,
      title: GetLanguageString(StringBrowserActionEnable, [['%domain', domain]])
    });
    UpdateBadge(tab);
    // console.log('update', tab);
    menu.update(tab.url, domain);
  };

  //tab切换
  chrome.tabs.onActivated.addListener(activeInfo => {
    console.log('tab onActivated');
    chrome.tabs.get(activeInfo.tabId, update);
  });

  //tab内容变化
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('%c标签update', 'color:red;', changeInfo.status, tab.status);
    update(tab);
  });

  //窗口焦点变化
  chrome.windows.onFocusChanged.addListener(windowId => {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      console.log('window onFocusChanged', tabs.length);
      if (tabs.length > 0) {
        update(tabs[0]);
      }
    });
  });

  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    const id = removeInfo.windowId + '_' + tabId;
  });

  //监听content_js/index.js返回的消息，并创建桌面通知
  chrome.runtime.onMessage.addListener(message => {
    const {tabUrl, url} = message;
    const tabDomain = GetDomain(tabUrl),
      urlDomain = GetDomain(url);
    if (!tabDomain || !urlDomain)
      return;

    //不监听相同域名的请求，因为在extension_js/request.js里监听了
    if (urlDomain === tabDomain)
      return;
    console.log('监听消息', {tabDomain, urlDomain});

    const requests = setting.getRequests(tabDomain);
    if (!requests)
      return;

    for (let i = 0; i < requests.length; i++) {
      if (url.indexOf(requests[i]) === -1)
        continue;
      CreateNotification(
        GetLanguageString(NotificationRequestTitle, [['%domain', tabDomain]]),
        GetLanguageString(NotificationRequestMessage, [['%url', url]]),
        url,
      );
    }

  });
}

init();