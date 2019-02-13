import {Setting} from "../js/setting";
import {Event} from "../js/event";
import {Menu} from "../js/menu";
import {Tabs} from "../js/tabs";
import {SetCookies} from "../js/utils";

//启动Chrome填充所有Cookies
const setting = window.setting = new Setting(() => {
  for (const domain in setting.data) {
    const data = setting.data[domain];
    let isEmpty = Object.keys(data.cookies.cookies).length === 0 && data.requests.length === 0 && data.ua.selected === null && data.rewrites.length === 0;
    if (isEmpty) {
      delete setting.data[domain];
      continue;
    }
    if (!data.cookies.selected)
      continue;
    SetCookies(data.cookies.cookies[data.cookies.selected]);
    setting.save();
  }
});
const menu = new Menu(setting);
const events = new Event();
const tabs = window.tabs = new Tabs({events, setting, menu});