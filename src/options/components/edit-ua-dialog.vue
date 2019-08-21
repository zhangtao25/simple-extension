<template>
    <el-dialog :visible.sync="showDialog" :title="title" width="600px">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item :label="ui.name" prop="name">
                <el-input v-model="form.name" :placeholder="ui.name"/>
            </el-form-item>
            <el-form-item :label="ui.value" prop="value">
                <el-input v-model="form.value" :placeholder="ui.value"/>
            </el-form-item>
        </el-form>

        <div slot="footer">
            <el-button @click="showDialog = false">{{ui.cancel}}</el-button>
            <el-button type="primary" @click="submit">{{button}}</el-button>
        </div>
    </el-dialog>
</template>

<script>
  import {
    GetLanguageString,
    StringAdd,
    StringAddUA,
    StringCancel,
    StringEdit,
    StringEditUA,
    StringName,
    StringValue,
  } from '../../js/i18_string_name'

  export default {
    data () {
      return {
        ui: {
          name: GetLanguageString(StringName),
          value: GetLanguageString(StringValue),
          cancel: GetLanguageString(StringCancel),
        },
        showDialog: false,
        form: { index: -1, name: '', value: '' },
        rules: {
          name: [{ required: true, message: GetLanguageString('string_can_not_empty'), trigger: 'blur' }],
          value: [{ required: true, message: GetLanguageString('string_can_not_empty'), trigger: 'blur' }],
        },
      }
    },
    computed: {
      title () {
        return GetLanguageString(this.isAdd ? StringAddUA : StringEditUA)
      },
      button () {
        return GetLanguageString(this.isAdd ? StringAdd : StringEdit)
      },
      isAdd () {
        return this.form.index === -1
      },
    },
    methods: {
      show (index, name, value) {
        this.form.index = index
        this.form.name = name
        this.form.value = value
        this.showDialog = true
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      },
      hide () {
        this.showDialog = false
      },
      submit () {
        this.$refs['form'].validate(valid => {
          if (valid)
            this.$emit('submit', this.form)
        })
      },
    },
  }
</script>

<style scoped>

</style>