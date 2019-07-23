export const
  PluginName = 'pluginName',
  PluginDesc = 'pluginDesc',

  MenuRootText = 'menu_root_text',

  MenuCookieRootText = 'menu_cookie_root_text',
  MenuCookieUseText = 'menu_cookie_use_text',
  MenuCookieEmptyText = 'menu_cookie_empty_text',

  MenuUseragentRootText = 'menu_useragent_text',
  MenuUseragentDefaultText = 'menu_useragent_default_text',
  MenuAjaxText = 'menu_ajax_text',
  MenuCustomUA = 'menu_custom_useragent_text',

  AlertNoCookies = 'alert_no_cookies',
  AlertSaveCookiesFailEmptyName = 'alert_save_cookies_fail_empty_name',

  ConfirmDelete = 'confirm_delete',
  ConfirmDeleteUAUsed = 'confirm_delete_ua_used',

  PromptSaveCookiesName = 'prompt_save_cookies_name',
  PromptHowToGetTheRequestUrl = 'prompt_how_to_get_the_request_url',
  PromptRewriteName = 'prompt_host_rewrite_name',
  PromptRewriteRule = 'prompt_host_rewrite_rule',
  PromptRewriteValue = 'prompt_host_rewrite_value',
  PromptRedirectName = 'prompt_host_redirect_name',
  PromptRedirectValue = 'prompt_host_redirect_value',
  PromptRegexpError = 'prompt_regexp_error',

  StringCookies = 'string_cookies',
  StringAdd = 'string_add',
  StringEdit = 'string_edit',
  StringDelete = 'string_delete',
  StringValue = 'string_value',
  StringName = 'string_name',
  StringCancel = 'string_cancel',
  StringRequests = 'string_requests',
  StringUrlList = 'string_url_list',
  StringHostRewrite = 'string_host_rewrite',
  StringUA = 'string_ua',
  StringSave = 'string_save',
  StringRewriteTo = 'string_host_rewrite_to',
  StringBrowserActionEnable = 'string_browser_action_enable',
  StringBrowserActionDisabled = 'string_browser_action_disabled',
  StringChromeStorePage = 'string_chrome_store_page',
  StringLink = 'string_link',
  StringAuthor = 'string_author',
  StringLibraries = 'string_libraries',
  StringOpenSource = 'string_open_source',
  StringGlobalEditor = 'string_global_editor',
  StringCookiesEmpty = 'string_cookies_empty',
  StringDefault = 'string_default',
  StringUrlTestTool = 'string_url_test_tool',
  StringGlobalSetting = 'string_global_setting',
  StringWebsiteSetting = 'string_website_setting',
  StringAddUA = 'string_add_useragent',
  StringEditUA = 'string_edit_useragent',
  StringPrivacyPolicy='string_privacy_policy'

/**
 * @param name {String}
 * @param replaces {Array}
 * @return {string}
 * @function
 */
export function GetLanguageString(name, replaces = []) {
  let str = chrome.i18n.getMessage(name)

  replaces.forEach(rep => {
    str = str.replace(rep[0], rep[1])
  })

  return str
}
