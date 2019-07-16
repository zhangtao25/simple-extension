import {
  GetLanguageString,
  MenuCookieEmptyText,
  MenuCookieRootText,
  MenuCookieUseText,
  MenuRootText,
  MenuUseragentDefaultText,
  MenuUseragentRootText,
  PromptSaveCookiesName,
  StringSave,
} from './i18_string_name'
import { ClearCookies, GetCookies, GetDomain, SetCookies } from './utils'
import { UA } from './ua_list'

let setting
const __menu__ = {
  title: MenuRootText,
  documentUrlPatterns: ['http://*/*', 'https://*/*'],
  children: [
    {
      title: MenuCookieRootText,
      children: [
        {
          //菜单保存Cookies
          title: StringSave,
          onclick: async(info, tab) => {
            const domain = GetDomain(info.pageUrl)
            const cookies = await GetCookies(info.pageUrl)
            cookies.forEach(cookie => {
              cookie['url'] = info.pageUrl
            })
            const name = prompt(GetLanguageString(PromptSaveCookiesName))

            // 重新激活用户使用的Chrome窗口
            chrome.windows.getLastFocused({}, win => {
              if(win) {
                chrome.windows.update(win.id, { focused: true })
              }
            })

            //取消保存
            if(name === null || name.trim().length === 0) {
              console.log('取消保存Cookies')
              return
            }

            console.log('获取Cookies后', cookies)
            setting.setCookie(domain, name, cookies)

            return { domain }
          },
        },
      ],
    },
    {
      title: MenuUseragentRootText,
      children: [
        {
          //将域名的UA设置回到默认状态
          title: MenuUseragentDefaultText,
          type: 'checkbox',
          onclick: (info, tab) => {
            const domain = GetDomain(info.pageUrl)
            if(!domain)
              return
            setting.setDefaultUA(domain)
            chrome.tabs.reload(tab.id)
          },
        },
      ],
    },
  ],
}

export class Menu {
  /**
   *
   * @param _setting {Setting}
   */
  constructor(_setting) {
    setting = _setting
    this.menus = {}
    this.cookiesMenus = []
    this.uaMenus = []
    const loop = (parentId, child) => {
      const title = chrome.i18n.getMessage(child.title),
        hasChildren = child.hasOwnProperty('children'),
        hasOnClick = child.hasOwnProperty('onclick')

      if(!hasChildren && !hasOnClick)
        throw Error('缺少children数组或onclick事件：' + title)

      const data = { title }
      if(parentId)
        data.parentId = parentId
      if(hasOnClick) {
        data.onclick = (info, tab) => {
          const res = child.onclick(info, tab)
          if(res && res.constructor === Promise) {
            res.then(res => {
              console.log('更新menu', res)
              if(res && res.domain) {
                this.update(info.pageUrl, res.domain)
              }
            })
          }
        }
      }
      if(child.hasOwnProperty('type'))
        data.type = child.type
      if(child.hasOwnProperty('documentUrlPatterns'))
        data.documentUrlPatterns = child.documentUrlPatterns
      const menuId = chrome.contextMenus.create(data)

      if(hasChildren) {
        child.children.forEach(item => {
          this.menus[item.title] = loop(menuId, item)
        })
      }
      return menuId
    }
    this.menus[__menu__.title] = loop(null, __menu__)
  }

  /**
   *
   * @param url
   * @param domain
   */
  update(url, domain) {
    this.__updateRootMenu(domain)
    this.__updateCookiesMenu(url, domain)
    this.__updateUAMenu(domain)
  }

  /**
   *
   * @param domain {string}
   */
  __updateRootMenu(domain) {
    // console.log('updateRootMenu', GetLanguageString(MenuRootText, [['%domain', domain]]));
    chrome.contextMenus.update(this.menus[MenuRootText],
      { title: GetLanguageString(MenuRootText, [['%domain', domain]]) })
  }

  /**
   *
   * @param url {string}
   * @param domain {string}
   */
  __updateCookiesMenu(url, domain) {
    //保存Cookie的菜单

    GetCookies(url).then(cookies => {
      const enabled = cookies.length > 0
      const title = GetLanguageString(
        cookies.length > 0 ? StringSave : MenuCookieEmptyText,
        [['%domain', domain]])
      chrome.contextMenus.update(this.menus[StringSave], { enabled, title })
    })

    // 切换Cookie
    try {
      chrome.contextMenus.remove(this.menus[MenuCookieUseText])
    } catch(e) {
      // console.log(e);
    }
    const parentId = this.menus[MenuCookieRootText]
    const domainCookies = setting.getCookies(domain)

    // console.log('更新菜单', domain, domainCookies);
    this.menus[MenuCookieUseText] = chrome.contextMenus.create({
      parentId,
      title: GetLanguageString(MenuCookieUseText),
      enabled: domainCookies && Object.keys(domainCookies.cookies).length > 0,
    })
    if(domainCookies) {
      for(let name in domainCookies.cookies) {
        chrome.contextMenus.create({
          parentId: this.menus[MenuCookieUseText],
          title: name,
          type: 'checkbox',
          checked: domainCookies.selected === name,
          onclick: (info, tab) => {
            ClearCookies(tab.url).
              then(() => SetCookies(domainCookies.cookies[name])).
              then(() => {
                setting.selectCookie(domain, name)
                chrome.tabs.reload(tab.id)
              })
          },
        })
      }
    } else {
      chrome.contextMenus.create({
        parentId: this.menus[MenuCookieUseText],
        title: GetLanguageString('string_empty'),
        enabled: false,
      })
    }
  }

  __updateUAMenu(domain) {

    //清空子菜单
    this.uaMenus.forEach(id => {
      try {
        chrome.contextMenus.remove(id)
      } catch(e) {
      }
    })
    this.uaMenus.length = 0

    const currentSelected = setting.getUA(domain)

    //检测是否在用默认UA
    chrome.contextMenus.update(this.menus[MenuUseragentDefaultText],
      { checked: !currentSelected })

    for(let os in UA) {
      const osId = chrome.contextMenus.create(
        { title: os, parentId: this.menus[MenuUseragentRootText] })
      this.uaMenus.push(osId)
      for(let browser in UA[os]) {
        const current = os + '_' + browser
        chrome.contextMenus.create({
          parentId: osId,
          type: 'checkbox',
          checked: currentSelected
            ? currentSelected.selected === current
            : false,
          title: browser,
          onclick: (info, tab) => {
            setting.setUA(domain, current, UA[os][browser])
            chrome.tabs.reload(tab.id)
          },
        })
      }
    }
  }
}