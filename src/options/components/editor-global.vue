<template>
    <div>
        <el-form>
            <el-form-item>
                <div>
                    {{ui.string_custom_ua_list}}
                    <el-button size="mini" type="success" @click="addUA">{{ui.add}}</el-button>
                </div>
                <el-table :data="customUA" border size="mini" @row-click="rowClick" :empty-text="ui.noData">
                    <el-table-column
                            prop="name"
                            :label="ui.name"
                            width="300">
                    </el-table-column>
                    <el-table-column
                            prop="value"
                            :label="ui.value">
                    </el-table-column>
                    <el-table-column width="160">
                        <template slot-scope="scope">
                            <el-button size="mini" @click="editUA(scope.$index)" type="primary">{{ui.edit}}</el-button>
                            <el-button size="mini" type="danger" @click="deleteUA(scope.$index)">{{ui.delete}}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form-item>
            <el-form-item>
                <el-button type="danger" size="small" @click="clearExtensionData">{{ui.clearData}}</el-button>
            </el-form-item>
        </el-form>
        <edit-ua-dialog ref="dialog" @submit="submitUA"/>
    </div>
</template>

<script>
  import Cookies from './cookies'
  import Requests from './requests'
  import Rewrites from './rewrites'
  import Ua from './ua'
  import {
    ConfirmDelete,
    ConfirmDeleteUAUsed,
    GetLanguageString,
    StringAdd,
    StringDelete,
    StringEdit,
    StringNoData,
  } from '../../js/i18_string_name'
  import EditUaDialog from './edit-ua-dialog'

  const { setting } = chrome.extension.getBackgroundPage()

  const deleteUAConfirm = GetLanguageString(ConfirmDelete), deleteContent = GetLanguageString(ConfirmDeleteUAUsed)

  export default {
    components: { EditUaDialog, Ua, Rewrites, Requests, Cookies },
    data () {
      return {
        ui: {
          string_custom_ua_list: GetLanguageString('string_custom_ua_list'),
          add: GetLanguageString(StringAdd),
          edit: GetLanguageString(StringEdit),
          delete: GetLanguageString(StringDelete),
          clearData: GetLanguageString('string_clear_extension_data'),
          noData: GetLanguageString(StringNoData),
          name: GetLanguageString('string_name'),
          value: GetLanguageString('string_value'),
        },
        customUA: [],
      }
    },
    methods: {
      addUA () {
        this.$refs.dialog.show(-1, '', '')
      },
      async submitUA ({ index, name, value }) {
        let oldName, lastIndex = -1

        for (let i = 0; i < this.customUA.length; i++) {
          if (i !== index && this.customUA[i].name === name) {
            lastIndex = i
            break
          }
        }
        console.log({ index, lastIndex })
        //添加
        if (index === -1 && lastIndex === -1) {
          console.log('添加 ua')
          this.customUA.push({ name, value })
        }
        //编辑
        else {
          console.log('编辑 ua')
          if (lastIndex > -1) {
            const overwrite = await new Promise(resolve => {
              this.$confirm(GetLanguageString('confirm_has_same_name_ua'))
                .then(() => resolve(true))
                .catch(() => {resolve(false)})
            })
            if (overwrite === false)
              return
            if (index === -1) {
              oldName = this.customUA[lastIndex].name
              index = lastIndex
            } else
              oldName = this.customUA[index].name
          }
          this.customUA[index].name = name
          this.customUA[index].value = value
          if (lastIndex > -1 && index !== lastIndex)
            this.customUA.splice(lastIndex, 1)
        }
        if (oldName) {
          const domains = this.findDomains(name), ua = 'custom_' + name
          if (name !== oldName)
            domains.push(...this.findDomains(oldName))
          console.log('需要改变', domains)
          domains.forEach(domain => {
            setting.setUA(domain, ua, value)
          })
        }
        this.$refs['dialog'].hide()
      },
      deleteUA (index) {
        let content = '', domains = this.findDomains(this.customUA[index].name)
        if (domains.length > 0)
          content = deleteContent.replace('%number', domains.length) + '<br>' +
            domains.map(domain => encodeURI(domain)).join('<br/>')

        this.$confirm(content, deleteUAConfirm.replace('%name', this.customUA[index].name),
          { dangerouslyUseHTMLString: true }).then(() => {
          this.customUA.splice(index, 1)
          // 将这些域名改为使用默认UA
          domains.forEach(domain => setting.setDefaultUA(domain))
        }).catch(() => {})
      },
      rowClick (row, column) {
        if (column.id === 'el-table_1_column_3')
          return
        const index = this.customUA.indexOf(row)
        if (index > -1)
          this.editUA(index)
      },
      editUA (index) {
        const select = this.customUA[index]
        this.$refs.dialog.show(index, select.name, select.value)
      },
      findDomains (ua) {
        ua = 'custom_' + ua
        return Object.keys(setting.domains).filter(key => {
          const domain = setting.domains[key]
          return domain.ua.selected === ua
        })
      },
      clearExtensionData () {
        this.$confirm(GetLanguageString('confirm_clear_extension_data')).then(() => {
          setting.clear()
        }).catch(() => {})
      },
      reload () {
        this.customUA.length = 0
        const keys = Object.keys(setting.customUA)
        keys.forEach(name => {this.customUA.push({ name, value: setting.customUA[name] })})
      },
    },
    watch: {
      customUA: {
        deep: true,
        handler: function () {
          const data = {}
          this.customUA.forEach(ua => {
            data[ua.name] = ua.value
          })
          console.log('保存自定义UA')
          // 偷懒
          setting.customUA = setting.data['customUA'] = data
          setting.save()
        },
      },
    },
    mounted () {
      chrome.storage.onChanged.addListener(this.reload)
    },
    beforeDestroy () {
      console.log('全局UA编辑器 beforeDestroy')
      chrome.storage.onChanged.removeListener(this.reload)
    }
  }
</script>
<style>
    body {
        padding: 10px;
        background: #D3DCE6;
    }
</style>
