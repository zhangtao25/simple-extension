window.onload = () => {
  console.log('%c window onload ' + Date.now(), 'color: red');
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const tab = tabs[0], domain = GetDomain(tab.url);
    if (!domain) {
      chrome.browserAction.disable(tab.id);
      window.close();
      return;
    }

    const setting = new Setting(() => {

      const data = Object.assign(
        {
          ua: {selected: null, value: null,},
          cookies: {selected: null, cookies: {}},
          requests: [],
        },
        setting.data[domain]);

      window.app = new Vue({
        el: '#app',
        data: {
          tab,
          domain,
          ua_list: UA,
          ui: {
            cookies: GetLanguageString(StringCookies),
            requests: GetLanguageString(StringRequests),
            ua: GetLanguageString(StringUA),
            ua_placeholder: GetLanguageString(''),
            ua_default: GetLanguageString(MenuUseragentDefaultText),
          },
          data,
        },
        computed: {
          uaEditor: {
            get: function () {
              return this.data.ua.value ? this.data.ua.value : '';
            },
            set: function (value) {
              this.data.ua.value = value.trim().replace('\n', '');
            },
          },
          selectedUA: {
            get: function () {
              return this.data.ua.selected ? this.data.ua.selected : 'default';
            },
            set: function (value) {
              this.data.ua.selected = value;
              setting.save().then(() => {
                chrome.tabs.reload(tab.id);
              });
            }
          },
        },
        methods: {
          selectCookie(key) {
            console.log('selectCookie', key, JSON.stringify(this.data.cookies));
            if (this.data.cookies.selected === key || !this.data.cookies.cookies[key])
              return;
            this.data.cookies.selected = key;
            SetCookies(this.data.cookies.cookies[key])
              .then(() => setting.selectCookie(domain, key))
              .then(() => {
                chrome.tabs.reload(tab.id);
              });
          },
          async saveCookie() {
            const cookies = await GetCookies(tab.url);
            if (!cookies)
              return;
            const name = prompt(GetLanguageString(PromptSaveCookiesName));
            //取消保存
            if (name === null || name.trim().length === 0) {
              console.log('取消保存Cookies');
              return;
            }
            setting.setCookie(domain, name, cookies);
          },
        },
      });
    });
  });
};