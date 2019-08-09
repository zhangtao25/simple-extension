<template>
    <el-container>
        <el-aside class="left">
            <template v-for="d in domains">
                <div :class="{selected:d===selectedDomain}"
                     @click="selectDomain(d)" :data-content="d">{{d}}
                </div>
            </template>
        </el-aside>
        <el-main class="right">
            <el-form v-if="selectedDomain">
                <el-form-item :label="ui.ua">
                    <ua :ua="data.ua" @changed="changed"/>
                </el-form-item>
                <el-form-item>
                    <div>Cookies
                        <el-button type="text" icon="el-icon-plus" @click="addCookie"></el-button>
                    </div>
                    <cookies :domain="selectedDomain" :cookies="data.cookies" :editable="true" ref="cookies"
                             @changed="changed"/>
                </el-form-item>
                <el-form-item>
                    <div>{{ui.requests}}
                        <el-button type="text" icon="el-icon-plus" @click="addRequest"></el-button>
                    </div>
                    <requests :list="data.requests" :editable="true" @changed="changed" ref="requests"/>
                </el-form-item>
                <el-form-item>
                    <div>{{ui.rewrite}}
                        <el-button type="text" icon="el-icon-plus" @click="addRewrite"></el-button>
                        <a class="el-button el-button--text"
                           href="https://gzlock.github.io/simple-extension" target="_blank">{{ui.tool}}</a>
                    </div>
                    <rewrites :domain="selectedDomain" :list="data.rewrites" :editable="true" @changed="changed"
                              ref="rewrites"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="danger" size="small" @click="deleteDomain">{{deleteDomainButton}}</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
  import {
    ConfirmDelete,
    GetLanguageString,
    StringGlobalEditor,
    StringHostRewrite,
    StringRequests,
    StringRewriteTo,
    StringUA,
    StringUrlTestTool,
  } from '../../js/i18_string_name'
  import Cookies from './cookies'
  import { UA } from '../../js/ua_list'
  import Requests from './requests'
  import Rewrites from './rewrites'
  import Ua from './ua'

  const { setting } = chrome.extension.getBackgroundPage()

  export default {
    name: 'editor-domain',
    components: { Ua, Rewrites, Requests, Cookies },
    props: ['customUA'],
    data () {
      return {
        ui: {
          ua: GetLanguageString(StringUA),
          requests: GetLanguageString(StringRequests),
          rewrite: GetLanguageString(StringHostRewrite),
          rewriteTo: GetLanguageString(StringRewriteTo),
          deleteWrite: GetLanguageString(ConfirmDelete),
          tool: GetLanguageString(StringUrlTestTool),
        },
        ua_list: UA,
        domains: [],
        selectedDomain: '',
        data: null,
      }
    },
    computed: {
      deleteDomainButton () {
        return GetLanguageString('string_delete_domains', [['%domain', this.selectedDomain]])
      },
    },
    methods: {
      selectDomain (domain) {
        this.selectedDomain = domain
        window.history.replaceState(null, null, '#' + this.selectedDomain)
        if (!setting.hasDomain(domain))
          setting.initDomain(domain)
        this.data = setting.domains[domain]
        // console.log('selectDomain', domain, this.data)
      },
      changed () {
        setting.save()
      },
      addCookie () {
        this.$refs.cookies.addCookie()
      },
      addRewrite () {
        this.$refs.rewrites.addRewrite()
      },
      addRequest () {
        this.$refs.requests.addRequest()
      },
      deleteDomain () {
        console.log('delete', this.selectedDomain)
        this.$confirm(GetLanguageString('confirm_delete_domain', [['%domain', this.selectedDomain]])).then(() => {
          delete setting.domains[this.selectedDomain]
          setting.save()
          this.domains.splice(this.domains.indexOf(this.selectedDomain), 1)
          this.selectedDomain = ''
        }).catch(() => {})
      },
    },
    mounted () {
      this.domains = Object.keys(setting.domains)
      if (window.location.hash) {
        const selected = window.location.hash.substr(1)
        this.selectDomain(selected)
        if (this.domains.includes(selected) === false)
          this.domains.push(selected)
      }
    },
  }
</script>
<style>
    body {
        padding: 10px;
        background: #D3DCE6;
    }
</style>
<style lang="scss" scoped>
    .el-container {

        .left {
            /*background-color: #D3DCE6;*/
            color: #333;
            width: 150px !important;
            font-size: 16px;
            overflow: unset !important;

            > div {
                $padding: 5px;
                padding: $padding;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: left;
                white-space: nowrap;

                &:hover {
                    background: lightblue;
                    overflow: unset;
                    text-overflow: unset;
                    color: transparent;

                    &:after {
                        content: attr(data-content);
                        position: absolute;
                        top: 0;
                        left: 0;
                        padding: $padding;
                        color: black;
                        background: lightblue;
                        z-index: 999;
                        border-radius: 0 5px 5px 0;
                    }
                }

                &.selected {
                    background: aliceblue;

                    &:hover {
                        &:after {
                            background: aliceblue;
                        }
                    }
                }

                + div {
                    margin-top: 5px;
                }
            }
        }

        .right {
            background-color: aliceblue;
            color: #333;
        }
    }

</style>