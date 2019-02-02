<template>
    <div class="container">
        <div>
            <div class="block">
                <div class="title">{{domain}}
                    <button @click="reload">刷新</button>
                </div>
            </div>
            <!--监测到的网址-->
            <div class="block" v-if="urls.length > 0">
                <div class="title flex-between-spaced">
                    {{ui.url_list}}
                    <div class="btn delete" @click.stop="clearUrls"></div>
                </div>
                <div class="url-list">
                    <div v-for="(item,index) in requestsList" :key="index" class="list-item">
                        <input :value="item.url" @focus="e=>e.currentTarget.select()"/>
                        <!--{{item.url}}-->
                    </div>
                </div>
            </div>
            <!--Cookies切换-->
            <div class="block">
                <div class="title flex-between-spaced">
                    {{ui.cookies}}
                    <div class="btn add" @click="saveCookie"></div>
                </div>
                <div class="content cookies">
                    <div v-for="(v,k) in data.cookies.cookies" :class="{selected:k===data.cookies.selected}"
                         @click="selectCookie(k)" class="flex-between-spaced"><span>{{k}}</span>
                        <div class="btn delete" @click.stop="deleteCookie(k)"></div>
                    </div>
                </div>
            </div>
            <!--UA切换-->
            <div class="block">
                <div class="title">User-Agent</div>
                <div class="content">
                    <select v-model="selectedUA">
                        <option value="default">{{ui.ua_default}}</option>
                        <optgroup v-for="(os, os_name) in ua_list" :label="os_name" :key="os_name">
                            <option v-for="(browser, browser_name) in os" :value="os_name + '_' + browser_name"
                                    :key="browser_name">{{browser_name}}
                            </option>
                        </optgroup>
                    </select>
                </div>
            </div>
            <!--网络监测-->
            <div class="block">
                <div class="title flex-between-spaced">
                    {{ui.requests}}
                    <div class="btn add" @click="addRequest"></div>
                </div>
                <transition-group name="list" tag="div" class="content">
                    <div v-for="(value, index) in data.requests"
                         :key="'requests'+index"
                         class="flex-between-spaced">
                        <input v-model.trim="data.requests[index]" @input="save"/>
                        <div class="btn delete" @click="deleteRequest(value)"></div>
                    </div>
                </transition-group>
            </div>
            <!--URL重写-->
            <host-editor type="rewrite"
                         :domain="domain"
                         :list="data.rewrites"
                         @changed="changed"/>
            <!--Host 重定向-->
            <host-editor type="redirect"
                         :domain="domain"
                         :list="data.redirects"
                         @changed="changed"/>
            <!--<div class="block">
                <div class="title flex-between-spaced">
                    {{ui.redirect}}
                    <div class="btn add" @click="addRedirect"></div>
                </div>
                <div class="flex-between-around">
                    <span>名称</span>
                    <span>将</span>
                    <span>重定向到</span>
                </div>
                <transition-group name="list" tag="div" class="content">
                    <div v-for="(value, index) in data.redirects"
                         :key="'redirect'+index"
                         class="flex-between-spaced">
                        <div class="flex-between-spaced">
                            <div class="name"
                                 v-text="value.name"
                                 @click="modifyRewriteOrRedirect(index, 'redirects', 'name')"></div>
                            <div v-text="value.rule"
                                 @click="modifyRewriteOrRedirect(index, 'redirects', 'rule')"></div>
                            <div v-text="value.value"
                                 @click="modifyRewriteOrRedirect(index, 'redirects', 'value')"></div>
                        </div>
                        <div class="btn delete" @click="deleteRedirect(index)"></div>
                    </div>
                </transition-group>
            </div>-->
        </div>
    </div>
</template>

<script>
  import {
    AlertNoCookies,
    ConfirmDeleteCookie,
    ConfirmDeleteRequest,
    GetLanguageString,
    MenuUseragentDefaultText,
    PromptHowToGetTheRequestUrl, PromptRedirectName, PromptRedirectRule, PromptRedirectValue,
    PromptRewriteName,
    PromptRewriteRule,
    PromptRewriteValue,
    PromptSaveCookiesName,
    StringCookies,
    StringHostRedirect,
    StringHostRewrite,
    StringRequests,
    StringSave,
    StringUA,
    StringUrlList
  } from "../js/i18_string_name";
  import {DefaultDomainData} from "../js/setting";
  import {GetCookies, GetRegExp, Prompt, SetCookies} from "../js/utils";
  import {UA} from "../js/ua_list";
  import HostEditor from "./host_editor.vue";

  const {tabs, setting} = window.bg = chrome.extension.getBackgroundPage();

  let saveTimeout;
  export default {
    components: {HostEditor},
    props: ['domain', 'tab'],
    data() {
      return {
        ui: {
          cookies: GetLanguageString(StringCookies),
          requests: GetLanguageString(StringRequests),
          ua: GetLanguageString(StringUA),
          ua_default: GetLanguageString(MenuUseragentDefaultText),
          save_cookies: GetLanguageString(StringSave),
          url_list: GetLanguageString(StringUrlList),
        },
        setting,
        ua_list: UA,
        data: null,
        urls: tabs.data[this.tab.id].urls,
      }
    },
    computed: {
      selectedUA: {
        get: function () {
          return this.data.ua.selected ? this.data.ua.selected : 'default';
        },
        set: function (value) {
          this.data.ua.selected = value;
          this.selectUA(value);
        }
      },
      requestsList() {
        return this.urls.reverse();
      },
    },
    methods: {
      async selectUA(value) {
        if (value === 'default') {
          await setting.setDefaultUA(this.domain);
        } else {
          const [os, browser] = value.split('_');
          await setting.setUA(this.domain, os + '_' + browser, this.ua_list[os][browser]);
        }
        chrome.tabs.reload(this.tab.id);
      },
      async selectCookie(key) {
        console.log('selectCookie', key, JSON.stringify(this.data.cookies));
        if (this.data.cookies.selected === key || !this.data.cookies.cookies[key])
          return;
        this.data.cookies.selected = key;
        await SetCookies(this.data.cookies.cookies[key]);
        await setting.selectCookie(this.domain, key);
        chrome.tabs.reload(this.tab.id);
      },
      async saveCookie() {
        const cookies = await GetCookies(this.tab.url);
        if (!cookies || cookies.length === 0)
          return alert(GetLanguageString(AlertNoCookies, [['%domain', this.domain]]));

        const name = Prompt(GetLanguageString(PromptSaveCookiesName));
        //取消保存
        if (!name)
          return;

        await setting.setCookie(this.domain, name, cookies);
        this.updateData();
      },
      async deleteCookie(key) {
        if (confirm(GetLanguageString(ConfirmDeleteCookie, [['%name', key]])) === false)
          return;
        delete this.data.cookies.cookies[key];
        delete setting.data[this.domain].cookies.cookies[key];
        delete this.data.cookies.cookies[key];
        if (setting.data[this.domain].cookies.selected === key) {
          setting.data[this.domain].cookies.selected = null;
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

        await setting.setRequest(this.domain, keyword);
        this.updateData();
      },
      async deleteRequest(value) {
        if (confirm(GetLanguageString(ConfirmDeleteRequest)) === false)
          return;

        await setting.deleteRequest(this.domain, value);
        this.updateData();
      },
      async clearUrls() {
        this.urls.length = 0;
        tabs.reset(this.tab.id);
        this.$forceUpdate();
      },
      updateData() {
        this.data = setting.data[this.domain];
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
      },
      reload() {
        window.location.reload();
      },
      changed() {
        console.log('%c popup.vue changed', 'color:red');
        setting.save();
      }
    },
    updated() {
      setting.save();
    },
    created() {
      if (!setting.hasDomain(this.domain))
        setting.initDomain(this.domain);
      this.data = setting.data[this.domain];
    },
    mounted() {
    }
  }
</script>

<style src="../css/popup.css" lang="css"></style>