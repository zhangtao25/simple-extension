### 简易扩展的隐私政策说明

1. 简易扩展属于非盈利性项目
2. 简易扩展是开源项目，发布在[https://github.com/gzlock/simple-extension](https://github.com/gzlock/simple-extension)
3. 不向任何人(包括这个扩展的开发者本人)发送和分享用户的任何数据，所有数据使用Chrome浏览器提供的扩展存储API存储在用户的电脑。您可以自由审核简易扩展的源码，在[https://github.com/gzlock/simple-extension](https://github.com/gzlock/simple-extension)
4. '切换Cookies'会将对应域名的cookies通过Chrome Api的'chrome.storage.local'存储到您的本地电脑。如果不同意存储您的任何Cookies，请不要使用该项功能。
5. 该扩展会监听Chrome的所有网络请求，因为：
    1. '监听网络请求'功能需要检测网络请求网址是否匹配您的设置值，如果匹配会显示到对应的弹出页面上。
    2. '切换浏览器识别码'功能需要检测网络请求是否匹配您的设置值，如果匹配会将网络请求header的'user-agent'的值改为您设置的值。
    3. '网络重定向'需要检测网络请求网址是否匹配您的设置，如果匹配会将网络请求重定向到您设置的值。


### The Privacy Policy For Simple Extension

1. Simple Extension is non-profit project.
2. Simple Extension is open source project, github page: [https://github.com/gzlock/simple-extension](https://github.com/gzlock/simple-extension).
3. Simple Extension did not send and share any user data to me(the developer of extension) and third-party. You can review the Simple Extension code on the github page: [https://github.com/gzlock/simple-extension](https://github.com/gzlock/simple-extension)
4. The 'Switch Cookies' function will save the cookies data on your computer by the Chrome API named 'chrome.storage.local'.
5. This extension will access your all network requests within the chrome browser, because:
    1. The 'Network request listener' function need to match your setting value , if matched then will show in the popup page for this extension.
    2. The 'Switch User-Agent' function need to modify the user-agent header of the network request to your setting value.
    3. The 'Network requests redirect' function need to match your setting value, if matched then redirect to your setting url.