// ==UserScript==
// @name         oo.movie
// @namespace    (o˘◡˘o)
// @version      0.12.15
// @description  豆瓣净化 + VIP 视频解析
// @author       (o˘◡˘o)
// @include      *
// @require      https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js
// ==/UserScript==

/**
 * 如果能看到这段文字，说明你使用的是旧链接的脚本代码
 *
 * 请使用新链接更新此脚本
 *
 * https://gitee.com/ecruos/oo/raw/master/scripts/oo.movie.js
 */

var VERSION = '0.12.15';

// VIP视频解析 - 解析网址
var VIP_URLS = `

  VIP https://chinese-elements.com/v.html?zwx=

  挚爱 http://www.10yy.com.cn/?url=

  极速 http://jx.szwlss.cn/api/?url=

  猪蹄 https://jx.iztyy.com/svip/?url=

  宿命 http://api.sumingys.com/index.php?url=

  http://jx.52a.ink/?url=

  http://jx.98a.ink/?url=

  https://z1.m1907.cn/?jx=

  https://jiexi.071811.cc/jx2.php?url=

  17k http://17kyun.com/api.php?url=

  2020 https://api.2020jx.com/?url=

`;

// 豆瓣 - 搜索源
var DOUBAN_SOURCES = `

  奈菲 https://www.nfmovies.com/search.php?page=1&searchword=**

  云播 https://m.yunbtv.com/vodsearch/-------------.html?wd=**

  飞极速 http://fjisu.tv/search/**

  萌搜 https://www.msdm.moe/index.php/vod/search/page/1/wd/?wd=**

  樱花 http://m.yhdm.tv/search/**/

  1090 https://1090ys.com/?c=search&sort=addtime&order=desc&page=1&wd=**

  残月 http://ys.23yue.cn/seacher-**.html

  独播 https://www.duboku.net/vodsearch/-------------.html?wd=**

  拾伍 https://www.shiwutv.com/vodsearch/-------------.html?wd=**

  大全 http://01th.net/search/?wd=**

  影迷 https://www.yingmiwo.com/vodsearch.html?wd=**

  APP https://app.movie/index.php/vod/search.html?wd=**

  八兔 http://www.8tutv.com/search/?category=0&q=**

  vipku http://www.2n65.cn/index.php/vod/search.html?wd=**

`;

var screenWidth = window.screen.width;
var isMobile = screenWidth <= 600;

var DOUBAN_VIP_SOURCES = isMobile
  ? // 手机端 正版网站
    `

  爱奇艺 https://m.iqiyi.com/search.html?source=default&key=**

  腾讯 https://m.v.qq.com/search.html?act=0&keyWord=**

  哔哩哔哩 https://m.bilibili.com/search.html?keyword=**

  优酷 https://www.soku.com/m/y/video?q=**

  搜狐 https://m.tv.sohu.com/upload/h5/m/mso.html?key=**

  芒果 https://m.mgtv.com/so/?k=**

  乐视 http://m.le.com/search?wd=**

`
  : // 电脑端 正版网站
    `

  爱奇艺 https://so.iqiyi.com/so/q_**

  腾讯 https://v.qq.com/x/search/?q=**

  哔哩哔哩 https://search.bilibili.com/all?keyword=**

  优酷 https://so.youku.com/search_video/q_**

  搜狐 https://so.tv.sohu.com/mts?wd=**

  芒果 https://so.mgtv.com/so/k-**

  乐视 http://so.le.com/s?wd=**

`;

(function() {
  var isGM = !!window.GM;
  var isFY = !!window.fy_bridge_app;

  if (isGM && location.href.includes('doubleclick.net')) return;

  // 保证插件只加载一次
  var PLUGIN_ID = '(o˘◡˘o) One';
  if (window[PLUGIN_ID]) return;
  window[PLUGIN_ID] = VERSION;

  function ensureArray(arr) {
    return Array.isArray(arr) ? arr : arr.trim().split(/[\n\s]*\n+[\n\s]*/);
  }

  DOUBAN_SOURCES = ensureArray(DOUBAN_SOURCES);
  VIP_URLS = ensureArray(VIP_URLS).map(function(v) {
    return v.replace(/=http.+/g, '=');
  });
  DOUBAN_VIP_SOURCES = ensureArray(DOUBAN_VIP_SOURCES);

  DOUBAN_SOURCES = DOUBAN_VIP_SOURCES.concat(DOUBAN_SOURCES);

  function log() {
    var args = [];
    args.push(PLUGIN_ID + '    ');
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    console.log.apply(console, args);
  }

  log(
    '✔ Loaded',
    isGM ? 'isGM' : isFY ? 'isFY' : '',
    isMobile ? 'isMobile' : 'notMobile'
  );

  var href = location.href;

  function Is(regex) {
    return regex.test(href);
  }

  if (
    !Is(/=http/) &&
    Is(/\.le\.com/) &&
    !Is(/\.le\.com\/(ptv\/vplay\/|vplay_)/)
  )
    return;

  if (isFY) {
    // load dependencies
    eval(request('https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js'));
  }

  var $ = window.Zepto || window.jQuery || window.$;

  /**
   * Utils
   */
  function addStyle(styles, prefix) {
    if (prefix) {
      styles = prefixCssSelectors(styles, prefix);
    }
    var css = document.createElement('style');
    css.type = 'text/css';
    if (css.styleSheet) css.styleSheet.cssText = styles;
    // Support for IE
    else css.appendChild(document.createTextNode(styles)); // Support for the rest
    document.getElementsByTagName('head')[0].appendChild(css);
  }

  function prefixCssSelectors(rules, className) {
    var classLen = className.length,
      char,
      nextChar,
      isAt,
      isIn;

    // makes sure the className will not concatenate the selector
    className += ' ';

    // removes comments
    rules = rules.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '');

    // makes sure nextChar will not target a space
    rules = rules.replace(/}(\s*)@/g, '}@');
    rules = rules.replace(/}(\s*)}/g, '}}');

    for (var i = 0; i < rules.length - 2; i++) {
      char = rules[i];
      nextChar = rules[i + 1];

      if (char === '@') isAt = true;
      if (!isAt && char === '{') isIn = true;
      if (isIn && char === '}') isIn = false;

      if (
        !isIn &&
        nextChar !== '@' &&
        nextChar !== '}' &&
        (char === '}' ||
          char === ',' ||
          ((char === '{' || char === ';') && isAt))
      ) {
        rules = rules.slice(0, i + 1) + className + rules.slice(i + 1);
        i += classLen;
        isAt = false;
      }
    }

    // prefix the first select if it is not `@media` and if it is not yet prefixed
    if (rules.indexOf(className) !== 0 && rules.indexOf('@') !== 0)
      rules = className + rules;

    return rules;
  }

  function parseOneUrl(link, title) {
    var oLink = link.trim().split(/[\s@]+/);

    var url = oLink.pop();

    if (title) {
      url = url.replace('**', title);
    }

    var urlName =
      oLink.length > 0
        ? oLink.join(' ')
        : url
            .match(/\/\/(.+\.)?([^\/]+)\.\w+\//)[2]
            .replace(/^(\w)/, function(v) {
              return v.toUpperCase();
            });
    return [url, urlName];
  }

  function insertVipSource(selector, position = 'after') {
    if ($('.oo-vip-panel').length > 0) return;

    addStyle(
      `
.oo-vip {
  padding-bottom: .5em;
}

.oo-vip-panel {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px 0;
  font-size: 15px;
}

.oo-vip-title {
  padding: .5em;
  font-weight: bold;
  color: #257942;
}

.oo-vip-sign {
  padding: .5em;
  opacity: .25;
}

.oo-vip-list {
  padding: .5em;
  letter-spacing: 1px;
}

.oo-vip-list .oo-vip-item {
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  padding: .5em .75em .5em .75em;
  justify-content: center;
  white-space: nowrap;
  background-color: #eef6fc;
  color: #1d72aa;
  margin: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.25;
  font-weight: 600;
  text-decoration: none;
}
`
    );

    $(selector).eq(0)[position](`
<div class="oo-vip">
  <div class="oo-vip-panel">
    <div class="oo-vip-title">VIP 解析</div>
    <div class="oo-vip-sign">(o˘◡˘o)</div>
  </div>
  <div class="oo-vip-list">
${VIP_URLS.map(function(link) {
  var [url, urlName] = parseOneUrl(link);
  return (
    '<a class="oo-vip-item" target="_blank" href="' +
    (url + location.href) +
    '">' +
    urlName +
    '</a>'
  );
}).join('\n')}
  </div>
</div>
</div>
`);
  }

  if (Is(/(url|jx|zwx)=http/)) {
    // VIP 视频解析
    if (Is(/chinese-elements\.com/)) {
      log('VIP解析 chinese-elements.com');

      addStyle(`
.google-auto-placed {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}
      `);
    }
  } else if (
    Is(/m\.douban\.com\/search\/\?.*type=movie|search\.douban\.com\/movie\//)
  ) {
    log('豆瓣·电影·搜索');

    // TODO 搜索结果唯一时，自动跳转

    if (!Is(/m\.douban\.com\//)) {
      /**
       * PC端
       */
      addStyle(`
#dale_movie_subject_search_bottom,
#dale_movie_subject_search_top_right,
#dale_movie_subject_top_right,
#dale_movie_subject_bottom_super_banner,
#dale_movie_subject_middle_right {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

.oo-sources {
  padding-left: 1em;
}

.oo-sources a {
  display: inline-flex !important;
  align-items: center;
  border-radius: 4px;
  font-size: .75rem;
  height: 2em;
  justify-content: center;
  line-height: 1.5;
  padding-left: .75em;
  padding-right: .75em;
  white-space: nowrap;
  background-color: #effaf3;
  color: #257942;
  margin-top: .5em;
  margin-right: .5em;
}
`);

      $('#icp').html('(o˘◡˘o)');
      $('.gemzcp').each(function(i, el) {
        var title = $('.title', el).text();

        $(el).append(`<p class="oo-sources">
${DOUBAN_SOURCES.map(function(S) {
  var [url, urlName] = parseOneUrl(S);
  return (
    '<a target="_blank" href="' +
    url.replace('**', title) +
    '">' +
    urlName +
    '</a>'
  );
}).join('\n')}
</p>`);
      });

      return;
    }

    addStyle(`
#TalionNav,
.search-results-modules-name {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

.search-module {
  margin-top: 0;
}

.search-results img {
  width: 80px;
}

.search-results {
  padding-bottom: 10px;
}

.search-results li a {
  display: flex;
  align-items: center;
}

.search-results img {
  height: 100%;
  padding: 0;
  border: 2px solid;
  border-image: linear-gradient(to bottom, #2b68c4 0%,#cf2d6e 100%)1;
}

.oo-sources {
  padding-left: 1em;
}

.oo-sources a {
  display: inline-flex !important;
  align-items: center;
  border-radius: 4px;
  font-size: .75rem;
  height: 2em;
  justify-content: center;
  line-height: 1.5;
  padding-left: .75em;
  padding-right: .75em;
  white-space: nowrap;
  background-color: #effaf3;
  color: #257942;
  margin-top: .5em;
  margin-right: .5em;
}
`);

    $('#more-search').append('    (o˘◡˘o)');

    $('.subject-info').each(function(i, el) {
      var title = $('.subject-title', el).text();

      $(el).append(`<p class="oo-sources">
${DOUBAN_SOURCES.map(function(S) {
  var [url, urlName] = parseOneUrl(S);
  return (
    '<a target="_blank" href="' +
    url.replace('**', title) +
    '">' +
    urlName +
    '</a>'
  );
}).join('\n')}
</p>`);
    });
  } else if (
    Is(/m\.douban\.com\/movie\/subject\/|movie\.douban\.com\/subject\//)
  ) {
    log('豆瓣·电影·详情');

    if (!Is(/m\.douban\.com\//)) {
      /**
       * PC端
       */

      addStyle(`
#dale_movie_subject_search_bottom,
#dale_movie_subject_search_top_right,
#dale_movie_subject_top_right,
#dale_movie_subject_bottom_super_banner,
#dale_movie_subject_middle_right {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}
`);

      $('#icp').html('(o˘◡˘o)');

      var title = $('title')
        .text()
        .replace('(豆瓣)', '')
        .trim();

      $('#info').append(
        `
<span class="pl">在线观看：</span>
<span>
${DOUBAN_SOURCES.map(function(link) {
  var [url, urlName] = parseOneUrl(link, title);
  return '<span><a target="_blank" href="' + url + '">' + urlName + '</a>';
}).join(' / </span>')}
</span></span><br>
`
      );

      return;
    }

    addStyle(`
.score-write,
a[href*='to_app'],
a[href*='doubanapp'],
section + .center,
.bottom_ad_download,
.sub-vendor,
.to_pc,
.TalionNav-static,
.sub-detail .mark-movie,
.sub-detail .mark-tv,
.subject-banner,
.bottom_ad_download,
.cover-count {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

.sub-info .sub-cover {
  display: block !important;
}

.TalionNav-primary {
  position: relative !important;
}

.subject-comments,
.subject-reviews {
  margin-bottom: 0 !important;
}

.TalionNav .TalionNav-primary .search-box {
  width: 230px;
  flex: 230px 0 0;
  animation: none;
}

.sub-original-title {
  padding: 0.25em 0;
}

._V_sign {
  font-size: 0.85em;
  opacity: 0.25;
  text-align: center;
  padding-bottom: 1em;
}

._V_source, .sub-score + .sub-score {
  margin-top: 1.5em;
  color: #fff;
}

._V_source .sub-score .sub-content {
  display: block;
}

._V_source .sub-score a {
  padding: .25em .5em;
  line-height: 1.5;
  margin: 0 .15em;
  border: 1px solid rgba(255,255,255,0.2);
  font-size: 1.05em;
  font-weight: bold;
  letter-spacing: 1px;
  margin-top: .5em;
  display: inline-block;
  color: #fbb632;
  background: rgba(239, 238, 238, 0.05);
  border-radius: 4px;
}

#TalionNav {
  display: none;
}

#TalionNav .logo {
  background: none;
  font-size: 1em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: #dee2e6;
}

.search-box:not(.on-search) {
  opacity: 0.5;
}

#channel_tags {
  margin-bottom: 10px;
}

.subject-header-wrap .sub-detail {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
`);

    $(function() {
      var title = $('.sub-title')
        .text()
        .trim();

      $('.sub-cover').attr('href', '#');
      $('#subject-honor-root a').attr('href', '#');

      $('.movie-reviews .show-all').after(
        '<div class="_V_sign">豆瓣·改 (o˘◡˘o)</div>'
      );

      $('section + .center').each(function(i, el) {
        $(el).remove();
      });

      $('.subject-header-wrap').after($('#TalionNav'));

      $('#TalionNav').css('display', 'block');

      $('#TalionNav .logo').html(
        decodeURIComponent('(o%CB%98%E2%97%A1%CB%98o)')
      );

      $('.search-box').remove();
      $('.TalionNav-primary .logo').after(
        '<div class="search-box"><input class="search-input" type="search" placeholder="搜索"></div>'
      );

      $('.search-input')
        .on('focus', function() {
          $(this)
            .parent()
            .addClass('on-search');
        })
        .on('blur', function() {
          $(this)
            .parent()
            .removeClass('on-search');
        });

      $('.search-input').on('keyup', function(e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          location.href = '/search/?query=' + e.target.value + '&type=movie';
        }
      });

      $('.subject-header-wrap').append(
        `<div class="_V_source subject-mark">

<div class="sub-score">
  <div class="sub-trademark">
  在线观看
  </div>
  <div class="sub-content">
${DOUBAN_SOURCES.map(function(link) {
  var [url, urlName] = parseOneUrl(link, title);
  return '<a target="_blank" href="' + url + '">' + urlName + '</a>';
}).join('\n')}
  </div>
</div>

</div>`
      );

      function rgbToHex(rgb) {
        var color = rgb.toString().match(/\d+/g);
        if (color.length != 3) return rgb;

        var hex = '#';

        for (var i = 0; i < 3; i++) {
          hex += ('0' + Number(color[i]).toString(16)).slice(-2);
        }
        return hex;
      }

      function syncAppColor() {
        var style = $('#subject-header-container').attr('style');

        if (!style) {
          setTimeout(function() {
            syncAppColor();
          }, 100);
        } else {
          var mainColor = style.match(/:\s*([^;]+);?/)[1];
          try {
            window.fy_bridge_app.setAppBarColor(rgbToHex(mainColor));
          } catch (error) {
            console.error('setAppBarColor:', error);
          }
        }
      }

      if (isFY) {
        syncAppColor();
      }

      setTimeout(function() {
        $('.subject-intro .bd p').click();
      }, 1000);
    });
  } else if (Is(/m\.v\.qq\.com\/search\.html/)) {
    log('腾讯·搜索');

    addStyle(`
.tvp_app_bar {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}
`);
    $('.copyright').html('(o˘◡˘o)');
  } else if (Is(/v\.qq\.com\/(cover|play|x\/cover|x\/page)/)) {
    log('腾讯·详情');

    addStyle(`
.mod_source,
.video_function,
.mod_promotion,
#vip_privilege,
#vip_activity,
.U_bg_b,
.btn_open_v,
.btn_openapp,
#vip_header,
.btn_user_hd {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

#vip_title {
  padding-bottom: 0;
}

.mod_episodes_numbers.is-vip .item {
  width: auto;
  padding: 0 1em;
}

.U_html_bg .container {
  padding-bottom: 30px;
}
`);
    $(function() {
      insertVipSource('#vip_title, .U_box_bg_a, .player_headline');
    });
  } else if (Is(/m\.iqiyi\.com\/search\.html/)) {
    log('爱奇艺·搜索');

    addStyle(`
.btn-ticket,
.btn-yuyue,
.btn-download,
.m-iqyDown {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}
`);
    $('.m-footer').html('(o˘◡˘o)');
  } else if (Is(/\.iqiyi\.com\/(a_|v_|w_|adv)/)) {
    log('爱奇艺·详情');

    addStyle(`
.m-iqyDown,
.header-login + div,
.m-video-action,
div[name="m-vipRights"],
div[name="m-extendBar"],
.m-iqylink-diversion,
.m-iqylink-guide,
.c-openVip,
.c-score-btn,
.m-videoUser-spacing,
.m-pp-entrance {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

.page_play {
  padding-bottom: 0;
}

div[name="m-videoInfo"] {
  padding-top: 1em;
}

.m-box-items .oo-album-item {
  border-radius: .05rem;
  background-color: #e9ecef;
  color: #495057;
  padding: .5em 1em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: .25em;
  font-weight: bold;
}
`);
    $(function() {
      $('.m-footer').html('(o˘◡˘o)');

      insertVipSource('div[name="m-videoInfo"], #block-C');
    });
  } else if (Is(/m\.youku\.com\/a|m\.youku\.com\/v|v\.youku\.com\/v_/)) {
    log('优酷·详情');

    addStyle(`
.h5-detail-guide,
.h5-detail-ad,
.brief-btm,
.smartBannerBtn,
.cmt-user-action {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}
`);
    $(function() {
      $('.copyright').html('(o˘◡˘o)');

      insertVipSource('.h5-detail-info, .player-title');
    });
  } else if (Is(/\.mgtv\.com\/b\//)) {
    log('芒果TV·详情');

    addStyle(`
.ad-banner,
.video-area-bar,
.video-error .btn,
.m-vip-list,
.m-vip-list + div:not([class]),
.toapp,
.video-comment .ft,
.mg-app-swip {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}
`);
    $(function() {
      $('.mg-footer-copyright').html('(o˘◡˘o)');

      insertVipSource('.xuanji', 'before');
      insertVipSource('.v-panel-box');
    });
  } else if (Is(/m\.tv\.sohu\.com\/phone_play_film/)) {
    return (location.href = href.replace(
      'phone_play_film',
      `v${href.match(/vid=(\d+)/)[1]}.shtml`
    ));
  } else if (Is(/film\.sohu\.com\/album\/|tv\.sohu\.com\/v/)) {
    log('搜狐视频·详情');

    addStyle(`
.actv-banner,
.btn-xz-app,
.twinfo_iconwrap,
.btn-comment-app,
#ad_banner,
.advertise,
.main-ad-view-box,
.foot.sohu-swiper,
.app-star-vbox,
.app-guess-vbox,
.main-rec-view-box,
.app-qianfan-box,
.comment-empty-bg,
.copyinfo,
.ph-vbox {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

.comment-empty-txt {
  margin-bottom: 0;
}

.app-view-box + footer {
  padding: 0;
  opacity: 0.5;
}
`);
    $(function() {
      $('.links').html('(o˘◡˘o)');

      insertVipSource('.title-wrap, .videoInfo');
    });
  } else if (Is(/\.le\.com\/(ptv\/vplay\/|vplay_)/)) {
    log('乐视·详情');

    addStyle(`
.full_gdt_bits,
.gamePromotion,
.gamePromotionTxt,
#j-leappMore,
.lbzDaoliu,
.up-letv,
.le_briefIntro .Banner_01,
.video_block > .col_6 > [id],
.arkBox {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}
`);
    $(function() {
      insertVipSource('.introduction_box, .briefIntro_left .info_list');
    });
  } else if (isMobile && Is(/movie\.douban\.com\/tag\/#/)) {
    log('豆瓣·选影视');

    var num = 3;

    addStyle(
      prefixCssSelectors(
        `
.category {
  width: 100%;
  white-space: nowrap;
  overflow-x: auto;
}

.tags {
  margin-bottom: 1em;
}

.checkbox__input {
  vertical-align: text-top;
}

.tag-nav {
  margin: 0 auto;
  font-size: 12px;
}

.tag-nav .tabs, .tag-nav .check {
  display: flex;
  justify-content: space-around;
}

.tag-nav .tabs a {
  padding: 7.5px 5px 5px;
}

.tabs a:not(.tab-checked) {
  border: 1px solid #dfdfdf;
}

.tabs .tab-checked {
  border: 1px solid #258dcd!important;
}

.tab-checked:after {
  display: none;
}

.checkbox, .range {
  margin-right: 5px;
}

.check {
  float: none;
  margin-top: 5px;
}

.list-wp, .item .cover-wp {
  overflow: unset;
}

a img {
  padding: 2px;
  border-radius: 5px;
  background: linear-gradient(to bottom, #2b68c4 0%,#cf2d6e 100%);
}

a.item {
  width: ${parseInt(100 / num)}%;
  text-align: center;
}

a.item p {
  padding-right: 0;
}

a.item .cover-wp {
  height: auto;
  padding: 0 0.5em;
  display: flex;
  justify-content: center;
  align-items: center;
}

a.item .cover-wp:after, .poster:after {
  display: none;
}

a.item .pic img {
  width: 100%;
  height: ${parseInt((screenWidth * 4) / 3 / num)}px;
  max-width: 150px;
  object-fit: cover;
}

.tag-nav .range-dropdown {
  left: 0 !important;
  width: auto !important;
  right: 0 !important;
  top: -4em !important;
}

.more {
  margin: 0 1em .5em;
}
`,
        '.oo'
      ) +
        `
#app .article, .article.oo {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 6px;
  transition: all 1s;
}

.category::-webkit-scrollbar {
  width: 1px;
  height: 1px;
  background-color: rgba(223, 223, 223, 0.25);
}

.category::-webkit-scrollbar-track {
  background: transparent;
  border: 0px none #ffffff;
  border-radius: 50px;
}

.category::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 2.5px rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 0 2.5px rgba(0, 0, 0, 0.1);
  border-radius: 2.5px;
  background-color: rgba(223, 223, 223, 0.25);
  opacity: 0.7;
  transition: opacity ease-in-out 200ms;
}

.category::-webkit-scrollbar-thumb:hover {
  opacity: 1;
  background-color: rgba(223, 223, 223, 0.25);
}
`
    );
    $(function() {
      $('title').append(' - One');

      $('body').html($('#app .article').addClass('oo'));

      function bindScroll() {
        if (
          $(window).scrollTop() + $(window).height() >
          $(document).height() - 40
        ) {
          $(window).unbind('scroll');
          $('.more').click();
          // setTimeout(function() {
          //   $(window).scroll(bindScroll);
          // }, 1000);
        }
      }

      // Select the node that will be observed for mutations
      var targetNode = document.querySelector('.list-wp');

      // Options for the observer (which mutations to observe)
      var config = { attributes: true, childList: true };

      // Callback function to execute when mutations are observed
      var callback = function(mutationsList) {
        var isChildChanged = false;
        for (var mutation of mutationsList) {
          if (mutation.type == 'childList') {
            isChildChanged = true;
            // console.log('A child node has been added or removed.');
            // console.log(mutation);
            mutation.addedNodes.forEach(function(addedNode) {
              if (addedNode.classList.contains('item')) {
                addedNode.setAttribute(
                  'href',
                  addedNode
                    .getAttribute('href')
                    .replace('movie.douban.com', 'm.douban.com/movie')
                );
              }
            });
          }
          // else if (mutation.type == 'attributes') {
          //   console.log(
          //     'The ' + mutation.attributeName + ' attribute was modified.'
          //   );
          // }

          if (isChildChanged) {
            setTimeout(function() {
              $(window).scroll(bindScroll);
            }, 1500);
          }
        }
      };

      // Create an observer instance linked to the callback function
      var observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      observer.observe(targetNode, config);

      // stop observing
      // observer.disconnect();
    });
  } else if (Is(/\.bilibili\.com/)) {
    log('bilibili');

    // PC
    if (Is(/www\.bilibili\.com\/(anime|bangumi\/play|video)\//)) {
      var task = setInterval(function() {
        if ($('.media-cover img').length > 0) {
          insertVipSource('#media_module', 'before');
          clearInterval(task);
        }
      }, 500);
      return;
    }

    addStyle(`
.index__openAppBtn__src-commonComponent-topArea-,
.index__container__src-commonComponent-bottomOpenApp-,
.bili-app,
.recom-wrapper,
.b-footer,
.open-app-bar,
.open-app-float,
.more-review-wrapper,
.player-mask .mask {
  display: none !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

.player-mask img {
  filter: none !important;
}
`);

    $(function() {
      insertVipSource('.ep-list-pre-wrapper', 'before');
    });
  } else if (Is(/localhost|ecruos\.gitee\.io\/one/)) {
    log('One·主页');

    $(function() {
      localStorage.setItem('One.plugin.version', VERSION);
    });
  }
})();
