<template>
    <div>
        <div class="el-form-item">
            <codemirror v-model="code"
                        :options="options">
            </codemirror>
        </div>
        <div class="el-form-item">
            <!-- <el-button @click="get" size="small">{{ui.export}}</el-button>-->
            <el-button @click="save" size="small" type="primary">{{ui.save}}</el-button>
        </div>
        <div class="el-form-item">
            <div class="el-form-item__label" style="text-align: left" v-html="ui.hint"></div>
        </div>
    </div>
</template>

<script>
  import { codemirror } from 'vue-codemirror'
  // active-line.js
  import 'codemirror/addon/selection/active-line.js'
  // foldGutter
  import 'codemirror/addon/fold/foldgutter.css'
  import 'codemirror/addon/fold/brace-fold.js'
  import 'codemirror/addon/fold/comment-fold.js'
  import 'codemirror/addon/fold/foldcode.js'
  import 'codemirror/addon/fold/foldgutter.js'
  import 'codemirror/addon/fold/indent-fold.js'
  import 'codemirror/addon/fold/markdown-fold.js'
  import 'codemirror/addon/fold/xml-fold.js'
  import 'codemirror/addon/selection/active-line'
  import 'codemirror/addon/selection/selection-pointer'
  // import base style
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/theme/base16-light.css'
  import 'codemirror/addon/merge/merge.css'
  import 'codemirror/mode/javascript/javascript'
  import lodash from 'lodash'
  import { GetLanguageString } from '@/Users/lock/Desktop/simple-extension/src/js/i18_string_name'

  function formatDomainData (data) {
    return Object.assign({
      cookies: {
        cookies: {},
        selected: null,
      },
      redirects: [],
      requests: [],
      rewrites: [],
      ua: {
        selected: null,
        value: null,
      },
    }, data)
  }

  let editor
  const { setting } = chrome.extension.getBackgroundPage()
  export default {
    name: 'editor-data',
    components: {
      codemirror,
    },
    data () {
      return {
        ui: {
          hint: GetLanguageString('string_data_hint'),
          export: GetLanguageString('string_get_data'),
          save: GetLanguageString('string_save_data'),
        },
        options: {
          mode: { name: 'javascript', json: true },
          lineNumbers: true,
          styleActiveLine: true,
          matchBrackets: true,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        },
        code: '',
      }
    },
    mounted () {
      this.get()
    },
    methods: {
      get () {
        chrome.storage.local.get(data => {
          this.code = JSON.stringify(data, null, 2)
        })
      },
      async save () {
        let data
        try {
          data = JSON.parse(this.code)
        } catch (e) {
          console.error(e)
          this.$message.error(`Error: ${e}`)
          return
        }
        if (!lodash.isObject(data)) {
          console.log('重新获取数据')
          await setting.init()
          data = setting.data
        }
        const domains = data['domains']
        if (domains)
          Object.keys(domains).forEach(key => {
            // console.log('域名', key, domains[key])
            domains[key] = formatDomainData(domains[key])
          })
        console.log('数据', data)
        setting.domains = domains
        setting.customUA = data['customUA']
        this.code = JSON.stringify(data, null, 2)
        await new Promise(resolve => {
          chrome.storage.local.set(data, () => {
            console.log('保存成功')
            resolve()
          })
        })
        await setting.save()
        this.$message.success('Saved')
      },
    },
  }
</script>

<style>
    .CodeMirror {
        border: 1px solid black;
    }
</style>