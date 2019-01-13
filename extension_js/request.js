/**
 * 改变网络请求User-Agent
 */
chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    const url = details.url;
    const domain = GetDomain(url);

    if (!domain)
      return;
    const ua = setting.getUA(domain);
    if (ua && ua.value) {
      for (let i = 0; i < details.requestHeaders.length; i++) {
        const header = details.requestHeaders[i];
        if (header.name.toLowerCase() === 'user-agent') {
          // console.log('替换UA', header.value, ua.value);
          header.value = ua.value;
          break;
        }
      }
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["http://*/*", "https://*/*"]},
  ["blocking", "requestHeaders"]
);


/**
 * 浏览器级监控网络请求
 */
chrome.webRequest.onCompleted.addListener(
  details => {
    const url = details.url;
    // console.log('检测网络请求', url, details);
    const domain = GetDomain(url);

    if (!domain)
      return;

    const requests = setting.getRequests(domain);
    if (!requests)
      return;

    for (let i = 0; i < requests.length; i++) {
      if (url.indexOf(requests[i]) === -1)
        continue;
      CreateNotification(
        GetLanguageString(NotificationRequestTitle, [['%domain', domain]]),
        GetLanguageString(NotificationRequestMessage, [['%url', url]]),
        url,
      );
    }
  },
  {urls: ["http://*/*", "https://*/*"]},
  ["responseHeaders"]
);