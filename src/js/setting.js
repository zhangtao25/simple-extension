import { get } from 'lodash'

/**
 * default domain data form
 * 默认的域名数据格式
 * @type {string}
 */
export const DefaultDomainData = JSON.stringify({
  requests: [],
  cookies: { selected: null, cookies: {} },
  ua: { selected: null, value: null },
  rewrites: [],
  redirects: [],
})

/**
 *
 * @param data
 * @returns {boolean}
 * @function
 */
export function IsDomainSettingEmpty (data) {
  return data && data.requests.length === 0 &&
    data.rewrites.length === 0 &&
    data.redirects.length === 0 &&
    Object.keys(data.cookies.cookies).length === 0 &&
    data.ua.value === null
}

const mainKey = ['domains', 'config', 'customUA']

export class Setting {
  constructor () {
    chrome.storage.onChanged.addListener(async () => {
      await this.init()
    })
  }

  async init () {
    this.data = await new Promise(resolve => {
      chrome.storage.sync.get(resolve)
    })

    //不是现在的版本，处理数据
    if (this.data.hasOwnProperty('domains') === false)
      this.data['domains'] = {}
    this.domains = this.data['domains']

    if (this.data.hasOwnProperty('customUA') === false)
      this.data['customUA'] = {}
    this.customUA = this.data['customUA']

    if (this.data.hasOwnProperty('config') === false)
      this.data['config'] = {}
    this.config = this.data['config']

    const configVersion = get(this.data, 'config.version')
    if (configVersion !== chrome.runtime.getManifest().version) {
      console.log('处理旧版本数据')
      const keys = Object.keys(this.data)
      keys.forEach(key => {
        if (mainKey.includes(key))
          return
        this.domains[key] = Object.assign(JSON.parse(DefaultDomainData),
          this.data[key])
      })
    }

    //更新版本记录
    this.config['version'] = chrome.runtime.getManifest().version

    //删除无用数据
    this.data = Object.keys(this.data).filter(key => !mainKey.includes(key))

    await this.save()
  }

  /**
   * 读取cookie
   * @param domain
   * @returns {*}
   */
  getCookies (domain) {
    if (this.hasDomain(domain))
      return this.domains[domain].cookies
  }

  /**
   *
   * @param domain
   * @param name
   * @returns {*}
   */
  getCookie (domain, name) {
    if (this.hasDomain(domain) && this.domains[domain].cookies[name])
      return this.domains[domain].cookies[name]
  }

  /**
   * 保存cookie
   * @param domain
   * @param name
   * @param cookies
   * @returns {Promise}
   */
  setCookie (domain, name, cookies) {
    this.initDomain(domain)
    this.domains[domain].cookies.selected = name
    this.domains[domain].cookies.cookies[name] = cookies
    return this.save()
  }

  /**
   * 选择Cookie
   * @param domain
   * @param name
   * @returns {Promise}
   */
  selectCookie (domain, name) {
    if (this.hasDomain(domain) && this.domains[domain].cookies.cookies[name]) {
      this.domains[domain].cookies.selected = name
    }
    return this.save()
  }

  /**
   *
   * @param domain
   * @returns {*}
   */
  getUA (domain) {
    if (this.hasDomain(domain))
      return this.domains[domain].ua
  }

  /**
   *
   * @param domain
   * @returns {Promise}
   */
  setDefaultUA (domain) {
    this.initDomain(domain)
    this.domains[domain].ua = { selected: null, value: null }
    return this.save()
  }

  /**
   *
   * @param domain
   * @param selected
   * @param value
   * @return {Promise}
   */
  setUA (domain, selected, value) {
    this.initDomain(domain)
    this.domains[domain].ua.selected = selected
    this.domains[domain].ua.value = value
    return this.save()
  }

  /**
   * 获取所有用户的自定义UA
   */
  getCustomUA () {
    return this.customUA
  }

  /**
   * 保存用户输入的自定义UA
   * @param name
   * @param value
   */
  setCustomUA (name, value) {
    this.customUA[name] = value
  }

  /**
   *
   * @param domain
   * @returns {*}
   */
  getRequests (domain) {
    if (this.hasDomain(domain))
      return this.domains[domain].requests
  }

  /**
   * 设置URL监测
   * @param domain {String}
   * @param keyword {String}
   * @return Promise
   */
  setRequest (domain, keyword) {
    this.initDomain(domain)
    this.domains[domain].requests.push(keyword)
    return this.save()
  }

  /**
   * 删除URL监测
   * @param domain {String}
   * @param keyword {String}
   * @returns Promise
   */
  deleteRequest (domain, keyword) {
    if (this.hasDomain(domain)) {
      const index = this.domains[domain].requests.indexOf(keyword)
      this.domains[domain].requests.splice(index, 1)
    }
    return this.save()
  }

  /**
   * 添加URL改写
   * @param domain {String}
   * @param name {String}
   * @param rule {String}
   * @param value {String}
   * @returns {Promise}
   */
  setRewrite (domain, name, rule, value) {
    this.initDomain(domain)
    const data = { enable: 1, name, rule, value }
    const index = this.findRewrite(domain, name)
    if (index === -1)
      this.domains[domain].rewrites.push(data)
    else
      this.domains[domain].rewrites[index] = data
    return this.save()
  }

  /**
   *
   * @param domain {string}
   * @param name {string}
   * @returns {number}
   */
  findRewrite (domain, name) {
    if (this.hasDomain(domain)) {
      for (let i = 0; i < this.domains[domain].rewrites.length; i++) {
        const re = this.domains[domain].rewrites[i]
        if (re.name === name) {
          return i
        }
      }
    }
    return -1
  }

  /**
   * 删除URL改写
   * @param domain
   * @param index
   * @returns {Promise}
   */
  deleteRewrite (domain, index) {
    if (this.hasDomain(domain) && this.domains[domain].rewrites.length > index)
      this.domains[domain].rewrites.splice(index, 1)
    return this.save()
  }

  /**
   * 启用/禁用URL改写
   * @param domain
   * @param index
   * @returns {Promise}
   */
  toggleRewrite (domain, index) {
    if (this.hasDomain(domain) && this.domains[domain].rewrites.length >
      index)
      this.domains[domain].rewrites[index].enable = this.domains[domain].rewrites[index].enable ===
      0 ? 1 : 0
    return this.save()
  }

  /**
   *
   * @param domain
   * @returns {Array}
   */
  getRewrites (domain) {
    if (this.hasDomain(domain))
      return this.domains[domain].rewrites
  }

  /**
   *
   * @param domain
   * @returns {Array}
   */
  getRedirects (domain) {
    if (this.hasDomain(domain))
      return this.domains[domain].redirects
  }

  /**
   * 添加重定向
   * @param domain
   * @param name
   * @param rule
   * @param value
   * @returns {Promise}
   */
  setRedirect (domain, name, rule, value) {
    this.initDomain(domain)
    const data = { enable: 1, name, rule, value }
    let index = -1
    for (let i = 0; i < this.domains[domain].redirects; i++) {
      const re = this.domains[domain].redirects[i]
      if (re.name === name) {
        index = i
        break
      }
    }
    if (index !== -1)
      this.domains[domain].redirects[index] = data
    else
      this.domains[domain].redirects.push(data)
    return this.save()
  }

  /**
   * 删除重定向
   * @param domain
   * @param index
   * @returns {Promise}
   */
  deleteRedirect (domain, index) {
    if (this.hasDomain(domain) && this.domains[domain].redirects.length >
      index)
      this.domains[domain].redirects.splice(index, 1)
    return this.save()
  }

  /**
   * 启用/禁用 重定向
   * @param domain
   * @param index
   * @returns {Promise}
   */
  toggleRedirect (domain, index) {
    if (this.hasDomain(domain) && this.domains[domain].redirects.length >
      index)
      this.domains[domain].redirects[index].enable = this.domains[domain].redirects[index].enable ===
      0 ? 1 : 0
    return this.save()
  }

  /**
   * 是否有domain的数据
   * @param domain
   * @returns {boolean}
   */
  hasDomain (domain) {
    return this.domains.hasOwnProperty(domain)
  }

  /**
   * 初始化域名，但没有保存
   * @param domain
   */
  initDomain (domain) {
    if (this.hasDomain(domain))
      return
    this.domains[domain] = JSON.parse(DefaultDomainData)
  }

  /**
   * 保存扩展数据
   * @returns {Promise}
   */
  save () {
    return new Promise(resolve => {
      chrome.storage.sync.set(this.data, () => {
        resolve()
      })
    })
  }

  /**
   * 清空所有扩展数据
   */
  clear () {
    chrome.storage.sync.clear()
    this.init()
  }

  /**
   * 同步数据
   */
  async sync () {
    const data = await new Promise(resolve => {
      chrome.storage.sync.get(data => resolve(data))
    })
    await new Promise(resolve => {
      chrome.storage.sync.set(data, () => {
        console.log('云存储', 'ok')
      })
    })
  }

  /**
   * sync用量
   * @return {Promise<void>}
   */
  async used () {
    return new Promise(resolve => {
      chrome.storage.sync.getBytesInUse(used => resolve(used))
    })
  }
}