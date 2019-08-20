import { GetLanguageString, PromptRegexpError } from './i18_string_name'
import * as pathToRegexp from 'path-to-regexp'
import { FormatError, NotMatchError } from './errors'
import url from 'url'
import { queue } from 'async'

const Difference = require('lodash/difference'),
  keyRegexp = /^:([a-z_][a-z\-_]*)$/i

/**
 * 从url提取域名
 * @param _url {String}
 * @returns {String || null}
 * @function
 */
export function GetDomain (_url) {
  if (!_url) return null
  const parse = url.parse(_url)
  // console.log('domain', parse);
  if (['http:', 'https:'].indexOf(parse.protocol) === -1)
    return null
  return parse.host
}

/**
 *
 * @param _url {String}
 * @param _rule {String}
 * @param _value {String}
 * @return {String}
 * @function
 */
export function URLRewrite (_url, _rule, _value) {
  const input = url.parse(_url),
    inputDomain = input.host,
    inputQuery = SearchParamsToJSON(input.search)
  const rule = url.parse(_rule),
    ruleDomain = rule.host,
    ruleQuery = SearchParamsToJSON(rule.search)
  const value = url.parse(_value),
    valueDomain = value.host,
    valueQuery = SearchParamsToJSON(value.search)

  if (!inputDomain)
    throw Error(
      'URL must be a full URL address, Start with http:// or https://')

  //如果Rule有Domain，则要于input的Domain相同才可以继续
  if (ruleDomain && inputDomain !== ruleDomain)
    throw new NotMatchError('The URL domain not equal the Rule domain.')

  if (!ruleDomain && _rule[0] !== '/')
    throw new FormatError('Rule format error')
  if (!valueDomain && _value[0] !== '/')
    throw new FormatError('Value format error')
  let to,
    toSearchParams = new URLSearchParams()

  const data = {}
  if (input.pathname && rule.pathname) {
    const ruleKeys = [], rulePath = pathToRegexp(rule.pathname, ruleKeys)
    const match = rulePath.exec(input.pathname)
    if (!match) {
      throw new NotMatchError('The URL path can not match the Rule path.')
    }
    // console.log('path string', input.pathname, rule.pathname);
    ruleKeys.forEach((key, index) => {
      data[key.name + ''] = match[index + 1]
    })
    // console.log('path result', data);
  }

  if (inputQuery && ruleQuery) {
    const inputQueryKeys = Object.keys(inputQuery),
      ruleQueryKeys = Object.keys(ruleQuery)
    const difference = Difference(ruleQueryKeys, inputQueryKeys)
    if (difference.length > 0) {
      throw new NotMatchError(
        `The URL missing query keys: ${difference.join(', ')} .`)
    }
    ruleQueryKeys.forEach(key => {
      if (ruleQuery[key]) {
        const match = ruleQuery[key].match(keyRegexp)
        //是参数名称
        if (match) {
          const queryKey = match[1]
          //与path存在相同的Key
          if (data.hasOwnProperty(queryKey)) {
            throw new Error(
              `the query key <strong>${queryKey}</strong> repeat with path keys`)
          }
          data[queryKey] = inputQuery[key]
        }
        //不是参数名称，则对比值
        else {
          if (ruleQuery[key] !== inputQuery[key]) {
            throw new NotMatchError(
              `The query <strong>${key}</strong> not equal: Rule ${ruleQuery[key]}, URL ${inputQuery[key]}`)
          }
        }
      }
    })
  }
  // console.log('final', data);

  Object.keys(valueQuery).forEach(key => {
    const match = valueQuery[key].match(keyRegexp)
    if (match) {
      const dataKey = match[1]
      if (data.hasOwnProperty(dataKey)) {
        toSearchParams.append(key, data[dataKey])
      } else {
        throw new Error(`Missing key <strong>${dataKey}</strong>`)
      }
    } else {
      toSearchParams.append(key, valueQuery[key])
    }
  })

  to = pathToRegexp.compile(value.pathname)
  toSearchParams = toSearchParams.toString()
  if (toSearchParams.length > 0)
    toSearchParams = '?' + toSearchParams
  to = to(data) + toSearchParams
  if (valueDomain) {
    to = `${value.protocol}//${valueDomain}${to}`
  } else {
    to = `${input.protocol}//${inputDomain}${to}`
  }

  return to
}

/**
 *
 * @param _url
 * @param _value
 * @returns {string}
 * @function
 */
export function URLRedirect (_url, _value) {
  const input = url.parse(_url)
  return _url.replace(input.host, _value)
}

/**
 * 网址查询转为json
 * @param query
 * @return {JSON}
 * @function
 */
export function SearchParamsToJSON (query) {
  const data = {}
  if (query) {
    const params = new URLSearchParams(encodeURI(query))
    params.forEach((v, k) => {
      data[k] = v
    })
  }
  return data
}

/**
 * 读取Chrome的Cookies
 * @param url {String}
 * @returns {Promise}
 * @function
 */
export function GetCookies (url) {
  return new Promise(resolve => {
    chrome.cookies.getAll({ url }, cookies => {
      // console.log('获取Cookies 1', details, cookies);
      if (cookies) {
        cookies = cookies.map(cookie => {
          let domain = cookie.domain
          if (domain.indexOf('.') === 0)
            domain = domain.substr(1)
          return {
            domain,
            name: cookie.name,
            value: cookie.value,
            expirationDate: cookie.expirationDate,
            httpOnly: cookie.httpOnly,
            url: 'http://' + domain,
            path: cookie.path,
          }
        })
      } else {
        cookies = []
      }
      // console.log('获取Cookies 2', cookies);
      resolve(cookies)
    })
  })
}

/**
 * 删除Chrome的Cookies
 * @param url{String}
 * @param name {String}
 * @returns {Promise}
 * @function
 */
export function RemoveCookie (url, name) {
  return new Promise(resolve => {
    // console.log('删除Cookie', JSON.stringify({url, name}));
    // resolve();
    chrome.cookies.remove({ url, name }, resolve)
  })
}

const cookiesQueue = queue((cookie, callback) => {
  // console.log('cookie队列', cookie.domain)
  chrome.cookies.set(cookie, () => callback())
}, 5)

/**
 * 设置Chrome的Cookies
 * @param data {Object || Array}
 * @function
 */
export function SetCookies (data) {
  cookiesQueue.push(data)
}

/**
 * 清空域名的所有Cookies
 * @param url {String}
 * @return {Promise}
 * @function
 */
export async function ClearCookies (url) {
  const cookies = await GetCookies(url)
  // console.log('删除Cookies前', cookies);
  await Promise.all(cookies.map(cookie => {
    return RemoveCookie(url, cookie.name)
  }))
  // console.log('删除Cookies后', await GetCookies(url));
}

/**
 * 读取Chrome的Storage
 * @param get
 * @param defaultValue
 * @returns {Promise<{}>}
 * @function
 */
export function GetStorage (get, defaultValue = {}) {
  return new Promise(resolve => {
    chrome.storage.local.get(get, items => {
      if (Object.keys(items).length === 0 && items.constructor === Object)
        return resolve(defaultValue)
      resolve(items)
    })
  })
}

/**
 *
 * @param message
 * @param _default
 * @returns {String}
 * @function
 */
export function Prompt (message = null, _default = null) {
  let value = prompt(message ? message : '', _default ? _default : '')
  if (!value)
    return ''
  return value.trim()
}

const RegularExpression = /^\/.+\/[gi]$/

/**
 *
 * @param message
 * @param _default
 * @returns {String || null}
 * @function
 */
export function GetRegExp (message, _default = null) {
  let input = '', hasError = false
  while (true) {
    const _msg = hasError ? message + '\n' +
      GetLanguageString(PromptRegexpError) : message,
      _val = hasError ? input : _default
    input = Prompt(_msg, _val)
    if (RegularExpression.test(input)) {
      try {
        new RegExp(input)
        break
      } catch (e) {
        hasError = true
      }
    } else {
      break
    }
  }
  return input
}
