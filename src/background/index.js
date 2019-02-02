import {Setting} from "../js/setting";
import {Event} from "../js/event";
import {Menu} from "../js/menu";
import {Tabs} from "../js/tabs";
import {SetCookies} from "../js/utils";

//启动Chrome就填充所有Cookies
const setting = window.setting = new Setting(() => {
  for (const domain in setting.data) {
    const data = setting.data[domain];
    if (!data.cookies.selected)
      continue;
    SetCookies(data.cookies.cookies[data.cookies.selected]);
  }
});
const menu = new Menu(setting);
const events = new Event();
const tabs = window.tabs = new Tabs({events, setting, menu});