<template>
    <div>
        <div class="el-form-item__label" style="display: block;">
            {{ui.string_custom_ua_list}}
            <el-button size="mini" type="success" @click="addUA">{{ui.add}}</el-button>
        </div>
        <el-table :data="customUA" border size="mini" @row-click="rowClick">
            <el-table-column
                    prop="name"
                    label="名称"
                    width="300">
            </el-table-column>
            <el-table-column
                    prop="value"
                    label="值">
            </el-table-column>
            <el-table-column
                    prop="value"
                    width="150">
                <template slot-scope="scope">
                    <el-button size="mini" @click="editUA(scope.$index)" type="primary">{{ui.edit}}</el-button>
                    <el-button size="mini" type="danger" @click="deleteUA(scope.$index)">{{ui.delete}}</el-button>
                </template>
            </el-table-column>
        </el-table>
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
  } from '../../js/i18_string_name'
  import EditUaDialog from './edit-ua-dialog'

  const { setting } = chrome.extension.getBackgroundPage()

  const deleteUAConfirm = GetLanguageString(ConfirmDelete), deleteContent = GetLanguageString(ConfirmDeleteUAUsed)

  export default {
    components: { EditUaDialog, Ua, Rewrites, Requests, Cookies },
    data() {
      return {
        ui: {
          string_custom_ua_list: GetLanguageString('string_custom_ua_list'),
          add: GetLanguageString(StringAdd),
          edit: GetLanguageString(StringEdit),
          delete: GetLanguageString(StringDelete),
        },
        customUA: [],
      }
    },
    methods: {
      addUA() {
        this.$refs.dialog.show(-1, '', '')
      },
      findSameName(index, name) {
        for(let i = 0; i < this.customUA.length; i++) {
          const ua = this.customUA[i]
          if(index !== i && ua.name === name)
            return i
        }
        return -1
      },
      async submitUA({ index, name, value }) {
        index = this.findSameName(index, name)
        let overwrite = true
        if(index > -1) {
          overwrite = await new Promise(resolve => {
            this.$confirm(GetLanguageString('confirm_has_same_name_ua')).
              then(() => resolve(true)).
              catch(() => {resolve(false)})
          })
        }
        // console.log({ overwrite })
        if(overwrite === false)
          return
        if(index === -1) {
          this.customUA.push({ name, value })
          index = this.customUA.length - 1
        } else {
          const domains = this.findDomains(this.customUA[index].name),
            ua = 'custom_' + name
          this.customUA[index].name = name
          this.customUA[index].value = value
          domains.forEach(domain => {
            setting.setUA(domain, ua, value)
          })
        }
        this.$refs['dialog'].hide()
      },
      deleteUA(index) {
        let content = '', domains = this.findDomains(this.customUA[index].name)
        if(domains.length > 0)
          content = deleteContent.replace('%number', domains.length) + '<br>' +
            domains.map(domain => encodeURI(domain)).join('<br/>')

        this.$confirm(content, deleteUAConfirm.replace('%name', this.customUA[index].name),
          { dangerouslyUseHTMLString: true }).then(() => {
          this.customUA.splice(index, 1)
          // 将这些域名改为使用默认UA
          domains.forEach(domain => setting.setDefaultUA(domain))
        }).catch(() => {})
      },
      rowClick(row, column) {
        if(column.id === 'el-table_1_column_3')
          return
        const index = this.customUA.indexOf(row)
        if(index > -1)
          this.editUA(index)
      },
      editUA(index) {
        const select = this.customUA[index]
        this.$refs.dialog.show(index, select.name, select.value)
      },
      findDomains(ua) {
        ua = 'custom_' + ua
        const domains = []
        Object.keys(setting.domains).forEach(key => {
          const domain = setting.domains[key]
          console.log(domain.ua.selected, key)
          if(domain.ua.selected === ua) {
            domains.push(key)
          }
        })
        return domains
      },
    },
    watch: {
      customUA: {
        deep: true,
        handler: function() {
          const data = {}
          this.customUA.forEach(ua => {
            data[ua.name] = ua.value
          })
          // console.log('保存UA', data)
          // 偷懒
          setting.customUA = setting.data['customUA'] = data
          setting.save()
        },
      },
    },
    created() {
      const keys = Object.keys(setting.customUA)
      keys.forEach(name => {this.customUA.push({ name, value: setting.customUA[name] })})
    },
  }
</script>
<style>
    body {
        padding: 10px;
        background: #D3DCE6;
    }
</style>