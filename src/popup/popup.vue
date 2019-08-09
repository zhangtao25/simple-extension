<template>
    <div class="el-form el-form--label-top">
        <template v-if="agree">
            <div class="title el-form-item">
                <h2 class="title el-form-item__label">
                    <el-button type="text" @click="goPanel">{{domain}} <i class="el-icon-setting"/></el-button>
                    <el-button v-if="isDev" type="text" @click="reload">刷新</el-button>
                </h2>
            </div>
            <div class="el-form-item">
                <div class="el-form-item__label">{{ui.list}}
                    <el-button type="text" icon="el-icon-delete" size="mini" @click="clearUrls"></el-button>
                </div>
                <div class="urls">
                    <el-table :show-header="false" :data="urls" stripe max-height="200" size="mini">
                        <el-table-column>
                            <template slot-scope="scope">
                                <el-input :value="scope.row.url" size="mini" @focus="clickSelect"/>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item__label">User-Agent</div>
                <div>
                    <ua :ua="data.ua" size="mini" @changed="changed"/>
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item__label">Cookies
                    <el-button type="text" icon="el-icon-plus" @click="addCookie"></el-button>
                </div>
                <div>
                    <cookies :cookies="data.cookies" :domain="domain" size="mini" @changed="changed"/>
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item__label">{{ui.requests}}
                    <el-button type="text" icon="el-icon-plus" @click="goPanel"></el-button>
                </div>
                <div>
                    <requests :list="data.requests" :domain="domain" size="mini"/>
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item__label">{{ui.rewrites}}
                    <el-button type="text" icon="el-icon-plus" @click="goPanel"></el-button>
                </div>
                <div>
                    <rewrites :list="data.rewrites" :domain="domain" size="mini"/>
                </div>
            </div>
        </template>
        <template v-else>
            <h3>{{ui.read_privacy_policy}}</h3>
            <el-button @click="openPrivacyPolicy">{{ui.open_privacy_policy}}</el-button>
        </template>
    </div>
</template>

<script>
  import Ua from '../editor/components/ua'
  import Cookies from '../editor/components/cookies'
  import {
    GetLanguageString,
    PromptSaveCookiesName,
    StringCookiesEmpty,
    StringHostRewrite,
    StringRequests,
    StringUrlList,
  } from '../js/i18_string_name'
  import Rewrites from '../editor/components/rewrites'
  import Requests from '../editor/components/requests'
  import { GetCookies, Prompt } from '../js/utils'

  const { tabs, setting } = window.bg = chrome.extension.getBackgroundPage()

  export default {
    components: { Requests, Rewrites, Cookies, Ua },
    props: ['domain', 'tab', 'data', 'urls'],
    data () {
      return {
        ui: {
          requests: GetLanguageString(StringRequests),
          rewrites: GetLanguageString(StringHostRewrite),
          list: GetLanguageString(StringUrlList),
          read_privacy_policy: GetLanguageString('string_read_privacy_policy'),
          open_privacy_policy: GetLanguageString('string_open_privacy_policy'),
        },
        agree: setting.config['read_privacy_policy'],
      }
    },
    computed: {
      isDev () {
        return process.env.NODE_ENV !== 'production'
      },
    },
    methods: {
      reload () {
        window.location.reload()
      },
      goPanel () {
        const url = chrome.extension.getURL('/editor.html'), hash = '#' + this.domain
        chrome.tabs.query({ url, currentWindow: true }, tabs => {
          if (tabs.length > 0) {
            for (let i = 0; i < tabs.length; i++) {
              const tab = tabs[i]
              if (tab.url.indexOf(hash) > 0) {
                chrome.tabs.update(tab.id, { active: true })
                return false
              }
            }
          }
          chrome.tabs.create({ url: url + hash })
        })
      },
      clearUrls () {
        this.urls.splice(0, this.urls.length)
        tabs.reset(this.tab.id)
        this.$forceUpdate()
      },
      clickSelect (e) {
        e.currentTarget.select()
      },
      changed () {
        setting.save()
      },
      async addCookie () {
        const name = Prompt(GetLanguageString(PromptSaveCookiesName))
        if (name.length > 0) {
          const cookies = await GetCookies('http://' + this.domain)
          if (cookies.length === 0)
            return alert(GetLanguageString(StringCookiesEmpty, [['%domain', this.domain]]))
          const data = setting.domains[this.domain].cookies
          data.cookies[name] = cookies
          data.selected = name
          setting.save()
        }
      },
      openPrivacyPolicy () {
        window.open('/privacy_policy.html?domain=' + this.domain)
      },
    },
  }
</script>

<style>
    body {
        min-width: 300px;
    }
</style>
<style scoped lang="scss">
    .title {
        padding: 0 !important;
        line-height: unset !important;
        margin: 0 !important;
    }
</style>