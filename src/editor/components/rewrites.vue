<template>
    <el-table :data="list" :show-header="false" :size="size">
        <el-table-column v-if="editable"
                         type="index"
                         width="50">
        </el-table-column>

        <el-table-column width="150px" v-if="editable">
            <template slot-scope="scope">
                {{scope.row.name}}
                <el-button type="text" icon="el-icon-edit" @click="modifyName(scope.$index,scope.row.name)"
                           v-if="editable"></el-button>
            </template>
        </el-table-column>
        <el-table-column v-else>
            <template slot-scope="scope">
                <el-popover
                        placement="top-start"
                        width="auto"
                        trigger="hover">
                    <div>
                        <div>{{scope.row.rule}}</div>
                        <div>{{ui.rewriteTo}}</div>
                        <div>{{scope.row.value}}</div>
                    </div>
                    <el-button slot="reference" type="text" size="mini">{{scope.row.name}}</el-button>
                </el-popover>
            </template>
        </el-table-column>

        <el-table-column v-if="editable">
            <template slot-scope="scope">
                <el-input v-model="scope.row.rule" @change="scope.row.enable = 0"></el-input>
                <div>{{ui.rewriteTo}}</div>
                <el-input v-model="scope.row.value" @change="scope.row.enable = 0"></el-input>
            </template>
        </el-table-column>
        <el-table-column width="80px">
            <template slot-scope="scope">
                <el-switch
                        :value="!!scope.row.enable"
                        active-color="#13ce66"
                        inactive-color="#ff4949" @change="toggle(scope.$index)">
                </el-switch>
            </template>
        </el-table-column>
        <el-table-column width="60px" v-if="editable">
            <template slot-scope="scope">
                <el-button icon="el-icon-delete" type="text" circle
                           @click="deleteRewrite(scope.$index, scope.row.name)"></el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
  import {ConfirmDelete, GetLanguageString, PromptRewriteName, StringRewriteTo} from "../../js/i18_string_name";

  export default {
    props: {
      domain: {required: true, type: String},
      list: {required: true, type: Array},
      editable: {required: false, type: Boolean, default: false},
      size: {required: false, type: String, default: 'medium'},
    },
    data() {
      return {
        ui: {
          rewriteTo: GetLanguageString(StringRewriteTo),
          rewriteName: GetLanguageString(PromptRewriteName),
          delete: GetLanguageString(ConfirmDelete),
        },
      };
    },
    methods: {
      async addRewrite() {
        const name = await this.getName();
        if (name) {
          const find = this.find(name),
            data = {name, rule: '', value: '', enable: 0};
          if (find === -1)
            this.list.push(data);
          else
            this.list[find] = data;

          this.$emit('changed');
        }
      },
      async deleteRewrite(index, name) {
        if (this.list.length > index) {
          await this.$confirm(this.ui.delete.replace('%name', name));
          this.list.splice(index, 1);
          this.$emit('changed');
        }
      },
      async toggle(index) {
        const item = this.list[index];
        if (!item)
          return;
        if (item.enable === 0 && (item.rule.length === 0 || item.value.length === 0))
          return this.$message.error('错误');
        item.enable = item.enable === 1 ? 0 : 1;
        // this.$set(this.list[index], 'enable', item.enable);
        console.log('toggle', item.enable);
        this.$emit('changed');
      },
      async modifyName(index, name) {
        if (this.list.length > index) {
          const newName = await this.getName(name);
          if (newName && newName !== name) {
            const findIndex = this.find(newName);
            this.list[index].name = newName;
            if (findIndex !== -1) {
              this.list[findIndex] = this.list[index];
              this.list.splice(index, 1);
              this.$emit('changed');
              this.$forceUpdate();
            }
          }
        }
      },
      find(name) {
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].name === name)
            return i;
        }
        return -1;
      },
      async getName(name) {
        let {value} = await this.$prompt(this.ui.rewriteName, {
          inputValue: name,
          inputValidator: val => {
            return !!val && val.trim().length > 0;
          }
        });
        return value;
      },
    },
  }
</script>

<style scoped>

</style>