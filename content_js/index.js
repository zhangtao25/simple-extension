function injectCustomJs(jsPath = null) {
  if (!jsPath)
    throw Error('注入了不存在的js文件');
  const temp = document.createElement('script');
  temp.setAttribute('type', 'text/javascript');
  temp.src = chrome.extension.getURL(jsPath);
  temp.onload = function () {
    // 放在页面不好看，执行完后移除掉
    this.parentNode.removeChild(this);
  };
  document.documentElement.appendChild(temp);
}

//注入页面js，监听ajax请求
injectCustomJs('inject_js/replace_request.js');

//监听注入js发回的消息，转发给background.js
window.addEventListener('message', e => {
  if (e.data['fromPlugin']) {
    // console.log('content/index.js 接收到消息', e.data.data.url);
    chrome.runtime.sendMessage(e.data.data);
  }
}, false);