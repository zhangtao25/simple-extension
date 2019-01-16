class Tabs {
  /**
   *
   * @param setting {Setting}
   * @param events {ExtensionEvent}
   */
  constructor({setting, events}) {
    this.data = {};
    this.events = events;
    this.setting = setting;

    events.addListener('tab_start', ({tabId, url}) => {
      const domain = GetDomain(url);
      if (setting.hasDomain(domain)) {
        if (this.has(tabId)) {
          this.reset(tabId);
        } else {
          this.data[tabId] = {domain, badge: 0, urls: []};
          this.update(tabId);
        }
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
              data.urls.splice(0, 0, {url, keyword});
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

  reset(tabId) {
    if (this.has(tabId)) {
      this.data[tabId].urls.length = 0;
      this.data[tabId].badge = 0;
      this.update(tabId);
    }
  }
}