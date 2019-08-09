<template>
    <el-tabs type="border-card" v-model="activeName">
        <el-tab-pane :label="ui.tab_global_setting" name="global">
            <editor-global/>
        </el-tab-pane>
        <el-tab-pane :label="ui.tab_website_setting" name="website">
            <editor-domain v-if="activeName === 'website'"/>
        </el-tab-pane>
        <el-tab-pane :label="ui.about" name="about">
            <editor-about v-if="activeName === 'about'"/>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
  import {
    GetLanguageString,
    StringGlobalEditor,
    StringGlobalSetting,
    StringWebsiteSetting,
    PluginName,
  } from '../../js/i18_string_name'
  import Cookies from './cookies'
  import Requests from './requests'
  import Rewrites from './rewrites'
  import Ua from './ua'
  import EditorGlobal from './editor-global'
  import EditorDomain from './editor-domain'
  import EditorAbout from './editor-about'

  const { setting } = chrome.extension.getBackgroundPage()

  export default {
    components: {
      EditorAbout,
      EditorDomain,
      EditorGlobal,
      EditorWebsite: EditorDomain,
      Ua,
      Rewrites,
      Requests,
      Cookies,
    },
    data () {
      return {
        ui: {
          title: GetLanguageString(StringGlobalEditor),
          tab_global_setting: GetLanguageString(StringGlobalSetting),
          tab_website_setting: GetLanguageString(StringWebsiteSetting),
          about: GetLanguageString('string_about'),
        },
        activeName: 'global',
      }
    },
    methods: {},
    beforeMount () {
      document.title = this.ui.title
      if (window.location.hash) {
        this.activeName = 'website'
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
    .el-tabs {
        max-width: 1000px;
        margin: 0 auto;

        .el-container {

            .left {
                background-color: #D3DCE6;
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
    }

</style>