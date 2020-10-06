import { Setting } from '../js/setting'
import { Event } from '../js/event'
import { Menu } from '../js/menu'
import { Tabs } from '../js/tabs'
import { SetCookies } from '../js/utils'

//启动Chrome填充所有Cookies
const setting = window.setting = new Setting()


setting.init().then(() => {
  console.log('background setting', setting)
  console.log('setting', setting)
  const domains = Object.keys(setting.domains)
  for (const i in domains) {
    const domain = domains[i]
    const data = setting.domains[domain]
    const cookies = data.cookies.cookies[data.cookies.selected]
    if (!cookies)
      continue
    // console.log('设置cookies', domain, '数量', cookies.length)
    SetCookies(cookies)
  }
}).catch(err => {console.error('错误', err)})

const menu = new Menu(setting)
const events = new Event()
const tabs = window.tabs = new Tabs({ events, setting, menu })