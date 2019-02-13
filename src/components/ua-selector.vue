<template>
    <select v-model="_value">
        <option value="default">{{ui.ua_default}}</option>
        <optgroup v-for="(os, os_name) in ua_list" :label="os_name" :key="os_name">
            <option v-for="(browser, browser_name) in os" :value="os_name + '_' + browser_name"
                    :key="browser_name">{{browser_name}}
            </option>
        </optgroup>
    </select>
</template>

<script>
  import {UA} from "../js/ua_list";
  import {GetLanguageString, MenuUseragentDefaultText} from "../js/i18_string_name";

  export default {
    name: "ua-selector",
    props: ['value'],
    data() {
      return {
        ui: {ua_default: GetLanguageString(MenuUseragentDefaultText)},
        ua_list: UA
      };
    },
    computed: {
      _value: {
        get: function () {
          return this.value && this.value.selected ? this.value.selected : 'default';
        },
        set: function (selected) {
          let value = null;
          if (selected === 'default')
            selected = null;
          else {
            const [os, browser] = selected.split('_');
            if (UA[os] && UA[os][browser])
              value = UA[os][browser];
          }
          this.$emit('input', {selected, value});
          this.$emit('changed');
        },
      },
    },

  }
</script>

<style scoped>

</style>