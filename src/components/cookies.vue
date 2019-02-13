<template>
    <div class="block">
        <div class="title flex-between-spaced">
            {{ui.cookies}}
            <div class="btn add" @click="saveCookie"></div>
        </div>
        <table>
            <tbody>
            <tr v-for="(values,key) in cookies.cookies"
                :class="{selected: key === cookies.selected}"
                @click="selectCookie(key)"
                :key="key">
                <td class="name">{{key}}</td>
                <td>
                    <div class="btn delete" @click.stop="deleteCookie(key)"></div>
                </td>
            </tr>
            </tbody>
        </table>
        <!--<div class="table">
            <div v-for="(v,key) in cookies.cookies" class="row" :class="{selected: key === cookies.selected}"
                 @click="selectCookie(key)">
                <div class="cell name">{{key}}</div>
                <div class="cell cookies-editor" v-if="showDetail">
                    <table>
                        <tbody>
                        <template v-for="item in v">
                            <tr>
                                <td>Name</td>
                                <td><input v-model="item.name"></td>
                            </tr>
                            <tr>
                                <td>Value</td>
                                <td><input v-model="item.value"></td>
                            </tr>
                        </template>
                        </tbody>
                    </table>
                </div>
                <div class="cell">
                    <div class="btn delete" @click.stop="deleteCookie(key)"></div>
                </div>
            </div>
        </div>-->
    </div>
</template>

<script>
  import {
    AlertNoCookies,
    ConfirmDelete,
    GetLanguageString,
    PromptSaveCookiesName,
    StringCookies
  } from "../js/i18_string_name";
  import {GetCookies, Prompt, SetCookies} from "../js/utils";

  export default {
    props: {
      domain: {required: true, type: String},
      cookies: {required: true},
      tabId: {required: false, type: Number, default: -1},
      showDetail: {required: false, type: Boolean, default: false},
    },
    data() {
      return {
        ui: {cookies: GetLanguageString(StringCookies)},
      }
    },
    methods: {
      async selectCookie(key) {
        if (this.cookies.selected === key || !this.cookies.cookies[key])
          return;
        this.cookies.selected = key;
        await SetCookies(this.cookies.cookies[key]);
        if (this.tabId !== -1)
          chrome.tabs.reload(this.tabId);
        this.$emit('changed');
      },
      async saveCookie() {
        const cookies = await GetCookies('https://' + this.domain);
        if (!cookies || cookies.length === 0)
          return alert(GetLanguageString(AlertNoCookies, [['%domain', this.domain]]));

        const name = Prompt(GetLanguageString(PromptSaveCookiesName));
        //取消保存
        if (!name)
          return;
        this.$set(this.cookies.cookies, name, cookies);
        this.$emit('changed');
      },
      async deleteCookie(key) {
        if (confirm(GetLanguageString(ConfirmDelete, [['%name', key]])) === false)
          return;
        delete this.cookies.cookies[key];
        if (this.cookies.selected === key)
          this.cookies.selected = null;
        this.$emit('changed');
      },
    },
    mounted() {
    }
  }
</script>

<style scoped>
    table td.name {
        width: 80%;
        background: #ccc;
    }

    table td {
        padding: 4px;
    }

    table {
        width: 100%;
    }

    table tr.selected {
        background: #eee;
    }
</style>