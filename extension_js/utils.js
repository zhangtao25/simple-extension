/**
 *
 * @param url {String}
 * @returns {String || null}
 * @function
 */
function GetDomain(url) {
  const match = /https?:\/\/([^\/]+)/.exec(url);
  return match ? match[1] : null;
}


/**
 * 创建或定位到tab
 * @param url
 * @param domain
 */
function FocusOrCreateTab(url, domain) {
  chrome.windows.getAll({"populate": true}, function (windows) {
    let existing_tab = null;
    for (let i in windows) {
      const tabs = windows[i].tabs;
      for (let j in tabs) {
        const tab = tabs[j];
        if (tab.url === url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {"selected": true, url: url + '#' + domain});
    } else {
      chrome.tabs.create({"url": url + '#' + domain});
    }
  });
}