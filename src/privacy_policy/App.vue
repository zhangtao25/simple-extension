<template>
    <el-dialog visible :show-close="false" title="简易扩展" v-if="isChinese">
        {zh_markdown}
        <div slot="footer" class="dialog-footer">
            <el-button @click="agree(false)">不同意</el-button>
            <el-button type="primary" @click="agree(true)">同意</el-button>
        </div>
    </el-dialog>
    <el-dialog visible :show-close="false" title="Simple Extension" v-else>
        {en_markdown}
        <div slot="footer" class="dialog-footer">
            <el-button @click="agree(false)">Disagree</el-button>
            <el-button type="primary" @click="agree(true)">Agree</el-button>
        </div>
    </el-dialog>
</template>

<script>
  const { tabs, setting } = window.bg = chrome.extension.getBackgroundPage()
  let domain = ''
  export default {
    data () {
      return {
        isChinese: window.navigator.language.indexOf('zh') === 0,
      }
    },
    methods: {
      async agree (agree) {
        setting.config['read_privacy_policy'] = agree
        await setting.save()
        // window.close()
        window.location.href = '/options.html#' + domain
      },
    },
    mounted () {
      const searches = window.location.search.substr(1).split('&')
      searches.forEach(search => {
        search = search.split('=')
        if (search[0] === 'domain')
          domain = search[1]
      })
    },
  }
</script>

<style scoped lang="scss">
</style>