const Notifications = {};
const iconUrl = 'img/icon_48.png';

chrome.runtime.onInstalled.addListener(details => {

  chrome.notifications.onClicked.addListener(notificationId => {
    if (!__hasNotification(notificationId))
      return;
    console.log('点击了通知', notificationId);
    const notification = Notifications[notificationId];
    const textarea = document.querySelector('#textarea');
    textarea.value = notification;
    textarea.select();
    document.execCommand('copy');
    chrome.notifications.clear(notificationId);
  });

  chrome.notifications.onClosed.addListener((notificationId, byUser) => {
    console.log('通知关闭了', notificationId, byUser);
    if (!__hasNotification(notificationId))
      return;
    delete Notifications[notificationId];
  });
});

function __hasNotification(notificationId) {
  const index = Object.keys(Notifications).indexOf(notificationId);
  return index !== -1;
}

function CreateNotification(title, message, data) {
  const id = Date.now().toString(32);
  console.log('创建通知', id);
  Notifications[id] = data;
  const options = {type: 'basic', title, iconUrl};

  if (message && message.constructor === String) {
    options.message = message;
  } else {
    options.message = '';
  }

  chrome.notifications.create(id, options)
}