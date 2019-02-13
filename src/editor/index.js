import Vue from 'vue'
import '../css/global.css';
import '../css/editor.css';
import Editor from './components/editor';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  components: {Editor}
});