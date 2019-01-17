const setting = new Setting(() => {

  console.log('隐身模式注入cookies');
  for (const domain in setting.data) {
    const data = setting.data[domain];
    if (!data.cookies.selected)
      continue;
    SetCookies(data.cookies.cookies[data.cookies.selected]);
  }
});
const menu = new MyMenu();
const events = new ExtensionEvent();
const tabs = window.tabs = new Tabs({events, setting});

/**
 * 改变网络请求User-Agent
 */
chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    const {tabId, url} = details;
    if (tabs.has(tabId)) {
      const ua = setting.getUA(tabs.data[tabId].domain);
      if (ua && ua.value) {
        for (let i = 0; i < details.requestHeaders.length; i++) {
          const header = details.requestHeaders[i];
          if (header.name.toLowerCase() === 'user-agent') {
            // console.log('替换UA', header.value, ua.value);
            header.value = ua.value;
            break;
          }
        }
      }
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["http://*/*", "https://*/*"]},
  ["blocking", "requestHeaders"]
);


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
  try {
    chrome.browserAction.enable(tab.id);
    chrome.browserAction.setTitle({
      tabId: tab.id,
      title: GetLanguageString(StringBrowserActionEnable, [['%domain', domain]])
    });
  } catch (e) {
  }
  // console.log('update', tab);
  menu.update(tab.url, domain);
};

//tab切换
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, update);
});

//tab内容变化
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  update(tab);
});

//窗口焦点变化
chrome.windows.onFocusChanged.addListener(windowId => {
  chrome.tabs.query({currentWindow: true, active: true}, tabs => {
    if (tabs.length > 0) {
      update(tabs[0]);
    }
  });
});

//监听content_js/index.js返回的消息，并创建桌面通知
/*chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

});*/
