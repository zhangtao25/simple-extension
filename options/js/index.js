window.onload = () => {
  const setting = new Setting(() => {

    new Vue({
      el: '#app',
      data: {
        ui: {
          title: GetLanguageString('pluginName'),
          version: 'v' + chrome.runtime.getManifest().version,
          network_notification_type: GetLanguageString('string_network_notification_type'),
          author: GetLanguageString('string_author'),
          libraries: GetLanguageString('string_libraries'),
          open_source: GetLanguageString('string_open_source'),
          thanks: GetLanguageString('string_thanks'),
        },
      },

    });
  });
};