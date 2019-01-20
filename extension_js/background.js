const setting = new Setting(() => {
  for (const domain in setting.data) {
    const data = setting.data[domain];
    if (!data.cookies.selected)
      continue;
    SetCookies(data.cookies.cookies[data.cookies.selected]);
  }
});
const menu = new Menu();
const events = new ExtensionEvent();
const tabs = window.tabs = new Tabs({events, setting, menu});