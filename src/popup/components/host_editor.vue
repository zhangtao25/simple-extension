<template>
    <div class="block">
        <div class="title flex-between-spaced">
            {{ui.title}}
            <div class="btn add" @click="addItem"></div>
        </div>
        <div class="table">
            <transition-group name="list" tag="div">
                <div v-for="(value, index) in list" :key="type+'_'+index" class="row">
                    <div class="name cell">
                        <div class="text-wrap" v-text="value.name" @click="modifyItem(index, 'name')"></div>
                    </div>
                    <div class="cell">
                        <div class="text-ellipsis" v-text="value.rule" @click="modifyItem(index, 'rule')"></div>
                        <div>{{ui.to}}</div>
                        <div class="text-ellipsis" v-text="value.value" @click="modifyItem(index, 'value')"></div>
                    </div>
                    <div class="cell operator">
                        <div class="toggle" :class="{enable:value.enable}" @click="toggleItem(index)"></div>
                        <hr/>
                        <div class="btn delete" @click="deleteItem(index)"></div>
                    </div>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script>
  import {GetDomain, GetRegExp, Prompt} from "../../js/utils";
  import {ConfirmDeleteRewrite, GetLanguageString} from "../../js/i18_string_name";

  export default {
    props: {
      domain: {required: true, type: String},
      type: {
        required: true,
        type: String,
        validator: function (value) {
          // 这个值必须匹配下列字符串中的一个
          return ['rewrite', 'redirect'].indexOf(value) !== -1
        }
      },
      list: {required: true, type: Array},
    },
    data() {
      return {
        ui: {
          title: GetLanguageString('string_host_' + this.type),
          to: GetLanguageString(`string_host_${this.type}_to`),
        }
      };
    },
    methods: {
      async addItem() {
        const message = `prompt_host_${this.type}_`;
        const name = Prompt(GetLanguageString(message + 'name'));
        if (!name)
          return;
        const rule = GetRegExp(GetLanguageString(message + 'rule'));
        if (!rule)
          return;
        const value = Prompt(GetLanguageString(message + 'value'));
        if (!value)
          return;
        let index = -1;
        this.list.every((item, i) => {
          if (item.name === name) {
            index = i;
            return false;
          }
        });
        const ruleHasDomain = GetDomain(rule) ? 1 : 0, valueHasDomain = GetDomain(value) ? 1 : 0;
        if (index === -1)
          this.list.push({enable: 1, name, rule, value, ruleHasDomain, valueHasDomain});
        else
          Object.assign(this.list[index], {name, rule, value, ruleHasDomain, valueHasDomain});
        this.$emit('changed');
      },
      async toggleItem(index) {
        this.list[index].enable = this.list[index].enable ? 0 : 1;
        this.$emit('changed');
      },
      async modifyItem(index, attr) {
        if (['rewrite', 'redirect'].indexOf(this.type) === -1 || ['name', 'rule', 'value'].indexOf(attr) === -1)
          throw Error(`数据不符合预期${this.type},${attr}`);
        if (this.list[index]) {
          const data = this.list[index];
          const message = GetLanguageString(`prompt_host_${this.type}_${attr}`),
            value = data[attr];
          const input = attr === 'rule' ? GetRegExp(message, value) : Prompt(message, value);
          if (!input)
            return;
          data[attr] = input;
          if (attr === 'rule' || attr === 'value') {
            data[attr + 'HasDomain'] = GetDomain(input) ? 1 : 0;
          }
          this.$emit('changed');
        }
      },
      async deleteItem(index) {
        if (confirm(GetLanguageString(`confirm_delete_${this.type}`, [['%name', this.list[index].name]]))) {
          this.list.splice(index, 1);
          this.$emit('changed');
        }
      },
    }
  }
</script>

<style scoped>

</style>