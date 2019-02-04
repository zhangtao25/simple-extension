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
        </div>
        <div>
            <div>
                <!--<select v-model="type">
                    <option value="rewrite">Rewrite</option>
                    <option value="redirect">Redirect</option>
                </select>-->
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
            Preset Link <input :value="preset" style="width: 400px" onclick="this.select()"/>
        </div>
        <div>
            <div>Result</div>
            <div v-html="result"></div>
        </div>
    </div>
</template>

<script>
  import {FormatError, NotMatchError} from "../../js/errors";
  import {URLRedirect, URLRewrite} from "../../js/utils";

  const url = require('url');

  export default {
    head: {
      title: 'Simple Extension URL Test Tool'
    },
    data() {
      return {
        type: 'rewrite',
        input: 'https://www.google.com/b/c/d?e=simple-extenion&f=unused',
        rule: '/b/:action/(.*)?e=:searchString',
        value: 'https://a.com/other/path/:0/:searchString?action=:action&reuse=:action&other=query',
      };
    },
    computed: {
      typeString() {
        return this.type[0].toUpperCase() + this.type.substr(1);
      },
      result() {
        if (!process.client)
          return '';
        try {
          let to;
          if (this.type === 'rewrite') {
            to = URLRewrite(this.input, this.rule, this.value);
          } else {
            to = URLRedirect(this.input, this.value);
          }
          to = decodeURI(to);
          return `<div>Success!</div><div>${this.typeString} To:</div><div><a href="${to}" target="_blank">${to}</a></div>`;
        } catch (e) {
          console.error(e);
          let errorType = 'Error';
          if (e instanceof NotMatchError)
            errorType = 'Not Match';
          else if (e instanceof FormatError)
            errorType = 'Format Error';
          return `<div class="error">${errorType}</div><pre class="error">${e.message}</pre>`;
        }
      },
      preset() {
        if (!process.client)
          return '';
        const _url = url.parse(window.location.href);
        const preset = new Buffer(JSON.stringify({
          type: this.type === 'rewrite' ? 0 : 1,
          url: this.input,
          rule: this.rule,
          value: this.value
        }), 'utf8').toString('base64');
        return `${_url.protocol}//${_url.host}${_url.pathname}#preset=${preset}`;
      },
    },
    methods: {
      clear() {
        this.input = '';
        this.rule = '';
        this.value = '';
      },
    },
    mounted() {
      if (process.client) {
        const hash = new URLSearchParams(window.location.hash.substr(1));
        if (hash.has('preset')) {
          try {
            const preset = JSON.parse(new Buffer(hash.get('preset'), 'base64').toString('utf8'));
            const {type, url, rule, value} = preset;
            if ([undefined, 0, 1].indexOf(type) !== -1 && url && rule && value) {
              this.type = type ? 'redirect' : 'rewrite';
              this.input = url;
              this.rule = rule;
              this.value = value;
            }
          } catch (e) {
            console.error('parse preset data error');
          }
        }
      }
    }
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

    .error {
        color: red;
    }
</style>