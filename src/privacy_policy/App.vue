<template>
    <el-dialog visible :show-close="false" title="简易扩展 / Simple Extension">
        {markdown}
        <div slot="footer" class="dialog-footer">
            <el-button @click="agree(false)">不同意 / Disagree</el-button>
            <el-button type="primary" @click="agree(true)">同意 / Agree</el-button>
        </div>
    </el-dialog>
</template>

<script>
  const { tabs, setting } = window.bg = chrome.extension.getBackgroundPage()
  export default {
    methods: {
      async agree(agree) {
        setting.config['read_privacy_policy'] = agree
        await setting.save()
        window.close()
      },
    },
  }
</script>

<style scoped lang="scss">
</style>