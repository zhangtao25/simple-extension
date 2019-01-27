window.onload = () => {
  console.log('%c window onload ' + Date.now(), 'color: red');
  window.bg = chrome.extension.getBackgroundPage();
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const tab = tabs[0], domain = GetDomain(tab.url);
    if (!domain) {
      chrome.browserAction.disable(tab.id);
      window.close();
      return;
    }
    if (!bg.tabs.has(tab.id)) {
      bg.tabs.reset(tab.id, domain);
    }

    const setting = new Setting(() => {

      const data = Object.assign(
        {
          ua: {selected: null, value: null,},
          cookies: {selected: null, cookies: {}},
          requests: [],
        },
        setting.data[domain]);
      let saveTimeout = null;

      window.app = new Vue({
        el: '#app',
        data: {
          domain,
          ua_list: UA,
          ui: {
            cookies: GetLanguageString(StringCookies),
            requests: GetLanguageString(StringRequests),
            ua: GetLanguageString(StringUA),
            ua_placeholder: GetLanguageString(''),
            ua_default: GetLanguageString(MenuUseragentDefaultText),
            save_cookies: GetLanguageString('string_save'),
            url_list: GetLanguageString('string_url_list'),
            confirm_delete_cookie: GetLanguageString('confirm_delete_cookie'),
            confirm_delete_request: GetLanguageString('confirm_delete_request'),
          },
          data,
          urls: bg.tabs.data[tab.id].urls,
        },
        computed: {
          uaEditor: {
            get: function () {
              return this.data.ua.value ? this.data.ua.value : '';
            },
            set: function (value) {
              this.data.ua.value = value.trim().replace('\n', '');
              setting.data[domain].ua.value = this.data.ua.value;
              this.save();
            },
          },
          selectedUA: {
            get: function () {
              return this.data.ua.selected ? this.data.ua.selected : 'default';
            },
            set: function (value) {
              this.data.ua.selected = value;
              setting.data[domain].ua.selected = value;
              this.save();
            }
          },
          requestsList() {
            return this.urls.reverse();
          },
        },
        methods: {
          async selectCookie(key) {
            console.log('selectCookie', key, JSON.stringify(this.data.cookies));
            if (this.data.cookies.selected === key || !this.data.cookies.cookies[key])
              return;
            this.data.cookies.selected = key;
            await SetCookies(this.data.cookies.cookies[key]);
            await setting.selectCookie(domain, key);
            chrome.tabs.reload(tab.id);
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
            await setting.setCookie(domain, name, cookies);
            this.updateData();
          },
          async deleteCookie(key) {
            if (confirm(this.ui.confirm_delete_cookie.replace('%name', key)) === false)
              return;
            delete this.data.cookies.cookies[key];
            delete setting.data[domain].cookies.cookies[key];
            delete this.data.cookies.cookies[key];
            if (setting.data[domain].cookies.selected === key) {
              setting.data[domain].cookies.selected = null;
              this.data.cookies.selected = null;
            }
            await setting.save();
            this.updateData();
          },
          async addRequest() {
            let keyword = prompt(GetLanguageString(PromptHowToGetTheRequestUrl), GetLanguageString(PromptRequestExample));
            if (!keyword)
              return;
            keyword = keyword.trim();
            if (keyword.length === 0)
              return;

            if (this.data.requests.indexOf(keyword) !== -1)
              return;

            setting.setRequest(domain, keyword).then(() => {
              this.updateData();
            });
          },
          async deleteRequest(value) {
            if (confirm(this.ui.confirm_delete_request) === false)
              return;

            setting.deleteRequest(domain, value).then(() => {
              this.updateData();
            });
          },
          clearUrls() {
            this.urls.length = 0;
            bg.tabs.reset(tab.id);
            this.$forceUpdate();
          },
          updateData() {
            this.data = setting.data[domain];
            this.$forceUpdate();
          },
          save() {
            if (saveTimeout)
              clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
              console.log('保存');
              await setting.save();
              this.updateData();
            }, 200);
          }
        },
      });
    });
  });
};