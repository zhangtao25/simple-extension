const
  MenuRootText = 'menu_root_text';

const
  MenuCookieRootText = 'menu_cookie_root_text',
  MenuCookieSaveText = 'menu_cookie_save_text',
  MenuCookieUseText = 'menu_cookie_use_text',
  MenuCookieRemoveText = 'menu_cookie_remove_text',
  MenuCookieEmptyText = 'menu_cookie_empty_text';

const
  MenuUseragentRootText = 'menu_useragent_text',
  MenuUseragentDefaultText = 'menu_useragent_default_text',
  MenuAjaxText = 'menu_ajax_text';

const BadgeWorking = 'badge_working',
  BadgeNotWorking = 'badge_not_working';

const AlertNoCookies = 'alert_no_cookies',
  AlertSaveCookiesFailEmptyName = 'alert_save_cookies_fail_empty_name';

const PromptSaveCookiesName = 'prompt_save_cookies_name',
  PromptHowToGetTheRequestUrl = 'prompt_how_to_get_the_request_url',
  PromptRequestExample = 'prompt_request_example';

const NotificationRequestTitle = 'notification_request_title',
  NotificationRequestMessage = 'notification_request_message';

const StringCookies = 'string_cookies',
  StringRequests = 'string_requests',
  StringUA = 'string_ua',
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