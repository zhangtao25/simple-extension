window.onload = () => {
  const setting = new Setting(() => {

    new Vue({
      el: '#app',
      data: {
        ui: {network_notification_type: GetLanguageString('string_network_notification_type')},
      },

    });
  });
};