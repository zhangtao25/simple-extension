class Tabs {
  /**
   *
   * @param setting {Setting}
   * @param events {ExtensionEvent}
   * @param menu {Menu}
   */
  constructor({setting, events, menu}) {
    this.data = {};
    this.events = events;
    this.setting = setting;
    this.menu = menu;

    events.addListener('tab_start', ({tabId, url}) => {
      const domain = GetDomain(url);
      if (domain) {
        chrome.browserAction.enable(tabId);
        chrome.browserAction.setTitle({
          tabId,
          title: GetLanguageString(StringBrowserActionEnable, [['%domain', domain]])
        });
        this.reset(tabId, domain);
      } else {
        chrome.browserAction.disable(tabId);
        chrome.browserAction.setTitle({
          tabId,
          title: GetLanguageString(StringBrowserActionDisabled)
        });
      }
    });
    events.addListener('tab_load', ({tabId, url}) => {
      if (this.has(tabId)) {
        const data = this.data[tabId];
        const domainSetting = setting.data[data.domain];
        if (domainSetting && domainSetting.requests.length > 0) {
          let hasUrl = false;
          domainSetting.requests.forEach(keyword => {
            if (url.indexOf(keyword) !== -1) {
              data.urls.push({url, keyword});
              data.badge++;
              hasUrl = true;
            }
          });
          hasUrl && this.update(tabId);
        }
      }
    });
    events.addListener('tab_close', ({tabId, url}) => {
      this.remove(tabId);
    });
    events.addListener('tab_update', ({tabId, url}) => {
      if (this.has(tabId)) {
        const data = this.data[tabId];
        menu.update(url, data.domain)
      }
    });

    /**
     * 改变网络请求User-Agent
     */
    chrome.webRequest.onBeforeSendHeaders.addListener(details => {
        const {tabId, url} = details;
        if (this.has(tabId)) {
          const ua = setting.getUA(this.data[tabId].domain);
          for (let i = 0; i < details.requestHeaders.length; i++) {
            const header = details.requestHeaders[i];
            const name = header.name.toLowerCase()
            if (name === 'user-agent' && ua && ua.value) {
              // console.log('替换UA', header.value, ua.value);
              header.value = ua.value;
              break;
            } else if (name === 'accept-language') {
              // header.value = 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5';
            }
          }
        }
        return {requestHeaders: details.requestHeaders};
      },
      {urls: ['http://*/*', 'https://*/*']},
      ['blocking', 'requestHeaders']
    );
  }

  update(tabId) {
    if (this.data[tabId]) {
      if (this.data[tabId].badge > 0)
        chrome.browserAction.setBadgeText({tabId, text: this.data[tabId].badge + ''});
      else
        chrome.browserAction.setBadgeText({tabId, text: ''});
    }
  }

  remove(tabId) {
    delete this.data[tabId];
  }

  get(tabId) {
    return this.data[tabId];
  }

  has(tabId) {
    return this.data.hasOwnProperty(tabId);
  }

  reset(tabId, domain) {
    if (this.has(tabId)) {
      this.data[tabId].urls.length = 0;
      this.data[tabId].badge = 0;
      this.data[tabId].domain = domain;
    } else {
      this.data[tabId] = {domain, badge: 0, urls: []};
    }
    this.update(tabId);
  }
}