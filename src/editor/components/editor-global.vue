<template>
    <div>
        <div class="el-form-item__label" style="display: block;">自定义UA</div>
        <el-table :data="list" border size="mini">
            <el-table-column
                    prop="name"
                    label="名称"
                    width="300">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.name" size="mini" placeholder="添加"></el-input>
                </template>
            </el-table-column>
            <el-table-column
                    prop="value"
                    label="值">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.value" size="mini"/>
                </template>
            </el-table-column>
            <el-table-column
                    prop="value"
                    label="操作"
                    width="100">
                <template slot-scope="scope">
                    <el-button size="mini" v-if="scope.$index === 0" type="primary" @click="addUA">添加</el-button>
                    <el-button size="mini" v-else type="danger" @click="deleteUA(scope.$index-1)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
  import Cookies from './cookies'
  import Requests from './requests'
  import Rewrites from './rewrites'
  import Ua from './ua'
  import { ConfirmDelete, ConfirmDeleteUAUsed, GetLanguageString } from '../../js/i18_string_name'

  const { setting } = chrome.extension.getBackgroundPage()

  const deleteUAConfirm = GetLanguageString(ConfirmDelete), deleteContent = GetLanguageString(ConfirmDeleteUAUsed)

  export default {
    components: { Ua, Rewrites, Requests, Cookies },
    data() {
      return {
        customUA: [],
        form: { name: '', value: '' },
      }
    },
    computed: {
      list() {
        const list = []
        list.push(this.form)
        list.push(...this.customUA)
        return list
      },
    },
    methods: {
      addUA() {
        this.customUA.splice(0, 0, { ...this.form })
        this.form.name = ''
        this.form.value = ''
      },
      deleteUA(index) {
        const ua = 'custom_' + this.customUA[index].name
        let used = 0, content = '', domains = []
        Object.keys(setting.domains).forEach(key => {
          const domain = setting.domains[key]
          console.log(domain.ua.selected, key)
          if(domain.ua.selected === ua) {
            used++
            domains.push(key)
          }
        })
        if(used > 0)
          content = deleteContent.replace('%number', used) + '<br>' +
            domains.map(domain => encodeURI(domain)).join('<br/>')

        this.$confirm(content, deleteUAConfirm.replace('%name', this.customUA[index].name),
          { dangerouslyUseHTMLString: true }).then(() => {
          this.customUA.splice(index, 1)
          // 将这些域名改为使用默认UA
          domains.forEach(domain => setting.setDefaultUA(domain))
        }).catch(() => {})
      },
    },
    watch: {
      customUA: {
        deep: true,
        handler: function() {
          this.customUA.forEach(ua => {
            setting.customUA[ua.name] = ua.value
          })
          console.log('保存自定义ua', setting.customUA)
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