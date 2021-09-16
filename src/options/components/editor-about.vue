<template>
    <div class="card">
        <div class="title">
            <img src="img/icon_48.png">
            <div>{{ui.title}} {{ui.version}}</div>
        </div>
        <ul>
            <li>
                <div class="title">{{ui.author}}</div>
                <div><a href="https://github.com/gzlock" target="_blank">gzlock</a></div>
            </li>
            <li class="title">
                <a href="https://github.com/gzlock/simple-extension" target="_blank">{{ui.open_source}}</a>
            </li>
            <li class="title">
                <a href="/privacy_policy.html" target="_blank">{{ui.privacy_policy}}</a>
            </li>
            <li class="title">
<!--                <a href="https://chrome.google.com/webstore/detail/ofhbnimjijmnaigdfhhmhegnlmcbilba"-->
<!--                   target="_blank">{{ui.store}}</a>-->
                <a href="https://microsoftedge.microsoft.com/addons/detail/kifnmdppleeacpldkcceoficmncfdmoa"
                   target="_blank">{{ui.edgeStore}}</a>
            </li>
            <li class="title">
                <a href="https://gzlock.github.io/simple-extension"
                   target="_blank">{{ui.tool}}</a>
            </li>
        </ul>
    </div>
</template>

<script>
  import {
    GetLanguageString,
    PluginName,
    StringAuthor,
    StringChromeStorePage,
    StringLibraries,
    StringLink,
    StringOpenSource,
    StringPrivacyPolicy,
    StringUrlTestTool,
  } from '../../js/i18_string_name'
  import { StringEdgeStorePage } from '../../js/i18_string_name'
  // 张涛改的
  export default {
    name: 'editor-about',
    data () {
      return {
        ui: {
          title: GetLanguageString(PluginName),
          version: chrome.runtime.getManifest().version,
          author: GetLanguageString(StringAuthor),
          libraries: GetLanguageString(StringLibraries),
          open_source: GetLanguageString(StringOpenSource),
          store: GetLanguageString(StringChromeStorePage),
          edgeStore: GetLanguageString(StringEdgeStorePage),
          tool: GetLanguageString(StringUrlTestTool),
          link: GetLanguageString(StringLink),
          privacy_policy: GetLanguageString(StringPrivacyPolicy),
        },
      }
    },
  }
</script>

<style scoped>
    a {
        text-decoration: none;
    }

    .card {
        font-weight: lighter;
        font-size: 20px;
        padding: 40px;
    }

    .card > .title {
        font-size: 36px;
        display: flex;
        align-items: center;
    }

    .title img {
        height: 36px;
        margin-right: 10px;
    }

    ul li + li {
        margin-top: 20px;
    }
</style>
