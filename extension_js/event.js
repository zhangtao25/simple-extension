class ExtensionEvent {

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