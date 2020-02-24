<template>
    <div class="card">
        <h1>Simple Extension URL Test Tool</h1>
        <iframe src="https://ghbtns.com/github-btn.html?user=gzlock&repo=simple-extension&type=star&count=true"
                frameborder="0" scrolling="0" width="170px" height="20px"></iframe>
        <div>
            <div>Url</div>
            <input v-model="input" placeholder="https://www.google.com/search?q=simple-extenion"/>
        </div>
        <div v-if="type==='rewrite'">
            <div>Rule</div>
            <div><input v-model="rule"/></div>
            <div class="tips">Accept two formats:</div>
            <ul class="tips">
                <li>Full URL: <span>https://google.com/:action?q=:searchString</span></li>
                <li>Just URL path: <span>/:action?q=:searchString</span></li>
            </ul>
            <div v-if="parserIsEmpty===false" style="margin-top: 20px">
                <div>Parameters</div>
                <table class="parameters">
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                    <tr v-for="(value,key) in parameters" :key="key">
                        <td>{{key}}</td>
                        <td>{{value}}</td>
                    </tr>
                </table>
            </div>
        </div>
        <div>
            <div>
                Rewrite To Value
            </div>
            <span><input v-model="value"/></span>
            <template v-if="type === 'rewrite'">
                <div class="tips">Accept two formats:</div>
                <ul class="tips">
                    <li>Full URL: <span>https://b.com/:action?q=:searchString</span></li>
                    <li>Just URL path: <span>/:action?q=:searchString</span></li>
                </ul>
            </template>
            <template v-else>
                <div class="tips">Just accept hosts:</div>
                <ul class="tips">
                    <li>Domain: <span>b.com</span></li>
                    <li>IP: <span>8.8.8.8</span></li>
                </ul>
            </template>
        </div>
        <div>
            <button @click="clear">Clear</button>
            <br/>
            Preset Link <input :value="preset" style="width: 400px" onclick="this.select()"/>
        </div>
        <div class="result">
            <div>Result</div>
            <div v-html="result"></div>
        </div>
    </div>
</template>

<script>
  import { isEmpty } from 'lodash'
  import { FormatError, NotMatchError } from '../../js/errors'
  import { URlPathParameters, URLRewrite } from '../../js/utils'

  const url = require('url')

  export default {
    head: {
      title: 'Simple Extension URL Test Tool',
    },
    data () {
      return {
        type: 'rewrite',
        input: 'https://www.google.com/b/c/d?e=simple-extenion&f=unused',
        rule: '/b/:action/(.*)?e=:searchString',
        value: 'https://a.com/other/path/:0/:searchString?action=:action&reuse=:action&other=query',
        parameters: {},
      }
    },
    computed: {
      typeString () {
        return this.type[0].toUpperCase() + this.type.substr(1)
      },
      parserIsEmpty () {
        return isEmpty(this.parameters)
      },
      result () {
        if (!process.client)
          return ''

        try {
          this.parameters = URlPathParameters(this.input, this.rule)
        } catch (e) {
          this.parameters = {}
        }

        try {
          const to = URLRewrite(this.input, this.rule, this.value)
          return `<div class="success">Success!</div><div>${this.typeString} To:</div><div><a href="${to}" target="_blank">${to}</a></div>`
        } catch (e) {
          console.error(e)
          let errorType = 'Error'
          if (e instanceof NotMatchError)
            errorType = 'Not Match'
          else if (e instanceof FormatError)
            errorType = 'Format Error'
          return `<div class="error">${errorType}</div><pre class="error">${e.message}</pre>`
        }
      },
      preset () {
        if (!process.client)
          return ''
        const _url = url.parse(window.location.href)
        const preset = new Buffer(JSON.stringify({
          type: this.type === 'rewrite' ? 0 : 1,
          url: this.input,
          rule: this.rule,
          value: this.value,
        }), 'utf8').toString('base64')
        return `${_url.protocol}//${_url.host}${_url.pathname}#preset=${preset}`
      },
    },
    methods: {
      clear () {
        this.input = ''
        this.rule = ''
        this.value = ''
      },
    },
    beforeMount () {
      if (process.client) {
        const hash = new URLSearchParams(window.location.hash.substr(1))
        if (hash.has('preset')) {
          try {
            const preset = JSON.parse(new Buffer(hash.get('preset'), 'base64').toString('utf8'))
            const { type, url, rule, value } = preset
            if ([undefined, 0, 1].indexOf(type) !== -1 && url && rule && value) {
              this.type = type ? 'redirect' : 'rewrite'
              this.input = url
              this.rule = rule
              this.value = value
            }
          } catch (e) {
            console.error('parse preset data error')
          }
        }
      }
    },
  }
</script>

<style>
    html, body {
        padding: 0;
        margin: 0;
    }

    body {
        height: 100vh;
        background: cadetblue;
        padding: 10px;
        box-sizing: border-box;
    }

    .card {
        padding: 10px;
        width: 600px;
        height: 100%;
        margin: 0 auto;
        border-radius: 5px;
        background: white;
    }

    h1 {
        margin: 0;
    }

    .card > * + * {
        margin-top: 15px;
    }

    input {
        width: 80%;
    }

    ul {
        margin: 0;
        padding-left: 20px;
    }

    .tips {
        color: #999;
        font-size: 12px;
    }

    .success {
        color: #008548;
    }

    .error {
        color: red;
    }

    .parameters {
        width:100%;
        border-collapse: collapse;
        border: 1px solid grey;
    }

    .parameters th, .parameters td {
        padding: 8px;
        border: 1px solid grey;
        white-space: pre-wrap;
        word-break: break-word;
        min-width: 40px;
    }

    .parameters th {
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }

    .parameters tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    .parameters tr:hover {
        background-color: #ddd;
    }

    .result {
        overflow-wrap: break-word;
        word-wrap: break-word;
    }
</style>
