class Setting {
  /**
   *
   * @param cb
   */
  constructor(cb = null) {
    this.init().then(() => {
      cb && cb();
    });
  }

  async init() {
    this.data = await GetStorage(null, {});
    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log('%c storage Change', 'color: green', changes, areaName);
      if (Object.keys(changes).length > 0) {
        for (let key in changes) {
          const change = changes[key];
          if (change['newValue'])
            this.data[key] = change['newValue'];
        }
      }
    });
  }

  /**
   * 读取cookie
   * @param domain
   * @returns {*}
   */
  getCookies(domain) {
    if (this.hasDomain(domain))
      return this.data[domain].cookies;
  }

  /**
   *
   * @param domain
   * @param name
   * @returns {*}
   */
  getCookie(domain, name) {
    if (this.hasDomain(domain) && this.data[domain].cookies[name])
      return this.data[domain].cookies[name];
  }

  /**
   * 保存cookie
   * @param domain
   * @param name
   * @param cookies
   * @returns {Promise}
   */
  setCookie(domain, name, cookies) {
    this.initDomain(domain);
    this.data[domain].cookies.selected = name;
    this.data[domain].cookies.cookies[name] = cookies;
    return this.save();
  }

  /**
   * 选择Cookie
   * @param domain
   * @param name
   * @returns {Promise}
   */
  selectCookie(domain, name) {
    if (this.hasDomain(domain) && this.data[domain].cookies.cookies[name]) {
      this.data[domain].cookies.selected = name;
    }
    return this.save();
  }

  /**
   *
   * @param domain
   * @returns {*}
   */
  getUA(domain) {
    if (this.hasDomain(domain))
      return this.data[domain].ua;
  }

  /**
   *
   * @param domain
   */
  setDefaultUA(domain) {
    this.initDomain(domain);
    this.data[domain].ua = {selected: null, value: null};
    return this.save();
  }

  /**
   *
   * @param domain
   * @param selected
   * @param value
   */
  setUA(domain, selected, value) {
    this.initDomain(domain);
    this.data[domain].ua.selected = selected;
    this.data[domain].ua.value = value;
    return this.save();
  }

  /**
   *
   * @param domain
   * @returns {*}
   */
  getRequests(domain) {
    if (this.hasDomain(domain))
      return this.data[domain].requests;
  }

  /**
   *
   * @param domain {String}
   * @param keyword {String}
   * @return Promise
   */
  setRequest(domain, keyword) {
    this.initDomain(domain);
    this.data[domain].requests.push(keyword);
    return this.save();
  }

  /**
   *
   * @param domain {String}
   * @param keyword {String}
   * @returns Promise
   */
  deleteRequest(domain, keyword) {
    if (this.hasDomain(domain)) {
      const index = this.data[domain].requests.indexOf(keyword);
      this.data[domain].requests.splice(index, 1);
      return this.save();
    }
    return Promise.all([]);
  }

  hasDomain(domain) {
    return this.data.hasOwnProperty(domain);
  }

  initDomain(domain) {
    if (this.hasDomain(domain))
      return;
    this.data[domain] = {requests: [], cookies: {selected: null, cookies: {}}, ua: {selected: null, value: null}};
  }

  /**
   *
   * @returns {Promise<any>}
   */
  save() {
    return new Promise(resolve => {
      chrome.storage.local.set(this.data, () => {
        resolve();
      });
    });
  }

  clear() {
    chrome.storage.local.clear()
  }
}