/**
 * 读取Chrome的Cookies
 * @param url {String}
 * @returns {Promise<[]>}
 * @function
 */
function GetCookies(url) {
  return new Promise(resolve => {
    chrome.cookies.getAll({url}, cookies => {
      // console.log('获取Cookies 1', details, cookies);
      cookies = cookies.map(cookie => {
        let domain = cookie.domain;
        if (domain.indexOf('.') === 0)
          domain = domain.substr(1);
        return {
          domain,
          name: cookie.name,
          value: cookie.value,
          expirationDate: cookie.expirationDate,
          httpOnly: cookie.httpOnly,
          url,
        };
      });
      // console.log('获取Cookies 2', cookies);
      resolve(cookies);
    });
  });
}

/**
 * 删除Chrome的Cookies
 * @param url{String}
 * @param name {String}
 * @returns {Promise}
 * @function
 */
function RemoveCookie(url, name) {
  return new Promise(resolve => {
    console.log('删除Cookie', JSON.stringify({url, name}));
    // resolve();
    chrome.cookies.remove({url, name}, resolve);
  });
}

/**
 * 设置Chrome的Cookies
 * @param data {Object || Array}
 * @return {Promise}
 * @function
 */
function SetCookies(data) {
  console.log('设置Chrome Cookies', data);
  if (data.constructor === Array) {
    const queue = data.map(cookie => {
      return new Promise(resolve => {
        chrome.cookies.set(cookie, resolve);
      });
    });
    return Promise.all(queue);
  } else if (data.constructor === Object) {
    return new Promise(resolve => {
      chrome.cookies.set(data, () => resolve())
    })
  }
}

/**
 * 清空域名的所有Cookies
 * @param url {String}
 * @return {Promise}
 * @function
 */
async function ClearCookies(url) {
  const cookies = await GetCookies(url);
  console.log('删除Cookies前', cookies);
  await Promise.all(cookies.map(cookie => {
    return RemoveCookie(url, cookie.name);
  }));
  console.log('删除Cookies后', await GetCookies(url));
}

/**
 * 读取Chrome的Storage
 * @param get
 * @param defaultValue
 * @returns {Promise<{}>}
 * @function
 */
function GetStorage(get, defaultValue = {}) {
  return new Promise(resolve => {
    chrome.storage.local.get(get, items => {
      if (Object.keys(items).length === 0 && items.constructor === Object)
        return resolve(defaultValue);
      resolve(items)
    });
  });
}