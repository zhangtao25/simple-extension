<template>
    <el-dialog :visible.sync="showDialog" :title="title">
        <el-form>
            <el-form-item>
                <el-input v-model="form.name" :placeholder="ui.name"/>
            </el-form-item>
            <el-form-item>
                <el-input v-model="form.value" :placeholder="ui.value"/>
            </el-form-item>
        </el-form>

        <div slot="footer">
            <el-button @click="showDialog = false">{{ui.cancel}}</el-button>
            <el-button type="primary" @click="submit">{{ui.add}}}</el-button>
        </div>
    </el-dialog>
</template>

<script>
  import {
    GetLanguageString,
    StringAdd,
    StringAddUA,
    StringCancel,
    StringEditUA,
    StringName,
    StringValue,
  } from '../../js/i18_string_name'

  export default {
    data() {
      return {
        ui: {
          name: GetLanguageString(StringName),
          value: GetLanguageString(StringValue),
          add: GetLanguageString(StringAdd),
          cancel: GetLanguageString(StringCancel),
        },
        showDialog: false,
        form: { index: -1, name: '', value: '' },
      }
    },
    computed: {
      title() {
        return GetLanguageString(this.form.index === -1 ? StringAddUA : StringEditUA)
      },
    },
    methods: {
      show(index, name, value) {
        this.form.index = index
        this.form.name = name
        this.form.value = value
        this.showDialog = true
      },
      hide() {
        this.showDialog = false
      },
      submit() {
        this.$emit('submit', this.form)
      },
    },
  }
</script>

<style scoped>

</style>