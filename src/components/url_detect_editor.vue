<template>
    <div class="block">
        <div class="title flex-between-spaced">
            {{ui.requests}}
            <div class="btn add" @click="addItem"></div>
        </div>
        <transition-group name="list" tag="div" class="content">
            <div v-for="(value, index) in list"
                 :key="'requests'+index"
                 class="flex-between-spaced">
                <span v-text="list[index]" @click="modifyItem(index)"></span>
                <div class="btn delete" @click="deleteItem(index)"></div>
            </div>
        </transition-group>
    </div>
</template>

<script>
  import {
    ConfirmDelete,
    GetLanguageString,
    PromptHowToGetTheRequestUrl,
    StringRequests
  } from "../js/i18_string_name";
  import {Prompt} from "../js/utils";

  export default {
    props: {list: {required: true, type: Array}},
    data() {
      return {ui: {requests: GetLanguageString(StringRequests)}}
    },
    methods: {
      addItem() {
        const input = Prompt(GetLanguageString(PromptHowToGetTheRequestUrl), 'video.m3u8');
        if (!input)
          return;

        if (this.list.indexOf(input) !== -1)
          return;
        this.list.push(input);
        this.$emit('changed');
      },
      modifyItem(index) {
        if (this.list[index]) {
          const input = Prompt(GetLanguageString(PromptHowToGetTheRequestUrl), this.list[index]);
          if (!input)
            return;
          this.$set(this.list, index, input);
          this.$emit('changed');
        }
      },
      deleteItem(index) {
        if (this.list.length > index
          && confirm(GetLanguageString(ConfirmDelete, [['%value', this.list[index]]]))) {
          this.list.splice(index, 1);
          this.$emit('changed');
        }
      },
    },
  }
</script>

<style scoped>

</style>