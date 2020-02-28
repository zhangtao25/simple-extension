<template>
    <el-table :data="list"
              :show-header="false"
              :size="size"
              :empty-text="ui.noData">
        <el-table-column v-if="editable"
                         type="index"
                         width="50">
        </el-table-column>
        <!--<el-table-column v-if="editable">
            <template slot-scope="scope">
                <el-input v-model="list[scope.$index]" @change="$emit('changed')"
                          @keypress.enter.native="checkEmpty"
                          @blur="checkEmpty" :size="size"></el-input>
            </template>
        </el-table-column>
        <el-table-column v-else>
            <template slot-scope="scope">
                {{scope.row}}
            </template>
        </el-table-column>-->
        <el-table-column>
            <template slot-scope="scope">
                {{scope.row}}
            </template>
        </el-table-column>
        <el-table-column v-if="editable" width="60px">
            <template slot-scope="scope">
                <el-button icon="el-icon-delete" type="text" circle
                           @click="deleteRequest(scope.$index, scope.row)"></el-button>
            </template>
            </el-table-column>
        </el-table>
</template>

<script>
  import { ConfirmDelete, GetLanguageString, PromptHowToGetTheRequestUrl, StringNoData } from '../../js/i18_string_name'

  export default {
    props: {
      list: { required: true, type: Array },
      editable: { required: false, type: Boolean, default: false },
      size: { required: false, type: String, default: 'medium' },
    },
    data () {
      return {
        ui: {
          delete: GetLanguageString(ConfirmDelete),
          add: GetLanguageString(PromptHowToGetTheRequestUrl),
          noData: GetLanguageString(StringNoData),
        },
        addNew: { add: true, value: '', index: '+' },
      }
    },
    methods: {
      addRequest: async function () {
        let { value } = await this.$prompt(this.ui.add, {
          inputValidator: val => {
            return !!val && val.trim().length > 0
          },
        })
        let find = this.list.indexOf(value)
        if (find !== -1) {
          return
        }
        this.list.splice(0, 0, value)
        this.$emit('changed')
      },
      async deleteRequest (index, value) {
        if (this.list.length > index) {
          await this.$confirm(this.ui.delete.replace('%name', value))
          this.list.splice(index, 1)
          this.$emit('changed')
        }
      },
      checkEmpty () {
        let a = 0
        for (let i = 0; i < this.list.length; i++) {
          const value = this.list[i], indexOf = this.list.lastIndexOf(value)
          if (value.length === 0 || (indexOf !== -1 && indexOf !== i)) {
            a++
            this.list.splice(i, 1)
          }
        }
        if (a > 0)
          this.$emit('changed')
      },
    },
  }
</script>

<style scoped>

</style>
