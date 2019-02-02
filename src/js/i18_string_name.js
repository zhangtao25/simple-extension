export const
  MenuRootText = 'menu_root_text',

  MenuCookieRootText = 'menu_cookie_root_text',
  MenuCookieUseText = 'menu_cookie_use_text',
  MenuCookieEmptyText = 'menu_cookie_empty_text',

  MenuUseragentRootText = 'menu_useragent_text',
  MenuUseragentDefaultText = 'menu_useragent_default_text',
  MenuAjaxText = 'menu_ajax_text',

  AlertNoCookies = 'alert_no_cookies',
  AlertSaveCookiesFailEmptyName = 'alert_save_cookies_fail_empty_name',

  ConfirmDeleteCookie = 'confirm_delete_cookie',
  ConfirmDeleteRequest = 'confirm_delete_request',
  ConfirmDeleteRewrite = 'confirm_delete_rewrite',
  ConfirmDeleteRedirect = 'confirm_delete_redirect',

  PromptSaveCookiesName = 'prompt_save_cookies_name',
  PromptHowToGetTheRequestUrl = 'prompt_how_to_get_the_request_url',
  PromptRewriteName = 'prompt_host_rewrite_name',
  PromptRewriteRule = 'prompt_host_rewrite_rule',
  PromptRewriteValue = 'prompt_host_rewrite_value',
  PromptRedirectName = 'prompt_host_redirect_name',
  PromptRedirectRule = 'prompt_host_redirect_rule',
  PromptRedirectValue = 'prompt_host_redirect_value',
  PromptRegexpError = 'prompt_regexp_error',

  StringCookies = 'string_cookies',
  StringRequests = 'string_requests',
  StringUrlList = 'string_url_list',
  StringHostRewrite = 'string_host_rewrite',
  StringHostRedirect = 'string_host_redirect',
  StringUA = 'string_ua',
  StringSave = 'string_save',
  StringBrowserActionEnable = 'string_browser_action_enable',
  StringBrowserActionDisabled = 'string_browser_action_disabled';


/**
 * @param name {String}
 * @param replaces {Array}
 * @return {string}
 * @function
 */
export function GetLanguageString(name, replaces = []) {
  let str = chrome.i18n.getMessage(name);

  replaces.forEach(rep => {
    str = str.replace(rep[0], rep[1]);
  });

  return str;
}
