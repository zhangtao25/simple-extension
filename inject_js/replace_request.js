console.log('注入js');
(() => {
  /*console.clear = () => {

  };*/

  const prevFetch = window.fetch;
  window.fetch = function (url, options) {
    const data = {url, tabUrl: window.location.href};
    console.log('拦截 fetch', data);
    window.postMessage({fromPlugin: true, data}, '*');
    // 自己的拦截逻辑
    return prevFetch.apply(this, arguments);
  };
  const XHR = XMLHttpRequest.prototype;
  // Remember references to original methods
  const open = XHR.open;
  const send = XHR.send;
  XHR._intercept = false;

  // Overwrite native methods
  // Collect data:
  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    open.apply(this, arguments);
  };

  // Implement "ajaxSuccess" functionality
  XHR.send = function (postData) {
    if (!this._intercept) {
      this._intercept = true;
      this.addEventListener('load', function () {
        const data = {
          tabUrl: window.location.href,
          url: this.responseURL,
          // method: this._method,
          // data: postData
        };
        // console.log('ajax', data);
        window.postMessage({fromPlugin: true, data}, '*');
      });
    }
    return send.apply(this, arguments);
  };
})();