import Vue from 'vue'
import PopUp from './popup.vue'
import {GetDomain} from "../js/utils";

chrome.tabs.query({currentWindow: true, active: true}, tabs => {
  const tab = tabs[0], domain = GetDomain(tab.url);
  if (!domain) {
    chrome.browserAction.disable(tab.id);
    window.close();
    return;
  }
  new Vue({
    el: '#app',
    data: {
      domain,
      tab: {id: tab.id, url: tab.url}
    },
    components: {PopUp}
  });
});
