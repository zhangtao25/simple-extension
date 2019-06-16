<template>
    <el-select v-model="value" :size="size">
        <el-option :value="null" :label="ui.default"></el-option>
        <el-option-group
                v-for="(os, os_name) in ua_list"
                :key="os_name"
                :label="os_name">
            <el-option
                    v-for="(value,browser) in os"
                    :key="os_name+'_'+browser"
                    :label="browser"
                    :value="os_name+'_'+browser">
            </el-option>
        </el-option-group>
    </el-select>
</template>

<script>
  import {UA} from "../../js/ua_list";
  import {GetLanguageString, StringDefault} from "../../js/i18_string_name";

  export default {
    props: {
      ua: {required: true},
      size: {required: false, type: String, default: 'medium'}
    },
    data() {
      return {
        ui: {default: GetLanguageString(StringDefault)},
        ua_list: UA
      };
    },
    computed: {
      value: {
        get: function () {
          return this.ua.selected ? this.ua.selected : null;
        },
        set: function (selected) {
          let value = null;
          if ([null, 'default'].indexOf(selected) !== -1)
            selected = null;
          else {
            const [os, browser] = selected.split('_');
            if (UA[os] && UA[os][browser])
              value = UA[os][browser];
          }
          this.ua.selected = selected;
          this.ua.value = value;
          this.$emit('changed');
        },
      },
    },
  }
</script>

<style scoped>

</style>