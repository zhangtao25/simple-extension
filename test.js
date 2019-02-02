const pathToRegexp = require('path-to-regexp');
const url = require('url');

const input = 'http://1.a.com:800/:b/:c/:d?abc=123';
const parse = url.parse(input);
const search = new URLSearchParams('a=123&b=');

console.log(parse);