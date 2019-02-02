const
  MenuRootText = 'menu_root_text';

const
  MenuCookieRootText = 'menu_cookie_root_text',
  MenuCookieUseText = 'menu_cookie_use_text',
  MenuCookieEmptyText = 'menu_cookie_empty_text';

const
  MenuUseragentRootText = 'menu_useragent_text',
  MenuUseragentDefaultText = 'menu_useragent_default_text',
  MenuAjaxText = 'menu_ajax_text';

const AlertNoCookies = 'alert_no_cookies',
  AlertSaveCookiesFailEmptyName = 'alert_save_cookies_fail_empty_name';

const ConfirmDeleteCookie = 'confirm_delete_cookie',
  ConfirmDeleteRequest = 'confirm_delete_request';

const PromptSaveCookiesName = 'prompt_save_cookies_name',
  PromptHowToGetTheRequestUrl = 'prompt_how_to_get_the_request_url',
  PromptRewriteName = 'prompt_host_rewrite_name',
  PromptRewriteRule = 'prompt_host_rewrite_rule',
  PromptRewriteValue = 'prompt_host_rewrite_value',
  PromptRedirectName = 'prompt_host_redirect_name',
  PromptRedirectRule = 'prompt_host_redirect_rule',
  PromptRedirectValue = 'prompt_host_redirect_value',
  PromptRegexpError = 'prompt_regexp_error';

const StringCookies = 'string_cookies',
  StringRequests = 'string_requests',
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
function GetLanguageString(name, replaces = []) {
  let str = chrome.i18n.getMessage(name);

  replaces.forEach(rep => {
    str = str.replace(rep[0], rep[1]);
  });

  return str;
}