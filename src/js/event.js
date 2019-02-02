export class Event {

  constructor() {
    this.events = {};
    this.init();
  }

  init() {
    console.log('event init', '监听');
    /**
     * 监听Tab不可见的网络请求
     */
    chrome.webRequest.onCompleted.addListener(
      details => {
        const {tabId, url} = details;
        // console.log('webRequest onCompleted', {tabId, url});
        this.trigger('tab_load', {tabId, url});
      },
      {urls: ["http://*/*", "https://*/*"]}
    );

    /**
     * 监听Tab可见式的请求，例如打开网页
     * parentFrameId=-1 为Tab自身读取的网址，可以视为一个Tab打开网页的始点
     */
    chrome.webNavigation.onBeforeNavigate.addListener(details => {
      const {tabId, url, parentFrameId} = details;

      if (parentFrameId === -1) {
        this.trigger('tab_start', {tabId, url});
      } else {
        this.trigger('tab_load', {tabId, url});
      }
    });

    chrome.tabs.onRemoved.addListener(tabId => {
      this.trigger('tab_close', {tabId});
    });

    //tab切换
    chrome.tabs.onActivated.addListener(activeInfo => {
      chrome.tabs.get(activeInfo.tabId, tab => {
        this.trigger('tab_update', {tabId: tab.id, url: tab.url});
      });
    });

    //tab内容变化
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.trigger('tab_update', {tabId, url: tab.url});
    });

    //窗口焦点变化
    chrome.windows.onFocusChanged.addListener(windowId => {
      chrome.tabs.query({currentWindow: true, active: true}, tabs => {
        if (tabs.length > 0) {
          this.trigger('tab_update', {tabId: tabs[0].id, url: tabs[0].url});
        }
      });
    });
  }

  /**
   *
   * @param name
   * @param callback
   */
  addListener(name, callback) {
    if (!this.events.hasOwnProperty(name))
      this.events[name] = [];
    this.events[name].push(callback);
  }

  removeListener(name, callback) {
    if (this.events.hasOwnProperty(name)) {
      const index = this.events[name].indexOf(callback);
      if (index !== -1)
        this.events[name].splice(index, 1);
    }
  }

  trigger(name, data) {
    if (this.events[name] && this.events[name].length > 0)
      this.events[name].forEach(cb => cb(data));
  }
}