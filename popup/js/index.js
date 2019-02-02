/**
 *
 * @param message
 * @param _default
 * @returns {String}
 * @function
 */
function Prompt(message = null, _default = null) {
  let value = prompt(message ? message : '', _default ? _default : '');
  if (!value)
    return '';
  return value.trim();
}

/**
 * copy from:
 * https://makandracards.com/makandra/15879-javascript-how-to-generate-a-regular-expression-from-a-string
 * @param string
 * @returns {string}
 */
RegExp.escape = function (string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};

const RegularExpression = /^\/.+\/[gi]$/;

/**
 *
 * @param message
 * @param _default
 * @returns {String || null}
 * @function
 */
function GetRegExp(message, _default = null) {
  let input = '', hasError = false;
  while (true) {
    const _msg = hasError ? message + '\n' + GetLanguageString('prompt_regexp_error') : message,
      _val = hasError ? input : _default;
    input = Prompt(_msg, _val);
    if (RegularExpression.test(input)) {
      try {
        new RegExp(input);
        break;
      } catch (e) {
        hasError = true;
      }
    } else {
      break;
    }
  }
  return input;
}

window.addEventListener('load', () => {
  console.log('%c 浮动页面 onload ' + Date.now(), 'color: red');
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
    const setting = bg.tabs.setting;
    const data = Object.assign(
      {
        ua: {selected: null, value: null,},
        cookies: {selected: null, cookies: {}},
        requests: [],
        rewrites: [],
        redirects: [],
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
          ua_default: GetLanguageString(MenuUseragentDefaultText),
          save_cookies: GetLanguageString('string_save'),
          url_list: GetLanguageString('string_url_list'),
          rewrite: GetLanguageString('string_host_rewrite'),
          redirect: GetLanguageString('string_host_redirect'),
        },
        data,
        urls: bg.tabs.data[tab.id].urls,
      },
      computed: {
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
          if (!cookies || cookies.length === 0)
            return alert(GetLanguageString(AlertNoCookies, [['%domain', domain]]));

          const name = Prompt(GetLanguageString(PromptSaveCookiesName));
          //取消保存
          if (!name)
            return;

          await setting.setCookie(domain, name, cookies);
          this.updateData();
        },
        async deleteCookie(key) {
          if (confirm(GetLanguageString(ConfirmDeleteCookie, [['%name', key]])) === false)
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
          let keyword = Prompt(GetLanguageString(PromptHowToGetTheRequestUrl), 'video.m3u8');
          if (!keyword)
            return;

          if (this.data.requests.indexOf(keyword) !== -1)
            return;

          await setting.setRequest(domain, keyword);
          this.updateData();
        },
        async deleteRequest(value) {
          if (confirm(GetLanguageString(ConfirmDeleteRequest)) === false)
            return;

          await setting.deleteRequest(domain, value);
          this.updateData();
        },
        async addRewrite() {
          const name = Prompt(GetLanguageString(PromptRewriteName));
          if (!name)
            return;
          const rule = GetRegExp(GetLanguageString(PromptRewriteRule));
          if (!rule)
            return;
          const value = Prompt(GetLanguageString(PromptRewriteValue));
          if (!value)
            return;
          await setting.setRewrite(domain, name, rule, value);
          this.updateData();
        },
        /**
         *
         * @param index
         * @returns {Promise<void>}
         */
        async deleteRewrite(index) {
          if (this.data.rewrites[index])
            if (confirm(GetLanguageString('confirm_delete_rewrite',
              [['%name', this.data.rewrites[index].name]])))
              await setting.deleteRewrite(domain, index);
          this.updateData();
        },
        /**
         *
         * @param index
         * @returns {Promise<void>}
         */
        async toggleRewrite(index) {
          await setting.toggleRewrite(domain, index);
          this.updateData();
        },
        async modifyRewriteOrRedirect(index, type, attribute) {
          if (['rewrites', 'redirects'].indexOf(type) === -1 || ['name', 'rule', 'value'].indexOf(attribute) === -1)
            return;
          if (setting.data[domain][type][index]) {
            const data = setting.data[domain][type][index];
            const message = GetLanguageString('prompt_host_' + type + '_' + attribute),
              value = data[attribute];
            const input = attribute === 'rule' ? GetRegExp(message, value) : Prompt(message, value);
            if (!input)
              return;
            data[attribute] = input;
            await setting.save();
            this.updateData();
          }
        },
        async addRedirect() {
          const name = Prompt(GetLanguageString(PromptRedirectName));
          if (!name)
            return;
          const rule = GetRegExp(GetLanguageString(PromptRedirectRule));
          if (!rule)
            return;
          const value = Prompt(GetLanguageString(PromptRedirectValue));
          if (!value)
            return;
          await setting.setRedirect(domain, name, rule, value);
          this.updateData();
        },
        async deleteRedirect(index) {
          if (this.data.rewrites[index])
            if (confirm(GetLanguageString('confirm_delete_redirect',
              [['%name', this.data.redirects[index].name]])))
              await setting.deleteRedirect(domain, index);
          this.updateData();
        },
        async toggleRedirect(index) {
          await setting.toggleRedirect(domain, index);
          this.updateData();
        },
        async clearUrls() {
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