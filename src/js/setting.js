/**
 * default domain data form
 * 默认域名数据格式
 * @type {string}
 */
import {GetStorage} from "./utils";
import Vue from 'vue';

export const DefaultDomainData = JSON.stringify({
  requests: [],
  cookies: {selected: null, cookies: {}},
  ua: {selected: null, value: null},
  rewrites: [],
  redirects: [],
});

export class Setting {
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
    //验证现存数据的格式
    Object.keys(this.data).forEach(key => {
      this.data[key] = Object.assign(JSON.parse(DefaultDomainData), this.data[key]);
    });
    chrome.storage.onChanged.addListener((changes, areaName) => {
      // console.log('%c storage Change', 'color: green', changes, areaName);
      if (Object.keys(changes).length > 0) {
        for (let key in changes) {
          const change = changes[key];
          if (change['newValue']) {
            // Vue.set(this.data, key, change['newValue']);
            Object.assign(this.data[key], change['newValue']);
            // this.data[key] = change['newValue'];
          }
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
   * @returns {Promise}
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
   * @return {Promise}
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
   * 设置URL监测
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
   * 删除URL监测
   * @param domain {String}
   * @param keyword {String}
   * @returns Promise
   */
  deleteRequest(domain, keyword) {
    if (this.hasDomain(domain)) {
      const index = this.data[domain].requests.indexOf(keyword);
      this.data[domain].requests.splice(index, 1);
    }
    return this.save();
  }

  /**
   * 添加URL改写
   * @param domain {String}
   * @param name {String}
   * @param rule {String}
   * @param value {String}
   * @returns {Promise}
   */
  setRewrite(domain, name, rule, value) {
    this.initDomain(domain);
    const data = {enable: 1, name, rule, value};
    const index = this.findRewrite(domain, name);
    if (index === -1)
      this.data[domain].rewrites.push(data);
    else
      this.data[domain].rewrites[index] = data;
    return this.save();
  }

  /**
   *
   * @param domain {string}
   * @param name {string}
   * @returns {number}
   */
  findRewrite(domain, name) {
    if (this.hasDomain(domain)) {
      for (let i = 0; i < this.data[domain].rewrites.length; i++) {
        const re = this.data[domain].rewrites[i];
        if (re.name === name) {
          return i;
        }
      }
    }
    return -1;
  }


  /**
   * 删除URL改写
   * @param domain
   * @param index
   * @returns {Promise}
   */
  deleteRewrite(domain, index) {
    if (this.hasDomain(domain) && this.data[domain].rewrites.length > index)
      this.data[domain].rewrites.splice(index, 1);
    return this.save();
  }

  /**
   * 启用/禁用URL改写
   * @param domain
   * @param index
   * @returns {Promise}
   */
  toggleRewrite(domain, index) {
    if (this.hasDomain(domain) && this.data[domain].rewrites.length > index)
      this.data[domain].rewrites[index].enable = this.data[domain].rewrites[index].enable === 0 ? 1 : 0;
    return this.save();
  }


  /**
   *
   * @param domain
   * @returns {Array}
   */
  getRewrites(domain) {
    if (this.hasDomain(domain))
      return this.data[domain].rewrites;
  }

  /**
   *
   * @param domain
   * @returns {Array}
   */
  getRedirects(domain) {
    if (this.hasDomain(domain))
      return this.data[domain].redirects;
  }

  /**
   * 添加重定向
   * @param domain
   * @param name
   * @param rule
   * @param value
   * @returns {Promise}
   */
  setRedirect(domain, name, rule, value) {
    this.initDomain(domain);
    const data = {enable: 1, name, rule, value};
    let index = -1;
    for (let i = 0; i < this.data[domain].redirects; i++) {
      const re = this.data[domain].redirects[i];
      if (re.name === name) {
        index = i;
        break;
      }
    }
    if (index !== -1)
      this.data[domain].redirects[index] = data;
    else
      this.data[domain].redirects.push(data);
    return this.save();
  }

  /**
   * 删除重定向
   * @param domain
   * @param index
   * @returns {Promise}
   */
  deleteRedirect(domain, index) {
    if (this.hasDomain(domain) && this.data[domain].redirects.length > index)
      this.data[domain].redirects.splice(index, 1);
    return this.save();
  }

  /**
   * 启用/禁用 重定向
   * @param domain
   * @param index
   * @returns {Promise}
   */
  toggleRedirect(domain, index) {
    if (this.hasDomain(domain) && this.data[domain].redirects.length > index)
      this.data[domain].redirects[index].enable = this.data[domain].redirects[index].enable === 0 ? 1 : 0;
    return this.save();
  }

  /**
   * 是否有domain的数据
   * @param domain
   * @returns {boolean}
   */
  hasDomain(domain) {
    return this.data.hasOwnProperty(domain);
  }

  /**
   * 初始化域名，但没有保存
   * @param domain
   */
  initDomain(domain) {
    if (this.hasDomain(domain))
      return;
    this.data[domain] = JSON.parse(DefaultDomainData);
  }

  /**
   * 保存扩展数据
   * @returns {Promise}
   */
  save() {
    return new Promise(resolve => {
      chrome.storage.local.set(this.data, () => {
        resolve();
      });
    });
  }

  /**
   * 清空所有扩展数据
   */
  clear() {
    chrome.storage.local.clear()
  }
}