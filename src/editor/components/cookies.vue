<template>
    <div>
        <template v-if="editable">
            <template v-for="(cookie,name) in cookies.cookies">
                <el-tag closable
                        :type="name === cookies.selected ? '': 'info'"
                        @close="deleteCookie(name)"
                        @click="selectCookie(name)">
                    {{name}}
                </el-tag>
            </template>
        </template>
        <template v-else>
            <el-select v-model="cookies.selected" :size="size">
                <el-option :value="null" :label="ui.default"></el-option>
                <template v-for="(cookie,name) in cookies.cookies">
                    <el-option :value="cookie.name" :label="name"></el-option>
                </template>
            </el-select>
        </template>
    </div>
</template>

<script>
  import {ClearCookies, GetCookies, SetCookies} from "../../js/utils";
  import {
    ConfirmDelete,
    GetLanguageString,
    PromptSaveCookiesName,
    StringCookiesEmpty, StringDefault
  } from "../../js/i18_string_name";

  export default {
    props: {
      domain: {required: true},
      cookies: {required: true},
      editable: {default: false},
      size: {required: false, type: String, default: 'medium'},
    },
    data() {
      return {
        ui: {
          addCookie: GetLanguageString(PromptSaveCookiesName),
          delete: GetLanguageString(ConfirmDelete),
          noCookies: GetLanguageString(StringCookiesEmpty),
          default: GetLanguageString(StringDefault),
        },
      };
    },
    methods: {
      async addCookie() {
        const cookies = await GetCookies('https://' + this.domain);
        if (!cookies || cookies.length === 0) {
          this.$alert(this.ui.noCookies.replace('%domain', this.domain));
          return;
        }
        const {value} = await this.$prompt(this.ui.addCookie);
        if (!value)
          return;
        this.$set(this.cookies.cookies, value, cookies);
        this.$emit('changed');
      },
      async selectCookie(name) {
        if (!this.cookies.cookies.hasOwnProperty(name))
          return;
        this.cookies.selected = this.cookies.selected === name ? null : name;
        if (this.cookies.selected === name)
          await SetCookies(this.cookies.cookies[name]);
        else
          await ClearCookies('https://' + this.domain);
        this.$emit('changed');
      },
      async deleteCookie(name) {
        if (this.editable) {
          await this.$confirm(this.ui.delete.replace('%name', name));
          if (this.cookies.cookies[name])
            delete this.cookies.cookies[name];
          if (this.cookies.selected === name) {
            this.cookies.selected = null;
            await ClearCookies('https://' + this.domain);
          }
          this.$emit('changed');
          this.$forceUpdate();
        }
      },
    },
  }
</script>

<style scoped>
    .el-tag {
        cursor: pointer;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
    }
</style>