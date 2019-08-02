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
            <li>
                <div class="title">{{ui.open_source}}</div>
                <div><a href="https://github.com/gzlock/simple-extension" target="_blank">Github</a></div>
            </li>
            <li>
                <div class="title">{{ui.privacy_policy}}</div>
                <div><a href="https://github.com/gzlock/simple-extension/blob/master/PrivacyPolicy.md" target="_blank">Github</a>
                </div>
            </li>
            <li>
                <div class="title">{{ui.store}}</div>
                <div><a href="https://chrome.google.com/webstore/detail/ofhbnimjijmnaigdfhhmhegnlmcbilba"
                        target="_blank">{{ui.link}}</a></div>
            </li>
            <li>
                <div class="title">{{ui.tool}}</div>
                <div><a href="https://gzlock.github.io/simple-extension"
                        target="_blank">{{ui.link}}</a></div>
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
  } from '../js/i18_string_name'

  export default {
    name: 'options',
    data() {
      return {
        ui: {
          title: GetLanguageString(PluginName),
          version: chrome.runtime.getManifest().version,
          author: GetLanguageString(StringAuthor),
          libraries: GetLanguageString(StringLibraries),
          open_source: GetLanguageString(StringOpenSource),
          store: GetLanguageString(StringChromeStorePage),
          tool: GetLanguageString(StringUrlTestTool),
          link: GetLanguageString(StringLink),
          privacy_policy: GetLanguageString(StringPrivacyPolicy),
        },
      }
    },
    mounted() {
      document.title = this.ui.title
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