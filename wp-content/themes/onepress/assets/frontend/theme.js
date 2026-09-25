/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/frontend/inc/theme.js"
/*!***********************************!*\
  !*** ./src/frontend/inc/theme.js ***!
  \***********************************/
() {

var onepressIsMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function () {
    return onepressIsMobile.Android() || onepressIsMobile.BlackBerry() || onepressIsMobile.iOS() || onepressIsMobile.Opera() || onepressIsMobile.Windows();
  }
};
function preload_images(images, complete_callback) {
  if (onepress_js_settings.hero_disable_preload) {
    if (complete_callback) {
      complete_callback();
    }
  } else {
    var id = "_img_loading_" + new Date().getTime();
    jQuery("body").append('<div id="' + id + '"></div>');
    jQuery.each(images, function (index, src) {
      var img = jQuery("<img>");
      img.attr("alt", "");
      img.attr("class", "image__preload");
      img.css("display", "none");
      img.attr("src", src);
      jQuery("#" + id).append(img);
    });
    jQuery("#" + id).imagesLoaded(function () {
      if (complete_callback) {
        complete_callback();
      }
      setTimeout(function () {
        jQuery("#" + id).remove();
      }, 5000);
    });
  }
}
function _to_number(string) {
  if (typeof string === "number") {
    return string;
  }
  var n = string.match(/\d+$/);
  if (n) {
    return parseFloat(n[0]);
  } else {
    return 0;
  }
}
function _to_bool(v) {
  if (typeof v === "boolean") {
    return v;
  }
  if (typeof v === "number") {
    return v === 0 ? false : true;
  }
  if (typeof v === "string") {
    if (v === "true" || v === "1") {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

/**
 * skip-link-focus-fix.js
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://github.com/Automattic/OnePress/pull/136
 */
(function () {
  var is_webkit = navigator.userAgent.toLowerCase().indexOf("webkit") > -1,
    is_opera = navigator.userAgent.toLowerCase().indexOf("opera") > -1,
    is_ie = navigator.userAgent.toLowerCase().indexOf("msie") > -1;
  if ((is_webkit || is_opera || is_ie) && document.getElementById && window.addEventListener) {
    window.addEventListener("hashchange", function () {
      var id = location.hash.substring(1),
        element;
      if (!/^[A-z0-9_-]+$/.test(id)) {
        return;
      }
      element = document.getElementById(id);
      if (element) {
        if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
          element.tabIndex = -1;
        }
        element.focus();
      }
    }, false);
  }
})();
(function () {
  if (onepressIsMobile.any()) {
    /**
     * https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
     */
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    let vw = window.innerWidth * 0.01;
    // Then we set the value in the --vh, --vw custom property to the root of the document
    document.documentElement.style.setProperty("--vh", vh + "px");
    document.documentElement.style.setProperty("--vw", vw + "px");
    window.addEventListener("resize", function () {
      let vh = window.innerHeight * 0.01;
      let vw = window.innerWidth * 0.01;
      document.documentElement.style.setProperty("--vh", vh + "px");
      document.documentElement.style.setProperty("--vw", vw + "px");
    });
  }
})();
function isElementInViewport(el) {
  // Special bonus for those using jQuery
  if (typeof jQuery === "function" && el instanceof jQuery) {
    el = el[0];
  }
  var rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ && rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */;
}

/**
 * Sticky header when scroll.
 */
jQuery(function ($) {
  var $window = $(window);
  var $document = $(document);
  $(document).on("mouseenter resize", ".sub-menu .menu-item-has-children", function () {
    var submenuEl = $(this).find(".sub-menu");
    if (submenuEl.length > 0 && !isElementInViewport(submenuEl)) {
      submenuEl.css({
        right: "100%",
        left: "auto"
      });
    }
  });
  var getAdminBarHeight = function () {
    var h = 0;
    if ($("#wpadminbar").length) {
      if ($("#wpadminbar").css("position") === "fixed") {
        h = $("#wpadminbar").height();
      }
    }
    return h;
  };
  var stickyHeaders = function () {
    var $stickies;
    var lastScrollTop = 0;
    var setData = function (stickies, addWrap) {
      var top = 0;
      if (typeof addWrap === "undefined") {
        addWrap = true;
      }
      $stickies = stickies.each(function () {
        var $thisSticky = $(this);
        var p = $thisSticky.parent();
        if (!p.hasClass("followWrap")) {
          if (addWrap) {
            $thisSticky.wrap('<div class="followWrap" />');
          }
        }
        $thisSticky.parent().removeAttr("style");
        $thisSticky.parent().height($thisSticky.height());
      });
    };
    var load = function (stickies) {
      if (typeof stickies === "object" && stickies instanceof jQuery && stickies.length > 0) {
        setData(stickies);
        $window.on("scroll", function () {
          _whenScrolling();
        });
        $window.on("resize", function () {
          setData(stickies, false);
          stickies.each(function () {
            $(this).removeClass("fixed").removeAttr("style");
          });
          _whenScrolling();
        });
        $document.on("hero_ready", function () {
          $(".followWrap").removeAttr("style");
          setTimeout(function () {
            $(".followWrap").removeAttr("style");
            setData(stickies, false);
            _whenScrolling();
          }, 500);
        });
      }
    };
    var _whenScrolling = function () {
      var top = 0;
      top = getAdminBarHeight();
      var scrollTop = $window.scrollTop();
      $stickies.each(function (i) {
        var $thisSticky = $(this),
          $stickyPosition = $thisSticky.parent().offset().top;
        if (scrollTop === 0) {
          $thisSticky.addClass("no-scroll");
        }
        if ($stickyPosition - top <= scrollTop) {
          if (scrollTop > 0) {
            $thisSticky.removeClass("no-scroll");
          }
          $thisSticky.addClass("header-fixed");
          $thisSticky.css("top", top);
        } else {
          $thisSticky.removeClass("header-fixed").removeAttr("style").addClass("no-scroll");
        }
      });
    };
    return {
      load: load
    };
  }();
  stickyHeaders.load($("#masthead.is-sticky"));
  // When Header Panel rendered by customizer
  $document.on("header_view_changed", function () {
    stickyHeaders.load($("#masthead.is-sticky"));
  });

  /*
   * Nav Menu & element actions
   *
   * Smooth scroll for navigation and other elements
   */
  var mobile_max_width = 1140; // Media max width for mobile
  var main_navigation = jQuery(".main-navigation .onepress-menu");
  var header = document.getElementById("masthead");
  if (header) {
    var noSticky = header.classList.contains("no-sticky");
  }
  var setNavTop = function () {
    var offset = header.getBoundingClientRect();
    var top = offset.x + offset.height - 1;
    main_navigation.css({
      top: top
    });
  };

  /**
   * Get mobile navigation height.
   *
   * @return number
   */
  var getNavHeight = function (fitWindow) {
    if (typeof fitWindow === "undefined") {
      fitWindow = true;
    }
    if (fitWindow) {
      var offset = header.getBoundingClientRect();
      var h = $(window).height() - (offset.x + offset.height) + 1;
      return h;
    } else {
      main_navigation.css("height", "auto");
      var navOffset = main_navigation[0].getBoundingClientRect();
      main_navigation.css("height", 0);
      return navOffset.height;
    }
  };

  /**
   * Initialise Menu Toggle
   *
   * @since 0.0.1
   * @since 2.2.1
   */
  $document.on("click", "#nav-toggle", function (event) {
    event.preventDefault();
    jQuery("#nav-toggle").toggleClass("nav-is-visible");
    jQuery(".header-widget").toggleClass("header-widget-mobile");
    main_navigation.stop();
    // Open menu mobile.
    if (!main_navigation.hasClass("onepress-menu-mobile")) {
      main_navigation.addClass("onepress-menu-mobile");
      $("body").addClass("onepress-menu-mobile-opening");
      setNavTop();
      var h = getNavHeight(!noSticky);
      if (isNaN(h)) {
        // when IE 11 & Edge return h is NaN.
        h = $(window).height();
      }
      main_navigation.animate({
        height: h
      }, 300, function () {
        // Animation complete.
        if (noSticky) {
          main_navigation.css({
            "min-height": h,
            height: "auto"
          });
        }
      });
    } else {
      main_navigation.css({
        height: main_navigation.height(),
        "min-height": 0,
        overflow: "hidden"
      });
      setTimeout(function () {
        main_navigation.animate({
          height: 0
        }, 300, function () {
          main_navigation.removeAttr("style");
          main_navigation.removeClass("onepress-menu-mobile");
          $("body").removeClass("onepress-menu-mobile-opening");
        });
      }, 40);
    }
  });

  /**
   * Fix nav height when touch move on mobile.
   *
   * @since 2.2.1
   */
  if (!noSticky && onepressIsMobile.any()) {
    $(document).on("scroll", function () {
      if (main_navigation.hasClass("onepress-menu-mobile")) {
        var newViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var offset = header.getBoundingClientRect();
        var top = offset.x + offset.height - 1;
        var h = newViewportHeight - top + 1;
        main_navigation.css({
          height: h,
          top: top
        });
      }
    });
  }
  function autoMenuAlign() {
    const ww = $(window).width();
    const isMobile = ww <= mobile_max_width;
    const header = $("#masthead > .container");
    const headerRect = header.length ? header[0].getBoundingClientRect() : {};
    $("#site-navigation  .onepress-menu > li").each(function () {
      const li = $(this);
      const sub = $("> .sub-menu", li);
      if (isMobile) {
        sub.removeAttr("style");
        return;
      }
      if (sub.length) {
        const liRect = li[0].getBoundingClientRect();
        const subRect = sub[0].getBoundingClientRect();
        if (headerRect.right < liRect.left + subRect.width) {
          li.addClass("sub-li-r");
          sub.addClass("sub-ul-r");
          const diff = headerRect.right - (liRect.left + liRect.width);
          sub.css("right", `-${diff}px`);
        }
      }
    });
  }
  autoMenuAlign();
  let timeOutResize = false;
  $(window).on('resize', function () {
    if (timeOutResize) {
      clearTimeout(timeOutResize);
    }
    timeOutResize = setTimeout(() => {
      if (main_navigation.hasClass("onepress-menu-mobile") && $(window).width() <= mobile_max_width) {
        if (!noSticky) {
          main_navigation.css({
            height: getNavHeight(),
            overflow: "auto"
          });
        }
      } else {
        main_navigation.removeAttr("style");
        main_navigation.removeClass("onepress-menu-mobile");
        jQuery("#nav-toggle").removeClass("nav-is-visible");
      }
      autoMenuAlign();
    }, 500);
  });
  jQuery(".onepress-menu li.menu-item-has-children, .onepress-menu li.page_item_has_children").each(function () {
    jQuery(this).prepend('<div class="nav-toggle-subarrow"><i class="fa fa-angle-down"></i></div>');
  });
  $document.on("click", ".nav-toggle-subarrow, .nav-toggle-subarrow .nav-toggle-subarrow", function () {
    const el = jQuery(this);
    const p = el.parent();
    p.removeAttr("style");
    p.toggleClass("nav-toggle-dropdown");
  });

  // Get the header height and wpadminbar height if enable.
  var h;
  window.current_nav_item = false;
  if (onepress_js_settings.onepress_disable_sticky_header !== "1") {
    h = jQuery("#wpadminbar").height() + jQuery(".site-header").height();
  } else {
    h = jQuery("#wpadminbar").height();
  }

  /**
   *  Navigation click to section.
   *  @updated 2.3.0
   */
  jQuery('#site-navigation li a[href*="#"]').on("click", function (event) {
    let url = new URL(this.href);
    if (url.origin + url.pathname === window.location.origin + window.location.pathname) {
      let $el = jQuery(this.hash);
      // if in mobile mod.
      if (jQuery(".onepress-menu").hasClass("onepress-menu-mobile")) {
        jQuery("#nav-toggle").trigger("click");
      }
      if ($el.length) {
        event.preventDefault();
        window.history.pushState({}, null, url.href);
        smoothScroll($el);
      }
    }
  });
  function setNavActive(currentNode) {
    if (currentNode) {
      currentNode = currentNode.replace("#", "");
      if (currentNode) jQuery("#site-navigation li").removeClass("onepress-current-item");
      if (currentNode) {
        jQuery("#site-navigation li").find('a[href$="#' + currentNode + '"]').parent().addClass("onepress-current-item");
      }
    }
  }
  function inViewPort($element, offset_top) {
    if (!offset_top) {
      offset_top = 0;
    }
    var view_port_top = jQuery(window).scrollTop();
    if ($("#wpadminbar").length > 0) {
      view_port_top -= $("#wpadminbar").outerHeight() - 1;
      offset_top += $("#wpadminbar").outerHeight() - 1;
    }
    var view_port_h = $("body").outerHeight();
    var el_top = $element.offset().top;
    var eh_h = $element.height();
    var el_bot = el_top + eh_h;
    var view_port_bot = view_port_top + view_port_h;
    var all_height = $("body")[0].scrollHeight;
    var max_top = all_height - view_port_h;
    var in_view_port = false;
    // If scroll maximum
    if (view_port_top >= max_top) {
      if (el_top < view_port_top && el_top > view_port_bot || el_top > view_port_top && el_bot < view_port_top) {
        in_view_port = true;
      }
    } else {
      if (el_top <= view_port_top + offset_top) {
        //if ( eh_bot > view_port_top &&  eh_bot < view_port_bot ) {
        if (el_bot > view_port_top) {
          in_view_port = true;
        }
      }
    }
    return in_view_port;
  }

  // Add active class to menu when scroll to active section.
  var _scroll_top = $window.scrollTop();
  jQuery(window).on('scroll', function () {
    var currentNode = null;
    if (!window.current_nav_item) {
      var current_top = $window.scrollTop();
      var adminBarHeight = jQuery("#wpadminbar").length > 0 ? jQuery("#wpadminbar").height() : 0;
      if (onepress_js_settings.onepress_disable_sticky_header !== "1") {
        h = adminBarHeight + jQuery(".site-header").height();
      } else {
        h = adminBarHeight;
      }
      if (_scroll_top < current_top) {
        jQuery("section").each(function (index) {
          var section = jQuery(this);
          var currentId = section.attr("id") || "";
          var in_vp = inViewPort(section, h + 10);
          if (in_vp) {
            currentNode = currentId;
          }
        });
      } else {
        var ns = jQuery("section").length;
        for (var i = ns - 1; i >= 0; i--) {
          var section = jQuery("section").eq(i);
          var currentId = section.attr("id") || "";
          var in_vp = inViewPort(section, h + 10);
          if (in_vp) {
            currentNode = currentId;
          }
        }
      }
      _scroll_top = current_top;
    } else {
      currentNode = window.current_nav_item.replace("#", "");
    }
    setNavActive(currentNode);
  });

  // Move to the right section on page load.
  jQuery(window).on("load", function () {
    var urlCurrent = location.hash;
    if (jQuery(urlCurrent).length > 0) {
      smoothScroll(urlCurrent);
    }
  });

  // Other scroll to elements
  jQuery('.hero-slideshow-wrapper a[href*="#"]:not([href="#"]), .parallax-content a[href*="#"]:not([href="#"]), .back-to-top').on("click", function (event) {
    event.preventDefault();
    smoothScroll(jQuery(this.hash));
  });

  // Smooth scroll animation
  function smoothScroll(element) {
    if (element.length <= 0) {
      return false;
    }
    jQuery("html, body").animate({
      scrollTop: jQuery(element).offset().top - h + "px"
    }, {
      duration: 800,
      easing: "swing",
      complete: function () {
        window.current_nav_item = false;
      }
    });
  }
  if (onepress_js_settings.is_home) {
    // custom-logo-link
    jQuery(".site-branding .site-brand-inner").on("click", function (e) {
      e.preventDefault();
      jQuery("html, body").animate({
        scrollTop: "0px"
      }, {
        duration: 300,
        easing: "swing"
      });
    });
  }
  if (onepressIsMobile.any()) {
    jQuery("body").addClass("body-mobile").removeClass("body-desktop");
  } else {
    jQuery("body").addClass("body-desktop").removeClass("body-mobile");
  }

  /**
   * Reveal Animations When Scrolling
   */
  if (onepress_js_settings.onepress_disable_animation !== "1") {
    var wow = new WOW({
      offset: 50,
      mobile: false,
      live: false
    });
    wow.init();
  }
  var text_rotator = function () {
    /**
     * Text rotator
     */
    jQuery(".js-rotating").Morphext({
      // The [in] animation type. Refer to Animate.css for a list of available animations.
      animation: onepress_js_settings.hero_animation,
      // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
      separator: "|",
      // The delay between the changing of each phrase in milliseconds.
      speed: parseInt(onepress_js_settings.hero_speed, 10),
      complete: function () {
        // Called after the entrance animation is executed.
      }
    });
  };
  text_rotator();
  $document.on("header_view_changed", function () {
    text_rotator();
  });

  /**
   * Responsive Videos
   */
  jQuery(".site-content").fitVids({
    ignore: ".wp-block-embed iframe, .wp-block-embed object"
  });

  /**
   * Video lightbox (YouTube/Vimeo via href; self-hosted files via data-html + lg-html5 — see section-videolightbox.php)
   */

  if ($.fn.lightGallery) {
    $(".videolightbox-popup").lightGallery({
      selector: "a"
    });
  }

  // Counter Up
  $(".counter").counterUp({
    delay: 10,
    time: 1000
  });

  /**
   * Center vertical align for navigation.
   */
  if (onepress_js_settings.onepress_vertical_align_menu === "1") {
    var header_height = jQuery(".site-header").height();
    jQuery(".site-header .onepress-menu").css("line-height", header_height + "px");
  }

  /**
   * Section: Hero Full Screen Slideshow
   */
  function hero_full_screen(no_trigger) {
    if ($(".hero-slideshow-fullscreen").length > 0) {
      var wh = $window.height();
      var top = getAdminBarHeight();
      var $header = jQuery("#masthead");
      var is_transparent = $header.hasClass("is-t");
      var headerH;
      if (is_transparent) {
        headerH = 0;
      } else {
        headerH = $header.height();
      }
      headerH += top;
      jQuery(".hero-slideshow-fullscreen").css("height", wh - headerH + 1 + "px");
      if (typeof no_trigger === "undefined" || !no_trigger) {
        $document.trigger("hero_ready");
      }
    }
  }
  $window.on("resize", function () {
    hero_full_screen();
  });
  hero_full_screen();
  $document.on("header_view_changed", function () {
    hero_full_screen();
  });
  $document.on("hero_ready", function () {
    hero_full_screen(true);
  });

  /**
   * Hero sliders
   */
  var heroSliders = function () {
    if ($("#parallax-hero").length <= 0) {
      jQuery(".hero-slideshow-wrapper").each(function () {
        var hero = $(this);
        if (hero.hasClass("video-hero")) {
          return;
        }
        var images = hero.data("images") || false;
        if (typeof images === "string") {
          images = JSON.parse(images);
        }
        if (images) {
          preload_images(images, function () {
            hero.backstretch(images, {
              fade: _to_number(onepress_js_settings.hero_fade),
              duration: _to_number(onepress_js_settings.hero_duration)
            });
            //
            hero.addClass("loaded");
            hero.removeClass("loading");
            setTimeout(function () {
              hero.find(".slider-spinner").remove();
            }, 600);
          });
        } else {
          hero.addClass("loaded");
          hero.removeClass("loading");
          hero.find(".slider-spinner").remove();
        }
      });
    }
  };
  heroSliders();
  $document.on("header_view_changed", function () {
    heroSliders();
  });

  // Parallax hero
  $(".parallax-hero").each(function () {
    var hero = $(this);
    hero.addClass("loading");
    var bg = true;
    if (hero.find("img").length > 0) {
      bg = false;
    }
    $(".parallax-bg", hero).imagesLoaded({
      background: bg
    }, function () {
      hero.find(".hero-slideshow-wrapper").addClass("loaded");
      hero.removeClass("loading");
      setTimeout(function () {
        hero.find(".hero-slideshow-wrapper").find(".slider-spinner").remove();
      }, 600);
    }).fail(function (instance) {
      hero.removeClass("loading");
      hero.find(".hero-slideshow-wrapper").addClass("loaded");
      hero.find(".hero-slideshow-wrapper").find(".slider-spinner").remove();
    });
  });
  $(".section-parallax").each(function () {
    var hero = $(this);
    var bg = true;
    if (hero.find("img").length > 0) {
      bg = false;
    }
    $(".parallax-bg", hero).imagesLoaded({
      background: bg
    }, function () {}).fail(function (instance) {});
  });

  // Trigger when site load
  setTimeout(function () {
    $(window).trigger("scroll");
  }, 500);

  /**
   * Gallery
   */
  function onepress_gallery_init($context) {
    // justified
    if ($.fn.justifiedGallery) {
      $(".gallery-justified", $context).imagesLoaded(function () {
        $(".gallery-justified", $context).each(function () {
          var margin = $(this).attr("data-spacing") || 20;
          var row_height = $(this).attr("data-row-height") || 120;
          margin = _to_number(margin);
          row_height = _to_number(row_height);
          $(this).justifiedGallery({
            rowHeight: row_height,
            margins: margin,
            selector: "a, div:not(.spinner), .inner"
          });
        });
      });
    }
    var is_rtl = onepress_js_settings.is_rtl;

    // Slider
    if ($.fn.owlCarousel) {
      $(".gallery-slider", $context).owlCarousel({
        items: 1,
        smartSpeed: 200,
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
        nav: true,
        navText: ["<i class='lg-icon'></i>", "<i class='lg-icon'></i>"],
        autoHeight: true,
        rtl: Number(is_rtl) !== 0,
        dots: false
      });
      $(".gallery-carousel", $context).each(function () {
        var n = $(this).attr("data-col") || 5;
        n = _to_number(n);
        if (n <= 0) {
          n = 5;
        }
        $(this).owlCarousel({
          items: n,
          responsive: {
            0: {
              items: 2
            },
            768: {
              items: n > 2 ? 2 : n
            },
            979: {
              items: n > 3 ? 3 : n
            },
            1199: {
              items: n
            }
          },
          rtl: Number(is_rtl) !== 0,
          navSpeed: 800,
          autoplaySpeed: 4000,
          autoplayHoverPause: true,
          nav: true,
          navText: ["<i class='lg-icon'></i>", "<i class='lg-icon'></i>"],
          dots: false
        });
      });
    }
    function isotope_init() {
      if ($.fn.isotope) {
        $(".gallery-masonry", $context).each(function () {
          var m = $(this);
          var gutter = m.attr("data-gutter") || 10;
          var columns = m.attr("data-col") || 5;
          gutter = _to_number(gutter);
          columns = _to_number(columns);
          var w = $(window).width();
          if (w <= 940) {
            columns = columns > 2 ? columns - 1 : columns;
          }
          if (w <= 720) {
            columns = columns > 3 ? 3 : columns;
          }
          if (w <= 576) {
            columns = columns > 2 ? 2 : columns;
          }

          //gutter = gutter / 2;
          // m.parent().css({'margin-left': -gutter, 'margin-right': -gutter});
          m.find(".g-item").css({
            width: 100 / columns + "%",
            float: "left",
            padding: 0
          });
          // m.find('.g-item .inner').css({'padding': gutter / 2});
          m.isotope({
            // options
            itemSelector: ".g-item",
            percentPosition: true,
            masonry: {
              columnWidth: ".inner"
            }
          });
        });
      }
    }
    $(".gallery-masonry", $context).imagesLoaded(function () {
      isotope_init();
    });
    $(window).on("resize", function () {
      isotope_init();
    });
    if ($.fn.lightGallery) {
      var wrap_tag = $(".enable-lightbox", $context).find(".g-item").first();
      var tag_selector = "a";
      if (wrap_tag.is("div")) {
        tag_selector = "div";
      }
      $(".enable-lightbox", $context).lightGallery({
        mode: "lg-fade",
        selector: tag_selector
        //cssEasing : 'cubic-bezier(0.25, 0, 0.25, 1)'
      });
    }
  }
  onepress_gallery_init($(".gallery-content"));
  if ($.fn.jarallax) {
    jQuery(".jarallax").each(function () {
      var $this = jQuery(this);
      var speed = $this.attr("data-speed") || 0.5;
      var speed = parseFloat(speed);
      if (speed > 0) {
        $this.jarallax({
          speed: speed
        });
      }
    });
  }
  if ("undefined" !== typeof wp && wp.customize && wp.customize.selectiveRefresh) {
    wp.customize.selectiveRefresh.bind("partial-content-rendered", function (placement) {
      if (placement.partial.id === "section-gallery") {
        onepress_gallery_init(placement.container.find(".gallery-content"));

        // Trigger resize to make other sections work.
        $(window).trigger("resize");
      }
    });
  }
});

/***/ },

/***/ "./src/frontend/libs/FitVids.js"
/*!**************************************!*\
  !*** ./src/frontend/libs/FitVids.js ***!
  \**************************************/
() {

/*jshint browser:true */
/*!
 * FitVids 1.1
 *
 * Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
 * Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
 * Released under the WTFPL license - http://sam.zoy.org/wtfpl/
 *
 */

(function ($) {
  "use strict";

  $.fn.fitVids = function (options) {
    var settings = {
      customSelector: null,
      ignore: null
    };
    if (!document.getElementById("fit-vids-style")) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName("head")[0];
      var css = ".fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}";
      var div = document.createElement("div");
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + "</style>";
      head.appendChild(div.childNodes[1]);
    }
    if (options) {
      $.extend(settings, options);
    }
    return this.each(function () {
      var selectors = ['iframe[src*="player.vimeo.com"]', 'iframe[src*="youtube.com"]', 'iframe[src*="youtube-nocookie.com"]', 'iframe[src*="kickstarter.com"][src*="video.html"]', "object", "embed"];
      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }
      var ignoreList = ".fitvidsignore";
      if (settings.ignore) {
        ignoreList = ignoreList + ", " + settings.ignore;
      }
      var $allVideos = $(this).find(selectors.join(","));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function () {
        var $this = $(this);
        if ($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === "embed" && $this.parent("object").length || $this.parent(".fluid-width-video-wrapper").length) {
          return;
        }
        if (!$this.css("height") && !$this.css("width") && (isNaN($this.attr("height")) || isNaN($this.attr("width")))) {
          $this.attr("height", 9);
          $this.attr("width", 16);
        }
        var height = this.tagName.toLowerCase() === "object" || $this.attr("height") && !isNaN(parseInt($this.attr("height"), 10)) ? parseInt($this.attr("height"), 10) : $this.height(),
          width = !isNaN(parseInt($this.attr("width"), 10)) ? parseInt($this.attr("width"), 10) : $this.width(),
          aspectRatio = height / width;
        if (!$this.attr("name")) {
          var videoName = "fitvid" + $.fn.fitVids._count;
          $this.attr("name", videoName);
          $.fn.fitVids._count++;
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", aspectRatio * 100 + "%");
        $this.removeAttr("height").removeAttr("width");
      });
    });
  };

  // Internal counter for unique video names.
  $.fn.fitVids._count = 0;

  // Works with either jQuery or Zepto
})(window.jQuery || window.Zepto);

/***/ },

/***/ "./src/frontend/libs/Morphext/morphext.js"
/*!************************************************!*\
  !*** ./src/frontend/libs/Morphext/morphext.js ***!
  \************************************************/
() {

/*!
 * Morphext - Text Rotating Plugin for jQuery
 * https://github.com/MrSaints/Morphext
 *
 * Built on jQuery Boilerplate
 * http://jqueryboilerplate.com/
 *
 * Copyright 2014 Ian Lai and other contributors
 * Released under the MIT license
 * http://ian.mit-license.org/
 */

/*eslint-env browser */
/*global jQuery:false */
/*eslint-disable no-underscore-dangle */

(function ($) {
  "use strict";

  var pluginName = "Morphext",
    defaults = {
      animation: "bounceIn",
      separator: ",",
      speed: 2000,
      complete: $.noop
    };
  function Plugin(element, options) {
    this.element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._init();
  }
  Plugin.prototype = {
    _init: function () {
      var $that = this;
      this.phrases = [];
      this.element.addClass("morphext");

      // OnePress 2.4.1: read via `.html()` instead of `.text()` so HTML
      // tags inside the rotating block (e.g. `<strong>`, `<em>`, `<a>`)
      // are preserved as phrase content. The animate() step below already
      // writes back via `innerHTML`, so the markup round-trips cleanly.
      // Sanitisation is the caller's responsibility — for OnePress the
      // hero text field runs through `wp_kses_post` server-side.
      $.each(this.element.html().split(this.settings.separator), function (key, value) {
        $that.phrases.push($.trim(value));
      });
      this.index = -1;
      this.animate();
      this.start();
    },
    animate: function () {
      this.index = ++this.index % this.phrases.length;
      this.element[0].innerHTML = "<span class=\"animated " + this.settings.animation + "\">" + this.phrases[this.index] + "</span>";
      if ($.isFunction(this.settings.complete)) {
        this.settings.complete.call(this);
      }
    },
    start: function () {
      var $that = this;
      this._interval = setInterval(function () {
        $that.animate();
      }, this.settings.speed);
    },
    stop: function () {
      this._interval = clearInterval(this._interval);
    }
  };
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery);

/***/ },

/***/ "./src/frontend/libs/bootstrap/bootstrap.min.js"
/*!******************************************************!*\
  !*** ./src/frontend/libs/bootstrap/bootstrap.min.js ***!
  \******************************************************/
() {

/*!
 * Bootstrap v4.0.0-alpha.6 (https://getbootstrap.com)
 * Copyright 2011-2017 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if ("undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");
+function (t) {
  var e = t.fn.jquery.split(" ")[0].split(".");
  if (e[0] < 2 && e[1] < 9 || 1 == e[0] && 9 == e[1] && e[2] < 1 || e[0] >= 4) throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0");
}(jQuery), +function () {
  function t(t, e) {
    if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return !e || "object" != typeof e && "function" != typeof e ? t : e;
  }
  function e(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + typeof e);
    t.prototype = Object.create(e && e.prototype, {
      constructor: {
        value: t,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e);
  }
  function n(t, e) {
    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
  }
  var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
      return typeof t;
    } : function (t) {
      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
    },
    o = function () {
      function t(t, e) {
        for (var n = 0; n < e.length; n++) {
          var i = e[n];
          i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, i.key, i);
        }
      }
      return function (e, n, i) {
        return n && t(e.prototype, n), i && t(e, i), e;
      };
    }(),
    r = function (t) {
      function e(t) {
        return {}.toString.call(t).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      }
      function n(t) {
        return (t[0] || t).nodeType;
      }
      function i() {
        return {
          bindType: a.end,
          delegateType: a.end,
          handle: function (e) {
            if (t(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
          }
        };
      }
      function o() {
        if (window.QUnit) return !1;
        var t = document.createElement("bootstrap");
        for (var e in h) if (void 0 !== t.style[e]) return {
          end: h[e]
        };
        return !1;
      }
      function r(e) {
        var n = this,
          i = !1;
        return t(this).one(c.TRANSITION_END, function () {
          i = !0;
        }), setTimeout(function () {
          i || c.triggerTransitionEnd(n);
        }, e), this;
      }
      function s() {
        a = o(), t.fn.emulateTransitionEnd = r, c.supportsTransitionEnd() && (t.event.special[c.TRANSITION_END] = i());
      }
      var a = !1,
        l = 1e6,
        h = {
          WebkitTransition: "webkitTransitionEnd",
          MozTransition: "transitionend",
          OTransition: "oTransitionEnd otransitionend",
          transition: "transitionend"
        },
        c = {
          TRANSITION_END: "bsTransitionEnd",
          getUID: function (t) {
            do t += ~~(Math.random() * l); while (document.getElementById(t));
            return t;
          },
          getSelectorFromElement: function (t) {
            var e = t.getAttribute("data-target");
            return e || (e = t.getAttribute("href") || "", e = /^#[a-z]/i.test(e) ? e : null), e;
          },
          reflow: function (t) {
            return t.offsetHeight;
          },
          triggerTransitionEnd: function (e) {
            t(e).trigger(a.end);
          },
          supportsTransitionEnd: function () {
            return Boolean(a);
          },
          typeCheckConfig: function (t, i, o) {
            for (var r in o) if (o.hasOwnProperty(r)) {
              var s = o[r],
                a = i[r],
                l = a && n(a) ? "element" : e(a);
              if (!new RegExp(s).test(l)) throw new Error(t.toUpperCase() + ": " + ('Option "' + r + '" provided type "' + l + '" ') + ('but expected type "' + s + '".'));
            }
          }
        };
      return s(), c;
    }(jQuery),
    s = (function (t) {
      var e = "alert",
        i = "4.0.0-alpha.6",
        s = "bs.alert",
        a = "." + s,
        l = ".data-api",
        h = t.fn[e],
        c = 150,
        u = {
          DISMISS: '[data-dismiss="alert"]'
        },
        d = {
          CLOSE: "close" + a,
          CLOSED: "closed" + a,
          CLICK_DATA_API: "click" + a + l
        },
        f = {
          ALERT: "alert",
          FADE: "fade",
          SHOW: "show"
        },
        _ = function () {
          function e(t) {
            n(this, e), this._element = t;
          }
          return e.prototype.close = function (t) {
            t = t || this._element;
            var e = this._getRootElement(t),
              n = this._triggerCloseEvent(e);
            n.isDefaultPrevented() || this._removeElement(e);
          }, e.prototype.dispose = function () {
            t.removeData(this._element, s), this._element = null;
          }, e.prototype._getRootElement = function (e) {
            var n = r.getSelectorFromElement(e),
              i = !1;
            return n && (i = t(n)[0]), i || (i = t(e).closest("." + f.ALERT)[0]), i;
          }, e.prototype._triggerCloseEvent = function (e) {
            var n = t.Event(d.CLOSE);
            return t(e).trigger(n), n;
          }, e.prototype._removeElement = function (e) {
            var n = this;
            return t(e).removeClass(f.SHOW), r.supportsTransitionEnd() && t(e).hasClass(f.FADE) ? void t(e).one(r.TRANSITION_END, function (t) {
              return n._destroyElement(e, t);
            }).emulateTransitionEnd(c) : void this._destroyElement(e);
          }, e.prototype._destroyElement = function (e) {
            t(e).detach().trigger(d.CLOSED).remove();
          }, e._jQueryInterface = function (n) {
            return this.each(function () {
              var i = t(this),
                o = i.data(s);
              o || (o = new e(this), i.data(s, o)), "close" === n && o[n](this);
            });
          }, e._handleDismiss = function (t) {
            return function (e) {
              e && e.preventDefault(), t.close(this);
            };
          }, o(e, null, [{
            key: "VERSION",
            get: function () {
              return i;
            }
          }]), e;
        }();
      return t(document).on(d.CLICK_DATA_API, u.DISMISS, _._handleDismiss(new _())), t.fn[e] = _._jQueryInterface, t.fn[e].Constructor = _, t.fn[e].noConflict = function () {
        return t.fn[e] = h, _._jQueryInterface;
      }, _;
    }(jQuery), function (t) {
      var e = "button",
        i = "4.0.0-alpha.6",
        r = "bs.button",
        s = "." + r,
        a = ".data-api",
        l = t.fn[e],
        h = {
          ACTIVE: "active",
          BUTTON: "btn",
          FOCUS: "focus"
        },
        c = {
          DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
          DATA_TOGGLE: '[data-toggle="buttons"]',
          INPUT: "input",
          ACTIVE: ".active",
          BUTTON: ".btn"
        },
        u = {
          CLICK_DATA_API: "click" + s + a,
          FOCUS_BLUR_DATA_API: "focus" + s + a + " " + ("blur" + s + a)
        },
        d = function () {
          function e(t) {
            n(this, e), this._element = t;
          }
          return e.prototype.toggle = function () {
            var e = !0,
              n = t(this._element).closest(c.DATA_TOGGLE)[0];
            if (n) {
              var i = t(this._element).find(c.INPUT)[0];
              if (i) {
                if ("radio" === i.type) if (i.checked && t(this._element).hasClass(h.ACTIVE)) e = !1;else {
                  var o = t(n).find(c.ACTIVE)[0];
                  o && t(o).removeClass(h.ACTIVE);
                }
                e && (i.checked = !t(this._element).hasClass(h.ACTIVE), t(i).trigger("change")), i.focus();
              }
            }
            this._element.setAttribute("aria-pressed", !t(this._element).hasClass(h.ACTIVE)), e && t(this._element).toggleClass(h.ACTIVE);
          }, e.prototype.dispose = function () {
            t.removeData(this._element, r), this._element = null;
          }, e._jQueryInterface = function (n) {
            return this.each(function () {
              var i = t(this).data(r);
              i || (i = new e(this), t(this).data(r, i)), "toggle" === n && i[n]();
            });
          }, o(e, null, [{
            key: "VERSION",
            get: function () {
              return i;
            }
          }]), e;
        }();
      return t(document).on(u.CLICK_DATA_API, c.DATA_TOGGLE_CARROT, function (e) {
        e.preventDefault();
        var n = e.target;
        t(n).hasClass(h.BUTTON) || (n = t(n).closest(c.BUTTON)), d._jQueryInterface.call(t(n), "toggle");
      }).on(u.FOCUS_BLUR_DATA_API, c.DATA_TOGGLE_CARROT, function (e) {
        var n = t(e.target).closest(c.BUTTON)[0];
        t(n).toggleClass(h.FOCUS, /^focus(in)?$/.test(e.type));
      }), t.fn[e] = d._jQueryInterface, t.fn[e].Constructor = d, t.fn[e].noConflict = function () {
        return t.fn[e] = l, d._jQueryInterface;
      }, d;
    }(jQuery), function (t) {
      var e = "carousel",
        s = "4.0.0-alpha.6",
        a = "bs.carousel",
        l = "." + a,
        h = ".data-api",
        c = t.fn[e],
        u = 600,
        d = 37,
        f = 39,
        _ = {
          interval: 5e3,
          keyboard: !0,
          slide: !1,
          pause: "hover",
          wrap: !0
        },
        g = {
          interval: "(number|boolean)",
          keyboard: "boolean",
          slide: "(boolean|string)",
          pause: "(string|boolean)",
          wrap: "boolean"
        },
        p = {
          NEXT: "next",
          PREV: "prev",
          LEFT: "left",
          RIGHT: "right"
        },
        m = {
          SLIDE: "slide" + l,
          SLID: "slid" + l,
          KEYDOWN: "keydown" + l,
          MOUSEENTER: "mouseenter" + l,
          MOUSELEAVE: "mouseleave" + l,
          LOAD_DATA_API: "load" + l + h,
          CLICK_DATA_API: "click" + l + h
        },
        E = {
          CAROUSEL: "carousel",
          ACTIVE: "active",
          SLIDE: "slide",
          RIGHT: "carousel-item-right",
          LEFT: "carousel-item-left",
          NEXT: "carousel-item-next",
          PREV: "carousel-item-prev",
          ITEM: "carousel-item"
        },
        v = {
          ACTIVE: ".active",
          ACTIVE_ITEM: ".active.carousel-item",
          ITEM: ".carousel-item",
          NEXT_PREV: ".carousel-item-next, .carousel-item-prev",
          INDICATORS: ".carousel-indicators",
          DATA_SLIDE: "[data-slide], [data-slide-to]",
          DATA_RIDE: '[data-ride="carousel"]'
        },
        T = function () {
          function h(e, i) {
            n(this, h), this._items = null, this._interval = null, this._activeElement = null, this._isPaused = !1, this._isSliding = !1, this._config = this._getConfig(i), this._element = t(e)[0], this._indicatorsElement = t(this._element).find(v.INDICATORS)[0], this._addEventListeners();
          }
          return h.prototype.next = function () {
            if (this._isSliding) throw new Error("Carousel is sliding");
            this._slide(p.NEXT);
          }, h.prototype.nextWhenVisible = function () {
            document.hidden || this.next();
          }, h.prototype.prev = function () {
            if (this._isSliding) throw new Error("Carousel is sliding");
            this._slide(p.PREVIOUS);
          }, h.prototype.pause = function (e) {
            e || (this._isPaused = !0), t(this._element).find(v.NEXT_PREV)[0] && r.supportsTransitionEnd() && (r.triggerTransitionEnd(this._element), this.cycle(!0)), clearInterval(this._interval), this._interval = null;
          }, h.prototype.cycle = function (t) {
            t || (this._isPaused = !1), this._interval && (clearInterval(this._interval), this._interval = null), this._config.interval && !this._isPaused && (this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval));
          }, h.prototype.to = function (e) {
            var n = this;
            this._activeElement = t(this._element).find(v.ACTIVE_ITEM)[0];
            var i = this._getItemIndex(this._activeElement);
            if (!(e > this._items.length - 1 || e < 0)) {
              if (this._isSliding) return void t(this._element).one(m.SLID, function () {
                return n.to(e);
              });
              if (i === e) return this.pause(), void this.cycle();
              var o = e > i ? p.NEXT : p.PREVIOUS;
              this._slide(o, this._items[e]);
            }
          }, h.prototype.dispose = function () {
            t(this._element).off(l), t.removeData(this._element, a), this._items = null, this._config = null, this._element = null, this._interval = null, this._isPaused = null, this._isSliding = null, this._activeElement = null, this._indicatorsElement = null;
          }, h.prototype._getConfig = function (n) {
            return n = t.extend({}, _, n), r.typeCheckConfig(e, n, g), n;
          }, h.prototype._addEventListeners = function () {
            var e = this;
            this._config.keyboard && t(this._element).on(m.KEYDOWN, function (t) {
              return e._keydown(t);
            }), "hover" !== this._config.pause || "ontouchstart" in document.documentElement || t(this._element).on(m.MOUSEENTER, function (t) {
              return e.pause(t);
            }).on(m.MOUSELEAVE, function (t) {
              return e.cycle(t);
            });
          }, h.prototype._keydown = function (t) {
            if (!/input|textarea/i.test(t.target.tagName)) switch (t.which) {
              case d:
                t.preventDefault(), this.prev();
                break;
              case f:
                t.preventDefault(), this.next();
                break;
              default:
                return;
            }
          }, h.prototype._getItemIndex = function (e) {
            return this._items = t.makeArray(t(e).parent().find(v.ITEM)), this._items.indexOf(e);
          }, h.prototype._getItemByDirection = function (t, e) {
            var n = t === p.NEXT,
              i = t === p.PREVIOUS,
              o = this._getItemIndex(e),
              r = this._items.length - 1,
              s = i && 0 === o || n && o === r;
            if (s && !this._config.wrap) return e;
            var a = t === p.PREVIOUS ? -1 : 1,
              l = (o + a) % this._items.length;
            return l === -1 ? this._items[this._items.length - 1] : this._items[l];
          }, h.prototype._triggerSlideEvent = function (e, n) {
            var i = t.Event(m.SLIDE, {
              relatedTarget: e,
              direction: n
            });
            return t(this._element).trigger(i), i;
          }, h.prototype._setActiveIndicatorElement = function (e) {
            if (this._indicatorsElement) {
              t(this._indicatorsElement).find(v.ACTIVE).removeClass(E.ACTIVE);
              var n = this._indicatorsElement.children[this._getItemIndex(e)];
              n && t(n).addClass(E.ACTIVE);
            }
          }, h.prototype._slide = function (e, n) {
            var i = this,
              o = t(this._element).find(v.ACTIVE_ITEM)[0],
              s = n || o && this._getItemByDirection(e, o),
              a = Boolean(this._interval),
              l = void 0,
              h = void 0,
              c = void 0;
            if (e === p.NEXT ? (l = E.LEFT, h = E.NEXT, c = p.LEFT) : (l = E.RIGHT, h = E.PREV, c = p.RIGHT), s && t(s).hasClass(E.ACTIVE)) return void (this._isSliding = !1);
            var d = this._triggerSlideEvent(s, c);
            if (!d.isDefaultPrevented() && o && s) {
              this._isSliding = !0, a && this.pause(), this._setActiveIndicatorElement(s);
              var f = t.Event(m.SLID, {
                relatedTarget: s,
                direction: c
              });
              r.supportsTransitionEnd() && t(this._element).hasClass(E.SLIDE) ? (t(s).addClass(h), r.reflow(s), t(o).addClass(l), t(s).addClass(l), t(o).one(r.TRANSITION_END, function () {
                t(s).removeClass(l + " " + h).addClass(E.ACTIVE), t(o).removeClass(E.ACTIVE + " " + h + " " + l), i._isSliding = !1, setTimeout(function () {
                  return t(i._element).trigger(f);
                }, 0);
              }).emulateTransitionEnd(u)) : (t(o).removeClass(E.ACTIVE), t(s).addClass(E.ACTIVE), this._isSliding = !1, t(this._element).trigger(f)), a && this.cycle();
            }
          }, h._jQueryInterface = function (e) {
            return this.each(function () {
              var n = t(this).data(a),
                o = t.extend({}, _, t(this).data());
              "object" === ("undefined" == typeof e ? "undefined" : i(e)) && t.extend(o, e);
              var r = "string" == typeof e ? e : o.slide;
              if (n || (n = new h(this, o), t(this).data(a, n)), "number" == typeof e) n.to(e);else if ("string" == typeof r) {
                if (void 0 === n[r]) throw new Error('No method named "' + r + '"');
                n[r]();
              } else o.interval && (n.pause(), n.cycle());
            });
          }, h._dataApiClickHandler = function (e) {
            var n = r.getSelectorFromElement(this);
            if (n) {
              var i = t(n)[0];
              if (i && t(i).hasClass(E.CAROUSEL)) {
                var o = t.extend({}, t(i).data(), t(this).data()),
                  s = this.getAttribute("data-slide-to");
                s && (o.interval = !1), h._jQueryInterface.call(t(i), o), s && t(i).data(a).to(s), e.preventDefault();
              }
            }
          }, o(h, null, [{
            key: "VERSION",
            get: function () {
              return s;
            }
          }, {
            key: "Default",
            get: function () {
              return _;
            }
          }]), h;
        }();
      return t(document).on(m.CLICK_DATA_API, v.DATA_SLIDE, T._dataApiClickHandler), t(window).on(m.LOAD_DATA_API, function () {
        t(v.DATA_RIDE).each(function () {
          var e = t(this);
          T._jQueryInterface.call(e, e.data());
        });
      }), t.fn[e] = T._jQueryInterface, t.fn[e].Constructor = T, t.fn[e].noConflict = function () {
        return t.fn[e] = c, T._jQueryInterface;
      }, T;
    }(jQuery), function (t) {
      var e = "collapse",
        s = "4.0.0-alpha.6",
        a = "bs.collapse",
        l = "." + a,
        h = ".data-api",
        c = t.fn[e],
        u = 600,
        d = {
          toggle: !0,
          parent: ""
        },
        f = {
          toggle: "boolean",
          parent: "string"
        },
        _ = {
          SHOW: "show" + l,
          SHOWN: "shown" + l,
          HIDE: "hide" + l,
          HIDDEN: "hidden" + l,
          CLICK_DATA_API: "click" + l + h
        },
        g = {
          SHOW: "show",
          COLLAPSE: "collapse",
          COLLAPSING: "collapsing",
          COLLAPSED: "collapsed"
        },
        p = {
          WIDTH: "width",
          HEIGHT: "height"
        },
        m = {
          ACTIVES: ".card > .show, .card > .collapsing",
          DATA_TOGGLE: '[data-toggle="collapse"]'
        },
        E = function () {
          function l(e, i) {
            n(this, l), this._isTransitioning = !1, this._element = e, this._config = this._getConfig(i), this._triggerArray = t.makeArray(t('[data-toggle="collapse"][href="#' + e.id + '"],' + ('[data-toggle="collapse"][data-target="#' + e.id + '"]'))), this._parent = this._config.parent ? this._getParent() : null, this._config.parent || this._addAriaAndCollapsedClass(this._element, this._triggerArray), this._config.toggle && this.toggle();
          }
          return l.prototype.toggle = function () {
            t(this._element).hasClass(g.SHOW) ? this.hide() : this.show();
          }, l.prototype.show = function () {
            var e = this;
            if (this._isTransitioning) throw new Error("Collapse is transitioning");
            if (!t(this._element).hasClass(g.SHOW)) {
              var n = void 0,
                i = void 0;
              if (this._parent && (n = t.makeArray(t(this._parent).find(m.ACTIVES)), n.length || (n = null)), !(n && (i = t(n).data(a), i && i._isTransitioning))) {
                var o = t.Event(_.SHOW);
                if (t(this._element).trigger(o), !o.isDefaultPrevented()) {
                  n && (l._jQueryInterface.call(t(n), "hide"), i || t(n).data(a, null));
                  var s = this._getDimension();
                  t(this._element).removeClass(g.COLLAPSE).addClass(g.COLLAPSING), this._element.style[s] = 0, this._element.setAttribute("aria-expanded", !0), this._triggerArray.length && t(this._triggerArray).removeClass(g.COLLAPSED).attr("aria-expanded", !0), this.setTransitioning(!0);
                  var h = function () {
                    t(e._element).removeClass(g.COLLAPSING).addClass(g.COLLAPSE).addClass(g.SHOW), e._element.style[s] = "", e.setTransitioning(!1), t(e._element).trigger(_.SHOWN);
                  };
                  if (!r.supportsTransitionEnd()) return void h();
                  var c = s[0].toUpperCase() + s.slice(1),
                    d = "scroll" + c;
                  t(this._element).one(r.TRANSITION_END, h).emulateTransitionEnd(u), this._element.style[s] = this._element[d] + "px";
                }
              }
            }
          }, l.prototype.hide = function () {
            var e = this;
            if (this._isTransitioning) throw new Error("Collapse is transitioning");
            if (t(this._element).hasClass(g.SHOW)) {
              var n = t.Event(_.HIDE);
              if (t(this._element).trigger(n), !n.isDefaultPrevented()) {
                var i = this._getDimension(),
                  o = i === p.WIDTH ? "offsetWidth" : "offsetHeight";
                this._element.style[i] = this._element[o] + "px", r.reflow(this._element), t(this._element).addClass(g.COLLAPSING).removeClass(g.COLLAPSE).removeClass(g.SHOW), this._element.setAttribute("aria-expanded", !1), this._triggerArray.length && t(this._triggerArray).addClass(g.COLLAPSED).attr("aria-expanded", !1), this.setTransitioning(!0);
                var s = function () {
                  e.setTransitioning(!1), t(e._element).removeClass(g.COLLAPSING).addClass(g.COLLAPSE).trigger(_.HIDDEN);
                };
                return this._element.style[i] = "", r.supportsTransitionEnd() ? void t(this._element).one(r.TRANSITION_END, s).emulateTransitionEnd(u) : void s();
              }
            }
          }, l.prototype.setTransitioning = function (t) {
            this._isTransitioning = t;
          }, l.prototype.dispose = function () {
            t.removeData(this._element, a), this._config = null, this._parent = null, this._element = null, this._triggerArray = null, this._isTransitioning = null;
          }, l.prototype._getConfig = function (n) {
            return n = t.extend({}, d, n), n.toggle = Boolean(n.toggle), r.typeCheckConfig(e, n, f), n;
          }, l.prototype._getDimension = function () {
            var e = t(this._element).hasClass(p.WIDTH);
            return e ? p.WIDTH : p.HEIGHT;
          }, l.prototype._getParent = function () {
            var e = this,
              n = t(this._config.parent)[0],
              i = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';
            return t(n).find(i).each(function (t, n) {
              e._addAriaAndCollapsedClass(l._getTargetFromElement(n), [n]);
            }), n;
          }, l.prototype._addAriaAndCollapsedClass = function (e, n) {
            if (e) {
              var i = t(e).hasClass(g.SHOW);
              e.setAttribute("aria-expanded", i), n.length && t(n).toggleClass(g.COLLAPSED, !i).attr("aria-expanded", i);
            }
          }, l._getTargetFromElement = function (e) {
            var n = r.getSelectorFromElement(e);
            return n ? t(n)[0] : null;
          }, l._jQueryInterface = function (e) {
            return this.each(function () {
              var n = t(this),
                o = n.data(a),
                r = t.extend({}, d, n.data(), "object" === ("undefined" == typeof e ? "undefined" : i(e)) && e);
              if (!o && r.toggle && /show|hide/.test(e) && (r.toggle = !1), o || (o = new l(this, r), n.data(a, o)), "string" == typeof e) {
                if (void 0 === o[e]) throw new Error('No method named "' + e + '"');
                o[e]();
              }
            });
          }, o(l, null, [{
            key: "VERSION",
            get: function () {
              return s;
            }
          }, {
            key: "Default",
            get: function () {
              return d;
            }
          }]), l;
        }();
      return t(document).on(_.CLICK_DATA_API, m.DATA_TOGGLE, function (e) {
        e.preventDefault();
        var n = E._getTargetFromElement(this),
          i = t(n).data(a),
          o = i ? "toggle" : t(this).data();
        E._jQueryInterface.call(t(n), o);
      }), t.fn[e] = E._jQueryInterface, t.fn[e].Constructor = E, t.fn[e].noConflict = function () {
        return t.fn[e] = c, E._jQueryInterface;
      }, E;
    }(jQuery), function (t) {
      var e = "dropdown",
        i = "4.0.0-alpha.6",
        s = "bs.dropdown",
        a = "." + s,
        l = ".data-api",
        h = t.fn[e],
        c = 27,
        u = 38,
        d = 40,
        f = 3,
        _ = {
          HIDE: "hide" + a,
          HIDDEN: "hidden" + a,
          SHOW: "show" + a,
          SHOWN: "shown" + a,
          CLICK: "click" + a,
          CLICK_DATA_API: "click" + a + l,
          FOCUSIN_DATA_API: "focusin" + a + l,
          KEYDOWN_DATA_API: "keydown" + a + l
        },
        g = {
          BACKDROP: "dropdown-backdrop",
          DISABLED: "disabled",
          SHOW: "show"
        },
        p = {
          BACKDROP: ".dropdown-backdrop",
          DATA_TOGGLE: '[data-toggle="dropdown"]',
          FORM_CHILD: ".dropdown form",
          ROLE_MENU: '[role="menu"]',
          ROLE_LISTBOX: '[role="listbox"]',
          NAVBAR_NAV: ".navbar-nav",
          VISIBLE_ITEMS: '[role="menu"] li:not(.disabled) a, [role="listbox"] li:not(.disabled) a'
        },
        m = function () {
          function e(t) {
            n(this, e), this._element = t, this._addEventListeners();
          }
          return e.prototype.toggle = function () {
            if (this.disabled || t(this).hasClass(g.DISABLED)) return !1;
            var n = e._getParentFromElement(this),
              i = t(n).hasClass(g.SHOW);
            if (e._clearMenus(), i) return !1;
            if ("ontouchstart" in document.documentElement && !t(n).closest(p.NAVBAR_NAV).length) {
              var o = document.createElement("div");
              o.className = g.BACKDROP, t(o).insertBefore(this), t(o).on("click", e._clearMenus);
            }
            var r = {
                relatedTarget: this
              },
              s = t.Event(_.SHOW, r);
            return t(n).trigger(s), !s.isDefaultPrevented() && (this.focus(), this.setAttribute("aria-expanded", !0), t(n).toggleClass(g.SHOW), t(n).trigger(t.Event(_.SHOWN, r)), !1);
          }, e.prototype.dispose = function () {
            t.removeData(this._element, s), t(this._element).off(a), this._element = null;
          }, e.prototype._addEventListeners = function () {
            t(this._element).on(_.CLICK, this.toggle);
          }, e._jQueryInterface = function (n) {
            return this.each(function () {
              var i = t(this).data(s);
              if (i || (i = new e(this), t(this).data(s, i)), "string" == typeof n) {
                if (void 0 === i[n]) throw new Error('No method named "' + n + '"');
                i[n].call(this);
              }
            });
          }, e._clearMenus = function (n) {
            if (!n || n.which !== f) {
              var i = t(p.BACKDROP)[0];
              i && i.parentNode.removeChild(i);
              for (var o = t.makeArray(t(p.DATA_TOGGLE)), r = 0; r < o.length; r++) {
                var s = e._getParentFromElement(o[r]),
                  a = {
                    relatedTarget: o[r]
                  };
                if (t(s).hasClass(g.SHOW) && !(n && ("click" === n.type && /input|textarea/i.test(n.target.tagName) || "focusin" === n.type) && t.contains(s, n.target))) {
                  var l = t.Event(_.HIDE, a);
                  t(s).trigger(l), l.isDefaultPrevented() || (o[r].setAttribute("aria-expanded", "false"), t(s).removeClass(g.SHOW).trigger(t.Event(_.HIDDEN, a)));
                }
              }
            }
          }, e._getParentFromElement = function (e) {
            var n = void 0,
              i = r.getSelectorFromElement(e);
            return i && (n = t(i)[0]), n || e.parentNode;
          }, e._dataApiKeydownHandler = function (n) {
            if (/(38|40|27|32)/.test(n.which) && !/input|textarea/i.test(n.target.tagName) && (n.preventDefault(), n.stopPropagation(), !this.disabled && !t(this).hasClass(g.DISABLED))) {
              var i = e._getParentFromElement(this),
                o = t(i).hasClass(g.SHOW);
              if (!o && n.which !== c || o && n.which === c) {
                if (n.which === c) {
                  var r = t(i).find(p.DATA_TOGGLE)[0];
                  t(r).trigger("focus");
                }
                return void t(this).trigger("click");
              }
              var s = t(i).find(p.VISIBLE_ITEMS).get();
              if (s.length) {
                var a = s.indexOf(n.target);
                n.which === u && a > 0 && a--, n.which === d && a < s.length - 1 && a++, a < 0 && (a = 0), s[a].focus();
              }
            }
          }, o(e, null, [{
            key: "VERSION",
            get: function () {
              return i;
            }
          }]), e;
        }();
      return t(document).on(_.KEYDOWN_DATA_API, p.DATA_TOGGLE, m._dataApiKeydownHandler).on(_.KEYDOWN_DATA_API, p.ROLE_MENU, m._dataApiKeydownHandler).on(_.KEYDOWN_DATA_API, p.ROLE_LISTBOX, m._dataApiKeydownHandler).on(_.CLICK_DATA_API + " " + _.FOCUSIN_DATA_API, m._clearMenus).on(_.CLICK_DATA_API, p.DATA_TOGGLE, m.prototype.toggle).on(_.CLICK_DATA_API, p.FORM_CHILD, function (t) {
        t.stopPropagation();
      }), t.fn[e] = m._jQueryInterface, t.fn[e].Constructor = m, t.fn[e].noConflict = function () {
        return t.fn[e] = h, m._jQueryInterface;
      }, m;
    }(jQuery), function (t) {
      var e = "modal",
        s = "4.0.0-alpha.6",
        a = "bs.modal",
        l = "." + a,
        h = ".data-api",
        c = t.fn[e],
        u = 300,
        d = 150,
        f = 27,
        _ = {
          backdrop: !0,
          keyboard: !0,
          focus: !0,
          show: !0
        },
        g = {
          backdrop: "(boolean|string)",
          keyboard: "boolean",
          focus: "boolean",
          show: "boolean"
        },
        p = {
          HIDE: "hide" + l,
          HIDDEN: "hidden" + l,
          SHOW: "show" + l,
          SHOWN: "shown" + l,
          FOCUSIN: "focusin" + l,
          RESIZE: "resize" + l,
          CLICK_DISMISS: "click.dismiss" + l,
          KEYDOWN_DISMISS: "keydown.dismiss" + l,
          MOUSEUP_DISMISS: "mouseup.dismiss" + l,
          MOUSEDOWN_DISMISS: "mousedown.dismiss" + l,
          CLICK_DATA_API: "click" + l + h
        },
        m = {
          SCROLLBAR_MEASURER: "modal-scrollbar-measure",
          BACKDROP: "modal-backdrop",
          OPEN: "modal-open",
          FADE: "fade",
          SHOW: "show"
        },
        E = {
          DIALOG: ".modal-dialog",
          DATA_TOGGLE: '[data-toggle="modal"]',
          DATA_DISMISS: '[data-dismiss="modal"]',
          FIXED_CONTENT: ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top"
        },
        v = function () {
          function h(e, i) {
            n(this, h), this._config = this._getConfig(i), this._element = e, this._dialog = t(e).find(E.DIALOG)[0], this._backdrop = null, this._isShown = !1, this._isBodyOverflowing = !1, this._ignoreBackdropClick = !1, this._isTransitioning = !1, this._originalBodyPadding = 0, this._scrollbarWidth = 0;
          }
          return h.prototype.toggle = function (t) {
            return this._isShown ? this.hide() : this.show(t);
          }, h.prototype.show = function (e) {
            var n = this;
            if (this._isTransitioning) throw new Error("Modal is transitioning");
            r.supportsTransitionEnd() && t(this._element).hasClass(m.FADE) && (this._isTransitioning = !0);
            var i = t.Event(p.SHOW, {
              relatedTarget: e
            });
            t(this._element).trigger(i), this._isShown || i.isDefaultPrevented() || (this._isShown = !0, this._checkScrollbar(), this._setScrollbar(), t(document.body).addClass(m.OPEN), this._setEscapeEvent(), this._setResizeEvent(), t(this._element).on(p.CLICK_DISMISS, E.DATA_DISMISS, function (t) {
              return n.hide(t);
            }), t(this._dialog).on(p.MOUSEDOWN_DISMISS, function () {
              t(n._element).one(p.MOUSEUP_DISMISS, function (e) {
                t(e.target).is(n._element) && (n._ignoreBackdropClick = !0);
              });
            }), this._showBackdrop(function () {
              return n._showElement(e);
            }));
          }, h.prototype.hide = function (e) {
            var n = this;
            if (e && e.preventDefault(), this._isTransitioning) throw new Error("Modal is transitioning");
            var i = r.supportsTransitionEnd() && t(this._element).hasClass(m.FADE);
            i && (this._isTransitioning = !0);
            var o = t.Event(p.HIDE);
            t(this._element).trigger(o), this._isShown && !o.isDefaultPrevented() && (this._isShown = !1, this._setEscapeEvent(), this._setResizeEvent(), t(document).off(p.FOCUSIN), t(this._element).removeClass(m.SHOW), t(this._element).off(p.CLICK_DISMISS), t(this._dialog).off(p.MOUSEDOWN_DISMISS), i ? t(this._element).one(r.TRANSITION_END, function (t) {
              return n._hideModal(t);
            }).emulateTransitionEnd(u) : this._hideModal());
          }, h.prototype.dispose = function () {
            t.removeData(this._element, a), t(window, document, this._element, this._backdrop).off(l), this._config = null, this._element = null, this._dialog = null, this._backdrop = null, this._isShown = null, this._isBodyOverflowing = null, this._ignoreBackdropClick = null, this._originalBodyPadding = null, this._scrollbarWidth = null;
          }, h.prototype._getConfig = function (n) {
            return n = t.extend({}, _, n), r.typeCheckConfig(e, n, g), n;
          }, h.prototype._showElement = function (e) {
            var n = this,
              i = r.supportsTransitionEnd() && t(this._element).hasClass(m.FADE);
            this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE || document.body.appendChild(this._element), this._element.style.display = "block", this._element.removeAttribute("aria-hidden"), this._element.scrollTop = 0, i && r.reflow(this._element), t(this._element).addClass(m.SHOW), this._config.focus && this._enforceFocus();
            var o = t.Event(p.SHOWN, {
                relatedTarget: e
              }),
              s = function () {
                n._config.focus && n._element.focus(), n._isTransitioning = !1, t(n._element).trigger(o);
              };
            i ? t(this._dialog).one(r.TRANSITION_END, s).emulateTransitionEnd(u) : s();
          }, h.prototype._enforceFocus = function () {
            var e = this;
            t(document).off(p.FOCUSIN).on(p.FOCUSIN, function (n) {
              document === n.target || e._element === n.target || t(e._element).has(n.target).length || e._element.focus();
            });
          }, h.prototype._setEscapeEvent = function () {
            var e = this;
            this._isShown && this._config.keyboard ? t(this._element).on(p.KEYDOWN_DISMISS, function (t) {
              t.which === f && e.hide();
            }) : this._isShown || t(this._element).off(p.KEYDOWN_DISMISS);
          }, h.prototype._setResizeEvent = function () {
            var e = this;
            this._isShown ? t(window).on(p.RESIZE, function (t) {
              return e._handleUpdate(t);
            }) : t(window).off(p.RESIZE);
          }, h.prototype._hideModal = function () {
            var e = this;
            this._element.style.display = "none", this._element.setAttribute("aria-hidden", "true"), this._isTransitioning = !1, this._showBackdrop(function () {
              t(document.body).removeClass(m.OPEN), e._resetAdjustments(), e._resetScrollbar(), t(e._element).trigger(p.HIDDEN);
            });
          }, h.prototype._removeBackdrop = function () {
            this._backdrop && (t(this._backdrop).remove(), this._backdrop = null);
          }, h.prototype._showBackdrop = function (e) {
            var n = this,
              i = t(this._element).hasClass(m.FADE) ? m.FADE : "";
            if (this._isShown && this._config.backdrop) {
              var o = r.supportsTransitionEnd() && i;
              if (this._backdrop = document.createElement("div"), this._backdrop.className = m.BACKDROP, i && t(this._backdrop).addClass(i), t(this._backdrop).appendTo(document.body), t(this._element).on(p.CLICK_DISMISS, function (t) {
                return n._ignoreBackdropClick ? void (n._ignoreBackdropClick = !1) : void (t.target === t.currentTarget && ("static" === n._config.backdrop ? n._element.focus() : n.hide()));
              }), o && r.reflow(this._backdrop), t(this._backdrop).addClass(m.SHOW), !e) return;
              if (!o) return void e();
              t(this._backdrop).one(r.TRANSITION_END, e).emulateTransitionEnd(d);
            } else if (!this._isShown && this._backdrop) {
              t(this._backdrop).removeClass(m.SHOW);
              var s = function () {
                n._removeBackdrop(), e && e();
              };
              r.supportsTransitionEnd() && t(this._element).hasClass(m.FADE) ? t(this._backdrop).one(r.TRANSITION_END, s).emulateTransitionEnd(d) : s();
            } else e && e();
          }, h.prototype._handleUpdate = function () {
            this._adjustDialog();
          }, h.prototype._adjustDialog = function () {
            var t = this._element.scrollHeight > document.documentElement.clientHeight;
            !this._isBodyOverflowing && t && (this._element.style.paddingLeft = this._scrollbarWidth + "px"), this._isBodyOverflowing && !t && (this._element.style.paddingRight = this._scrollbarWidth + "px");
          }, h.prototype._resetAdjustments = function () {
            this._element.style.paddingLeft = "", this._element.style.paddingRight = "";
          }, h.prototype._checkScrollbar = function () {
            this._isBodyOverflowing = document.body.clientWidth < window.innerWidth, this._scrollbarWidth = this._getScrollbarWidth();
          }, h.prototype._setScrollbar = function () {
            var e = parseInt(t(E.FIXED_CONTENT).css("padding-right") || 0, 10);
            this._originalBodyPadding = document.body.style.paddingRight || "", this._isBodyOverflowing && (document.body.style.paddingRight = e + this._scrollbarWidth + "px");
          }, h.prototype._resetScrollbar = function () {
            document.body.style.paddingRight = this._originalBodyPadding;
          }, h.prototype._getScrollbarWidth = function () {
            var t = document.createElement("div");
            t.className = m.SCROLLBAR_MEASURER, document.body.appendChild(t);
            var e = t.offsetWidth - t.clientWidth;
            return document.body.removeChild(t), e;
          }, h._jQueryInterface = function (e, n) {
            return this.each(function () {
              var o = t(this).data(a),
                r = t.extend({}, h.Default, t(this).data(), "object" === ("undefined" == typeof e ? "undefined" : i(e)) && e);
              if (o || (o = new h(this, r), t(this).data(a, o)), "string" == typeof e) {
                if (void 0 === o[e]) throw new Error('No method named "' + e + '"');
                o[e](n);
              } else r.show && o.show(n);
            });
          }, o(h, null, [{
            key: "VERSION",
            get: function () {
              return s;
            }
          }, {
            key: "Default",
            get: function () {
              return _;
            }
          }]), h;
        }();
      return t(document).on(p.CLICK_DATA_API, E.DATA_TOGGLE, function (e) {
        var n = this,
          i = void 0,
          o = r.getSelectorFromElement(this);
        o && (i = t(o)[0]);
        var s = t(i).data(a) ? "toggle" : t.extend({}, t(i).data(), t(this).data());
        "A" !== this.tagName && "AREA" !== this.tagName || e.preventDefault();
        var l = t(i).one(p.SHOW, function (e) {
          e.isDefaultPrevented() || l.one(p.HIDDEN, function () {
            t(n).is(":visible") && n.focus();
          });
        });
        v._jQueryInterface.call(t(i), s, this);
      }), t.fn[e] = v._jQueryInterface, t.fn[e].Constructor = v, t.fn[e].noConflict = function () {
        return t.fn[e] = c, v._jQueryInterface;
      }, v;
    }(jQuery), function (t) {
      var e = "scrollspy",
        s = "4.0.0-alpha.6",
        a = "bs.scrollspy",
        l = "." + a,
        h = ".data-api",
        c = t.fn[e],
        u = {
          offset: 10,
          method: "auto",
          target: ""
        },
        d = {
          offset: "number",
          method: "string",
          target: "(string|element)"
        },
        f = {
          ACTIVATE: "activate" + l,
          SCROLL: "scroll" + l,
          LOAD_DATA_API: "load" + l + h
        },
        _ = {
          DROPDOWN_ITEM: "dropdown-item",
          DROPDOWN_MENU: "dropdown-menu",
          NAV_LINK: "nav-link",
          NAV: "nav",
          ACTIVE: "active"
        },
        g = {
          DATA_SPY: '[data-spy="scroll"]',
          ACTIVE: ".active",
          LIST_ITEM: ".list-item",
          LI: "li",
          LI_DROPDOWN: "li.dropdown",
          NAV_LINKS: ".nav-link",
          DROPDOWN: ".dropdown",
          DROPDOWN_ITEMS: ".dropdown-item",
          DROPDOWN_TOGGLE: ".dropdown-toggle"
        },
        p = {
          OFFSET: "offset",
          POSITION: "position"
        },
        m = function () {
          function h(e, i) {
            var o = this;
            n(this, h), this._element = e, this._scrollElement = "BODY" === e.tagName ? window : e, this._config = this._getConfig(i), this._selector = this._config.target + " " + g.NAV_LINKS + "," + (this._config.target + " " + g.DROPDOWN_ITEMS), this._offsets = [], this._targets = [], this._activeTarget = null, this._scrollHeight = 0, t(this._scrollElement).on(f.SCROLL, function (t) {
              return o._process(t);
            }), this.refresh(), this._process();
          }
          return h.prototype.refresh = function () {
            var e = this,
              n = this._scrollElement !== this._scrollElement.window ? p.POSITION : p.OFFSET,
              i = "auto" === this._config.method ? n : this._config.method,
              o = i === p.POSITION ? this._getScrollTop() : 0;
            this._offsets = [], this._targets = [], this._scrollHeight = this._getScrollHeight();
            var s = t.makeArray(t(this._selector));
            s.map(function (e) {
              var n = void 0,
                s = r.getSelectorFromElement(e);
              return s && (n = t(s)[0]), n && (n.offsetWidth || n.offsetHeight) ? [t(n)[i]().top + o, s] : null;
            }).filter(function (t) {
              return t;
            }).sort(function (t, e) {
              return t[0] - e[0];
            }).forEach(function (t) {
              e._offsets.push(t[0]), e._targets.push(t[1]);
            });
          }, h.prototype.dispose = function () {
            t.removeData(this._element, a), t(this._scrollElement).off(l), this._element = null, this._scrollElement = null, this._config = null, this._selector = null, this._offsets = null, this._targets = null, this._activeTarget = null, this._scrollHeight = null;
          }, h.prototype._getConfig = function (n) {
            if (n = t.extend({}, u, n), "string" != typeof n.target) {
              var i = t(n.target).attr("id");
              i || (i = r.getUID(e), t(n.target).attr("id", i)), n.target = "#" + i;
            }
            return r.typeCheckConfig(e, n, d), n;
          }, h.prototype._getScrollTop = function () {
            return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
          }, h.prototype._getScrollHeight = function () {
            return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
          }, h.prototype._getOffsetHeight = function () {
            return this._scrollElement === window ? window.innerHeight : this._scrollElement.offsetHeight;
          }, h.prototype._process = function () {
            var t = this._getScrollTop() + this._config.offset,
              e = this._getScrollHeight(),
              n = this._config.offset + e - this._getOffsetHeight();
            if (this._scrollHeight !== e && this.refresh(), t >= n) {
              var i = this._targets[this._targets.length - 1];
              return void (this._activeTarget !== i && this._activate(i));
            }
            if (this._activeTarget && t < this._offsets[0] && this._offsets[0] > 0) return this._activeTarget = null, void this._clear();
            for (var o = this._offsets.length; o--;) {
              var r = this._activeTarget !== this._targets[o] && t >= this._offsets[o] && (void 0 === this._offsets[o + 1] || t < this._offsets[o + 1]);
              r && this._activate(this._targets[o]);
            }
          }, h.prototype._activate = function (e) {
            this._activeTarget = e, this._clear();
            var n = this._selector.split(",");
            n = n.map(function (t) {
              return t + '[data-target="' + e + '"],' + (t + '[href="' + e + '"]');
            });
            var i = t(n.join(","));
            i.hasClass(_.DROPDOWN_ITEM) ? (i.closest(g.DROPDOWN).find(g.DROPDOWN_TOGGLE).addClass(_.ACTIVE), i.addClass(_.ACTIVE)) : i.parents(g.LI).find("> " + g.NAV_LINKS).addClass(_.ACTIVE), t(this._scrollElement).trigger(f.ACTIVATE, {
              relatedTarget: e
            });
          }, h.prototype._clear = function () {
            t(this._selector).filter(g.ACTIVE).removeClass(_.ACTIVE);
          }, h._jQueryInterface = function (e) {
            return this.each(function () {
              var n = t(this).data(a),
                o = "object" === ("undefined" == typeof e ? "undefined" : i(e)) && e;
              if (n || (n = new h(this, o), t(this).data(a, n)), "string" == typeof e) {
                if (void 0 === n[e]) throw new Error('No method named "' + e + '"');
                n[e]();
              }
            });
          }, o(h, null, [{
            key: "VERSION",
            get: function () {
              return s;
            }
          }, {
            key: "Default",
            get: function () {
              return u;
            }
          }]), h;
        }();
      return t(window).on(f.LOAD_DATA_API, function () {
        for (var e = t.makeArray(t(g.DATA_SPY)), n = e.length; n--;) {
          var i = t(e[n]);
          m._jQueryInterface.call(i, i.data());
        }
      }), t.fn[e] = m._jQueryInterface, t.fn[e].Constructor = m, t.fn[e].noConflict = function () {
        return t.fn[e] = c, m._jQueryInterface;
      }, m;
    }(jQuery), function (t) {
      var e = "tab",
        i = "4.0.0-alpha.6",
        s = "bs.tab",
        a = "." + s,
        l = ".data-api",
        h = t.fn[e],
        c = 150,
        u = {
          HIDE: "hide" + a,
          HIDDEN: "hidden" + a,
          SHOW: "show" + a,
          SHOWN: "shown" + a,
          CLICK_DATA_API: "click" + a + l
        },
        d = {
          DROPDOWN_MENU: "dropdown-menu",
          ACTIVE: "active",
          DISABLED: "disabled",
          FADE: "fade",
          SHOW: "show"
        },
        f = {
          A: "a",
          LI: "li",
          DROPDOWN: ".dropdown",
          LIST: "ul:not(.dropdown-menu), ol:not(.dropdown-menu), nav:not(.dropdown-menu)",
          FADE_CHILD: "> .nav-item .fade, > .fade",
          ACTIVE: ".active",
          ACTIVE_CHILD: "> .nav-item > .active, > .active",
          DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"]',
          DROPDOWN_TOGGLE: ".dropdown-toggle",
          DROPDOWN_ACTIVE_CHILD: "> .dropdown-menu .active"
        },
        _ = function () {
          function e(t) {
            n(this, e), this._element = t;
          }
          return e.prototype.show = function () {
            var e = this;
            if (!(this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && t(this._element).hasClass(d.ACTIVE) || t(this._element).hasClass(d.DISABLED))) {
              var n = void 0,
                i = void 0,
                o = t(this._element).closest(f.LIST)[0],
                s = r.getSelectorFromElement(this._element);
              o && (i = t.makeArray(t(o).find(f.ACTIVE)), i = i[i.length - 1]);
              var a = t.Event(u.HIDE, {
                  relatedTarget: this._element
                }),
                l = t.Event(u.SHOW, {
                  relatedTarget: i
                });
              if (i && t(i).trigger(a), t(this._element).trigger(l), !l.isDefaultPrevented() && !a.isDefaultPrevented()) {
                s && (n = t(s)[0]), this._activate(this._element, o);
                var h = function () {
                  var n = t.Event(u.HIDDEN, {
                      relatedTarget: e._element
                    }),
                    o = t.Event(u.SHOWN, {
                      relatedTarget: i
                    });
                  t(i).trigger(n), t(e._element).trigger(o);
                };
                n ? this._activate(n, n.parentNode, h) : h();
              }
            }
          }, e.prototype.dispose = function () {
            t.removeClass(this._element, s), this._element = null;
          }, e.prototype._activate = function (e, n, i) {
            var o = this,
              s = t(n).find(f.ACTIVE_CHILD)[0],
              a = i && r.supportsTransitionEnd() && (s && t(s).hasClass(d.FADE) || Boolean(t(n).find(f.FADE_CHILD)[0])),
              l = function () {
                return o._transitionComplete(e, s, a, i);
              };
            s && a ? t(s).one(r.TRANSITION_END, l).emulateTransitionEnd(c) : l(), s && t(s).removeClass(d.SHOW);
          }, e.prototype._transitionComplete = function (e, n, i, o) {
            if (n) {
              t(n).removeClass(d.ACTIVE);
              var s = t(n.parentNode).find(f.DROPDOWN_ACTIVE_CHILD)[0];
              s && t(s).removeClass(d.ACTIVE), n.setAttribute("aria-expanded", !1);
            }
            if (t(e).addClass(d.ACTIVE), e.setAttribute("aria-expanded", !0), i ? (r.reflow(e), t(e).addClass(d.SHOW)) : t(e).removeClass(d.FADE), e.parentNode && t(e.parentNode).hasClass(d.DROPDOWN_MENU)) {
              var a = t(e).closest(f.DROPDOWN)[0];
              a && t(a).find(f.DROPDOWN_TOGGLE).addClass(d.ACTIVE), e.setAttribute("aria-expanded", !0);
            }
            o && o();
          }, e._jQueryInterface = function (n) {
            return this.each(function () {
              var i = t(this),
                o = i.data(s);
              if (o || (o = new e(this), i.data(s, o)), "string" == typeof n) {
                if (void 0 === o[n]) throw new Error('No method named "' + n + '"');
                o[n]();
              }
            });
          }, o(e, null, [{
            key: "VERSION",
            get: function () {
              return i;
            }
          }]), e;
        }();
      return t(document).on(u.CLICK_DATA_API, f.DATA_TOGGLE, function (e) {
        e.preventDefault(), _._jQueryInterface.call(t(this), "show");
      }), t.fn[e] = _._jQueryInterface, t.fn[e].Constructor = _, t.fn[e].noConflict = function () {
        return t.fn[e] = h, _._jQueryInterface;
      }, _;
    }(jQuery), function (t) {
      if ("undefined" == typeof Tether) throw new Error("Bootstrap tooltips require Tether (http://tether.io/)");
      var e = "tooltip",
        s = "4.0.0-alpha.6",
        a = "bs.tooltip",
        l = "." + a,
        h = t.fn[e],
        c = 150,
        u = "bs-tether",
        d = {
          animation: !0,
          template: '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
          trigger: "hover focus",
          title: "",
          delay: 0,
          html: !1,
          selector: !1,
          placement: "top",
          offset: "0 0",
          constraints: [],
          container: !1
        },
        f = {
          animation: "boolean",
          template: "string",
          title: "(string|element|function)",
          trigger: "string",
          delay: "(number|object)",
          html: "boolean",
          selector: "(string|boolean)",
          placement: "(string|function)",
          offset: "string",
          constraints: "array",
          container: "(string|element|boolean)"
        },
        _ = {
          TOP: "bottom center",
          RIGHT: "middle left",
          BOTTOM: "top center",
          LEFT: "middle right"
        },
        g = {
          SHOW: "show",
          OUT: "out"
        },
        p = {
          HIDE: "hide" + l,
          HIDDEN: "hidden" + l,
          SHOW: "show" + l,
          SHOWN: "shown" + l,
          INSERTED: "inserted" + l,
          CLICK: "click" + l,
          FOCUSIN: "focusin" + l,
          FOCUSOUT: "focusout" + l,
          MOUSEENTER: "mouseenter" + l,
          MOUSELEAVE: "mouseleave" + l
        },
        m = {
          FADE: "fade",
          SHOW: "show"
        },
        E = {
          TOOLTIP: ".tooltip",
          TOOLTIP_INNER: ".tooltip-inner"
        },
        v = {
          element: !1,
          enabled: !1
        },
        T = {
          HOVER: "hover",
          FOCUS: "focus",
          CLICK: "click",
          MANUAL: "manual"
        },
        I = function () {
          function h(t, e) {
            n(this, h), this._isEnabled = !0, this._timeout = 0, this._hoverState = "", this._activeTrigger = {}, this._isTransitioning = !1, this._tether = null, this.element = t, this.config = this._getConfig(e), this.tip = null, this._setListeners();
          }
          return h.prototype.enable = function () {
            this._isEnabled = !0;
          }, h.prototype.disable = function () {
            this._isEnabled = !1;
          }, h.prototype.toggleEnabled = function () {
            this._isEnabled = !this._isEnabled;
          }, h.prototype.toggle = function (e) {
            if (e) {
              var n = this.constructor.DATA_KEY,
                i = t(e.currentTarget).data(n);
              i || (i = new this.constructor(e.currentTarget, this._getDelegateConfig()), t(e.currentTarget).data(n, i)), i._activeTrigger.click = !i._activeTrigger.click, i._isWithActiveTrigger() ? i._enter(null, i) : i._leave(null, i);
            } else {
              if (t(this.getTipElement()).hasClass(m.SHOW)) return void this._leave(null, this);
              this._enter(null, this);
            }
          }, h.prototype.dispose = function () {
            clearTimeout(this._timeout), this.cleanupTether(), t.removeData(this.element, this.constructor.DATA_KEY), t(this.element).off(this.constructor.EVENT_KEY), t(this.element).closest(".modal").off("hide.bs.modal"), this.tip && t(this.tip).remove(), this._isEnabled = null, this._timeout = null, this._hoverState = null, this._activeTrigger = null, this._tether = null, this.element = null, this.config = null, this.tip = null;
          }, h.prototype.show = function () {
            var e = this;
            if ("none" === t(this.element).css("display")) throw new Error("Please use show on visible elements");
            var n = t.Event(this.constructor.Event.SHOW);
            if (this.isWithContent() && this._isEnabled) {
              if (this._isTransitioning) throw new Error("Tooltip is transitioning");
              t(this.element).trigger(n);
              var i = t.contains(this.element.ownerDocument.documentElement, this.element);
              if (n.isDefaultPrevented() || !i) return;
              var o = this.getTipElement(),
                s = r.getUID(this.constructor.NAME);
              o.setAttribute("id", s), this.element.setAttribute("aria-describedby", s), this.setContent(), this.config.animation && t(o).addClass(m.FADE);
              var a = "function" == typeof this.config.placement ? this.config.placement.call(this, o, this.element) : this.config.placement,
                l = this._getAttachment(a),
                c = this.config.container === !1 ? document.body : t(this.config.container);
              t(o).data(this.constructor.DATA_KEY, this).appendTo(c), t(this.element).trigger(this.constructor.Event.INSERTED), this._tether = new Tether({
                attachment: l,
                element: o,
                target: this.element,
                classes: v,
                classPrefix: u,
                offset: this.config.offset,
                constraints: this.config.constraints,
                addTargetClasses: !1
              }), r.reflow(o), this._tether.position(), t(o).addClass(m.SHOW);
              var d = function () {
                var n = e._hoverState;
                e._hoverState = null, e._isTransitioning = !1, t(e.element).trigger(e.constructor.Event.SHOWN), n === g.OUT && e._leave(null, e);
              };
              if (r.supportsTransitionEnd() && t(this.tip).hasClass(m.FADE)) return this._isTransitioning = !0, void t(this.tip).one(r.TRANSITION_END, d).emulateTransitionEnd(h._TRANSITION_DURATION);
              d();
            }
          }, h.prototype.hide = function (e) {
            var n = this,
              i = this.getTipElement(),
              o = t.Event(this.constructor.Event.HIDE);
            if (this._isTransitioning) throw new Error("Tooltip is transitioning");
            var s = function () {
              n._hoverState !== g.SHOW && i.parentNode && i.parentNode.removeChild(i), n.element.removeAttribute("aria-describedby"), t(n.element).trigger(n.constructor.Event.HIDDEN), n._isTransitioning = !1, n.cleanupTether(), e && e();
            };
            t(this.element).trigger(o), o.isDefaultPrevented() || (t(i).removeClass(m.SHOW), this._activeTrigger[T.CLICK] = !1, this._activeTrigger[T.FOCUS] = !1, this._activeTrigger[T.HOVER] = !1, r.supportsTransitionEnd() && t(this.tip).hasClass(m.FADE) ? (this._isTransitioning = !0, t(i).one(r.TRANSITION_END, s).emulateTransitionEnd(c)) : s(), this._hoverState = "");
          }, h.prototype.isWithContent = function () {
            return Boolean(this.getTitle());
          }, h.prototype.getTipElement = function () {
            return this.tip = this.tip || t(this.config.template)[0];
          }, h.prototype.setContent = function () {
            var e = t(this.getTipElement());
            this.setElementContent(e.find(E.TOOLTIP_INNER), this.getTitle()), e.removeClass(m.FADE + " " + m.SHOW), this.cleanupTether();
          }, h.prototype.setElementContent = function (e, n) {
            var o = this.config.html;
            "object" === ("undefined" == typeof n ? "undefined" : i(n)) && (n.nodeType || n.jquery) ? o ? t(n).parent().is(e) || e.empty().append(n) : e.text(t(n).text()) : e[o ? "html" : "text"](n);
          }, h.prototype.getTitle = function () {
            var t = this.element.getAttribute("data-original-title");
            return t || (t = "function" == typeof this.config.title ? this.config.title.call(this.element) : this.config.title), t;
          }, h.prototype.cleanupTether = function () {
            this._tether && this._tether.destroy();
          }, h.prototype._getAttachment = function (t) {
            return _[t.toUpperCase()];
          }, h.prototype._setListeners = function () {
            var e = this,
              n = this.config.trigger.split(" ");
            n.forEach(function (n) {
              if ("click" === n) t(e.element).on(e.constructor.Event.CLICK, e.config.selector, function (t) {
                return e.toggle(t);
              });else if (n !== T.MANUAL) {
                var i = n === T.HOVER ? e.constructor.Event.MOUSEENTER : e.constructor.Event.FOCUSIN,
                  o = n === T.HOVER ? e.constructor.Event.MOUSELEAVE : e.constructor.Event.FOCUSOUT;
                t(e.element).on(i, e.config.selector, function (t) {
                  return e._enter(t);
                }).on(o, e.config.selector, function (t) {
                  return e._leave(t);
                });
              }
              t(e.element).closest(".modal").on("hide.bs.modal", function () {
                return e.hide();
              });
            }), this.config.selector ? this.config = t.extend({}, this.config, {
              trigger: "manual",
              selector: ""
            }) : this._fixTitle();
          }, h.prototype._fixTitle = function () {
            var t = i(this.element.getAttribute("data-original-title"));
            (this.element.getAttribute("title") || "string" !== t) && (this.element.setAttribute("data-original-title", this.element.getAttribute("title") || ""), this.element.setAttribute("title", ""));
          }, h.prototype._enter = function (e, n) {
            var i = this.constructor.DATA_KEY;
            return n = n || t(e.currentTarget).data(i), n || (n = new this.constructor(e.currentTarget, this._getDelegateConfig()), t(e.currentTarget).data(i, n)), e && (n._activeTrigger["focusin" === e.type ? T.FOCUS : T.HOVER] = !0), t(n.getTipElement()).hasClass(m.SHOW) || n._hoverState === g.SHOW ? void (n._hoverState = g.SHOW) : (clearTimeout(n._timeout), n._hoverState = g.SHOW, n.config.delay && n.config.delay.show ? void (n._timeout = setTimeout(function () {
              n._hoverState === g.SHOW && n.show();
            }, n.config.delay.show)) : void n.show());
          }, h.prototype._leave = function (e, n) {
            var i = this.constructor.DATA_KEY;
            if (n = n || t(e.currentTarget).data(i), n || (n = new this.constructor(e.currentTarget, this._getDelegateConfig()), t(e.currentTarget).data(i, n)), e && (n._activeTrigger["focusout" === e.type ? T.FOCUS : T.HOVER] = !1), !n._isWithActiveTrigger()) return clearTimeout(n._timeout), n._hoverState = g.OUT, n.config.delay && n.config.delay.hide ? void (n._timeout = setTimeout(function () {
              n._hoverState === g.OUT && n.hide();
            }, n.config.delay.hide)) : void n.hide();
          }, h.prototype._isWithActiveTrigger = function () {
            for (var t in this._activeTrigger) if (this._activeTrigger[t]) return !0;
            return !1;
          }, h.prototype._getConfig = function (n) {
            return n = t.extend({}, this.constructor.Default, t(this.element).data(), n), n.delay && "number" == typeof n.delay && (n.delay = {
              show: n.delay,
              hide: n.delay
            }), r.typeCheckConfig(e, n, this.constructor.DefaultType), n;
          }, h.prototype._getDelegateConfig = function () {
            var t = {};
            if (this.config) for (var e in this.config) this.constructor.Default[e] !== this.config[e] && (t[e] = this.config[e]);
            return t;
          }, h._jQueryInterface = function (e) {
            return this.each(function () {
              var n = t(this).data(a),
                o = "object" === ("undefined" == typeof e ? "undefined" : i(e)) && e;
              if ((n || !/dispose|hide/.test(e)) && (n || (n = new h(this, o), t(this).data(a, n)), "string" == typeof e)) {
                if (void 0 === n[e]) throw new Error('No method named "' + e + '"');
                n[e]();
              }
            });
          }, o(h, null, [{
            key: "VERSION",
            get: function () {
              return s;
            }
          }, {
            key: "Default",
            get: function () {
              return d;
            }
          }, {
            key: "NAME",
            get: function () {
              return e;
            }
          }, {
            key: "DATA_KEY",
            get: function () {
              return a;
            }
          }, {
            key: "Event",
            get: function () {
              return p;
            }
          }, {
            key: "EVENT_KEY",
            get: function () {
              return l;
            }
          }, {
            key: "DefaultType",
            get: function () {
              return f;
            }
          }]), h;
        }();
      return t.fn[e] = I._jQueryInterface, t.fn[e].Constructor = I, t.fn[e].noConflict = function () {
        return t.fn[e] = h, I._jQueryInterface;
      }, I;
    }(jQuery));
  (function (r) {
    var a = "popover",
      l = "4.0.0-alpha.6",
      h = "bs.popover",
      c = "." + h,
      u = r.fn[a],
      d = r.extend({}, s.Default, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover" role="tooltip"><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
      }),
      f = r.extend({}, s.DefaultType, {
        content: "(string|element|function)"
      }),
      _ = {
        FADE: "fade",
        SHOW: "show"
      },
      g = {
        TITLE: ".popover-title",
        CONTENT: ".popover-content"
      },
      p = {
        HIDE: "hide" + c,
        HIDDEN: "hidden" + c,
        SHOW: "show" + c,
        SHOWN: "shown" + c,
        INSERTED: "inserted" + c,
        CLICK: "click" + c,
        FOCUSIN: "focusin" + c,
        FOCUSOUT: "focusout" + c,
        MOUSEENTER: "mouseenter" + c,
        MOUSELEAVE: "mouseleave" + c
      },
      m = function (s) {
        function u() {
          return n(this, u), t(this, s.apply(this, arguments));
        }
        return e(u, s), u.prototype.isWithContent = function () {
          return this.getTitle() || this._getContent();
        }, u.prototype.getTipElement = function () {
          return this.tip = this.tip || r(this.config.template)[0];
        }, u.prototype.setContent = function () {
          var t = r(this.getTipElement());
          this.setElementContent(t.find(g.TITLE), this.getTitle()), this.setElementContent(t.find(g.CONTENT), this._getContent()), t.removeClass(_.FADE + " " + _.SHOW), this.cleanupTether();
        }, u.prototype._getContent = function () {
          return this.element.getAttribute("data-content") || ("function" == typeof this.config.content ? this.config.content.call(this.element) : this.config.content);
        }, u._jQueryInterface = function (t) {
          return this.each(function () {
            var e = r(this).data(h),
              n = "object" === ("undefined" == typeof t ? "undefined" : i(t)) ? t : null;
            if ((e || !/destroy|hide/.test(t)) && (e || (e = new u(this, n), r(this).data(h, e)), "string" == typeof t)) {
              if (void 0 === e[t]) throw new Error('No method named "' + t + '"');
              e[t]();
            }
          });
        }, o(u, null, [{
          key: "VERSION",
          get: function () {
            return l;
          }
        }, {
          key: "Default",
          get: function () {
            return d;
          }
        }, {
          key: "NAME",
          get: function () {
            return a;
          }
        }, {
          key: "DATA_KEY",
          get: function () {
            return h;
          }
        }, {
          key: "Event",
          get: function () {
            return p;
          }
        }, {
          key: "EVENT_KEY",
          get: function () {
            return c;
          }
        }, {
          key: "DefaultType",
          get: function () {
            return f;
          }
        }]), u;
      }(s);
    return r.fn[a] = m._jQueryInterface, r.fn[a].Constructor = m, r.fn[a].noConflict = function () {
      return r.fn[a] = u, m._jQueryInterface;
    }, m;
  })(jQuery);
}();

/***/ },

/***/ "./src/frontend/libs/imagesloaded.js"
/*!*******************************************!*\
  !*** ./src/frontend/libs/imagesloaded.js ***!
  \*******************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/*!
 * imagesLoaded PACKAGED v5.0.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

/**
 * EvEmitter v2.1.1
 * Lil' event emitter
 * MIT License
 */

(function (global, factory) {
  // universal module definition
  if ( true && module.exports) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }
})(typeof window != 'undefined' ? window : this, function () {
  function EvEmitter() {}
  let proto = EvEmitter.prototype;
  proto.on = function (eventName, listener) {
    if (!eventName || !listener) return this;

    // set events hash
    let events = this._events = this._events || {};
    // set listeners array
    let listeners = events[eventName] = events[eventName] || [];
    // only add once
    if (!listeners.includes(listener)) {
      listeners.push(listener);
    }
    return this;
  };
  proto.once = function (eventName, listener) {
    if (!eventName || !listener) return this;

    // add event
    this.on(eventName, listener);
    // set once flag
    // set onceEvents hash
    let onceEvents = this._onceEvents = this._onceEvents || {};
    // set onceListeners object
    let onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
    // set flag
    onceListeners[listener] = true;
    return this;
  };
  proto.off = function (eventName, listener) {
    let listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) return this;
    let index = listeners.indexOf(listener);
    if (index != -1) {
      listeners.splice(index, 1);
    }
    return this;
  };
  proto.emitEvent = function (eventName, args) {
    let listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) return this;

    // copy over to avoid interference if .off() in listener
    listeners = listeners.slice(0);
    args = args || [];
    // once stuff
    let onceListeners = this._onceEvents && this._onceEvents[eventName];
    for (let listener of listeners) {
      let isOnce = onceListeners && onceListeners[listener];
      if (isOnce) {
        // remove listener
        // remove before trigger to prevent recursion
        this.off(eventName, listener);
        // unset once flag
        delete onceListeners[listener];
      }
      // trigger listener
      listener.apply(this, args);
    }
    return this;
  };
  proto.allOff = function () {
    delete this._events;
    delete this._onceEvents;
    return this;
  };
  return EvEmitter;
});
/*!
 * imagesLoaded v5.0.0
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function (window, factory) {
  // universal module definition
  if ( true && module.exports) {
    // CommonJS
    module.exports = factory(window, __webpack_require__(/*! ev-emitter */ "./node_modules/ev-emitter/ev-emitter.js"));
  } else {
    // browser global
    window.imagesLoaded = factory(window, window.EvEmitter);
  }
})(typeof window !== 'undefined' ? window : this, function factory(window, EvEmitter) {
  let $ = window.jQuery;
  let console = window.console;

  // -------------------------- helpers -------------------------- //

  // turn element or nodeList into an array
  function makeArray(obj) {
    // use object if already an array
    if (Array.isArray(obj)) return obj;
    let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
    // convert nodeList to array
    if (isArrayLike) return [...obj];

    // array of single index
    return [obj];
  }

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {[Array, Element, NodeList, String]} elem
   * @param {[Object, Function]} options - if function, use as callback
   * @param {Function} onAlways - callback function
   * @returns {ImagesLoaded}
   */
  function ImagesLoaded(elem, options, onAlways) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if (!(this instanceof ImagesLoaded)) {
      return new ImagesLoaded(elem, options, onAlways);
    }
    // use elem as selector string
    let queryElem = elem;
    if (typeof elem == 'string') {
      queryElem = document.querySelectorAll(elem);
    }
    // bail if bad element
    if (!queryElem) {
      console.error(`Bad element for imagesLoaded ${queryElem || elem}`);
      return;
    }
    this.elements = makeArray(queryElem);
    this.options = {};
    // shift arguments if no options set
    if (typeof options == 'function') {
      onAlways = options;
    } else {
      Object.assign(this.options, options);
    }
    if (onAlways) this.on('always', onAlways);
    this.getImages();
    // add jQuery Deferred object
    if ($) this.jqDeferred = new $.Deferred();

    // HACK check async to allow time to bind listeners
    setTimeout(this.check.bind(this));
  }
  ImagesLoaded.prototype = Object.create(EvEmitter.prototype);
  ImagesLoaded.prototype.getImages = function () {
    this.images = [];

    // filter & find items if we have an item selector
    this.elements.forEach(this.addElementImages, this);
  };
  const elementNodeTypes = [1, 9, 11];

  /**
   * @param {Node} elem
   */
  ImagesLoaded.prototype.addElementImages = function (elem) {
    // filter siblings
    if (elem.nodeName === 'IMG') {
      this.addImage(elem);
    }
    // get background image on element
    if (this.options.background === true) {
      this.addElementBackgroundImages(elem);
    }

    // find children
    // no non-element nodes, #143
    let {
      nodeType
    } = elem;
    if (!nodeType || !elementNodeTypes.includes(nodeType)) return;
    let childImgs = elem.querySelectorAll('img');
    // concat childElems to filterFound array
    for (let img of childImgs) {
      this.addImage(img);
    }

    // get child background images
    if (typeof this.options.background == 'string') {
      let children = elem.querySelectorAll(this.options.background);
      for (let child of children) {
        this.addElementBackgroundImages(child);
      }
    }
  };
  const reURL = /url\((['"])?(.*?)\1\)/gi;
  ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
    let style = getComputedStyle(elem);
    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
    if (!style) return;

    // get url inside url("...")
    let matches = reURL.exec(style.backgroundImage);
    while (matches !== null) {
      let url = matches && matches[2];
      if (url) {
        this.addBackground(url, elem);
      }
      matches = reURL.exec(style.backgroundImage);
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function (img) {
    let loadingImage = new LoadingImage(img);
    this.images.push(loadingImage);
  };
  ImagesLoaded.prototype.addBackground = function (url, elem) {
    let background = new Background(url, elem);
    this.images.push(background);
  };
  ImagesLoaded.prototype.check = function () {
    this.progressedCount = 0;
    this.hasAnyBroken = false;
    // complete if no images
    if (!this.images.length) {
      this.complete();
      return;
    }

    /* eslint-disable-next-line func-style */
    let onProgress = (image, elem, message) => {
      // HACK - Chrome triggers event before object properties have changed. #83
      setTimeout(() => {
        this.progress(image, elem, message);
      });
    };
    this.images.forEach(function (loadingImage) {
      loadingImage.once('progress', onProgress);
      loadingImage.check();
    });
  };
  ImagesLoaded.prototype.progress = function (image, elem, message) {
    this.progressedCount++;
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // progress event
    this.emitEvent('progress', [this, image, elem]);
    if (this.jqDeferred && this.jqDeferred.notify) {
      this.jqDeferred.notify(this, image);
    }
    // check if completed
    if (this.progressedCount === this.images.length) {
      this.complete();
    }
    if (this.options.debug && console) {
      console.log(`progress: ${message}`, image, elem);
    }
  };
  ImagesLoaded.prototype.complete = function () {
    let eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    this.emitEvent(eventName, [this]);
    this.emitEvent('always', [this]);
    if (this.jqDeferred) {
      let jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
      this.jqDeferred[jqMethod](this);
    }
  };

  // --------------------------  -------------------------- //

  function LoadingImage(img) {
    this.img = img;
  }
  LoadingImage.prototype = Object.create(EvEmitter.prototype);
  LoadingImage.prototype.check = function () {
    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    let isComplete = this.getIsImageComplete();
    if (isComplete) {
      // report based on naturalWidth
      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    this.proxyImage = new Image();
    // add crossOrigin attribute. #204
    if (this.img.crossOrigin) {
      this.proxyImage.crossOrigin = this.img.crossOrigin;
    }
    this.proxyImage.addEventListener('load', this);
    this.proxyImage.addEventListener('error', this);
    // bind to image as well for Firefox. #191
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    this.proxyImage.src = this.img.currentSrc || this.img.src;
  };
  LoadingImage.prototype.getIsImageComplete = function () {
    // check for non-zero, non-undefined naturalWidth
    // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
    return this.img.complete && this.img.naturalWidth;
  };
  LoadingImage.prototype.confirm = function (isLoaded, message) {
    this.isLoaded = isLoaded;
    let {
      parentNode
    } = this.img;
    // emit progress with parent <picture> or self <img>
    let elem = parentNode.nodeName === 'PICTURE' ? parentNode : this.img;
    this.emitEvent('progress', [this, elem, message]);
  };

  // ----- events ----- //

  // trigger specified handler for event type
  LoadingImage.prototype.handleEvent = function (event) {
    let method = 'on' + event.type;
    if (this[method]) {
      this[method](event);
    }
  };
  LoadingImage.prototype.onload = function () {
    this.confirm(true, 'onload');
    this.unbindEvents();
  };
  LoadingImage.prototype.onerror = function () {
    this.confirm(false, 'onerror');
    this.unbindEvents();
  };
  LoadingImage.prototype.unbindEvents = function () {
    this.proxyImage.removeEventListener('load', this);
    this.proxyImage.removeEventListener('error', this);
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);
  };

  // -------------------------- Background -------------------------- //

  function Background(url, element) {
    this.url = url;
    this.element = element;
    this.img = new Image();
  }

  // inherit LoadingImage prototype
  Background.prototype = Object.create(LoadingImage.prototype);
  Background.prototype.check = function () {
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    this.img.src = this.url;
    // check if image is already complete
    let isComplete = this.getIsImageComplete();
    if (isComplete) {
      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
      this.unbindEvents();
    }
  };
  Background.prototype.unbindEvents = function () {
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);
  };
  Background.prototype.confirm = function (isLoaded, message) {
    this.isLoaded = isLoaded;
    this.emitEvent('progress', [this, this.element, message]);
  };

  // -------------------------- jQuery -------------------------- //

  ImagesLoaded.makeJQueryPlugin = function (jQuery) {
    jQuery = jQuery || window.jQuery;
    if (!jQuery) return;

    // set local variable
    $ = jQuery;
    // $().imagesLoaded()
    $.fn.imagesLoaded = function (options, onAlways) {
      let instance = new ImagesLoaded(this, options, onAlways);
      return instance.jqDeferred.promise($(this));
    };
  };
  // try making plugin
  ImagesLoaded.makeJQueryPlugin();

  // --------------------------  -------------------------- //

  return ImagesLoaded;
});

/***/ },

/***/ "./src/frontend/libs/jarallax.js"
/*!***************************************!*\
  !*** ./src/frontend/libs/jarallax.js ***!
  \***************************************/
(module) {

/*!
 * Jarallax v2.1.3 (https://github.com/nk-o/jarallax)
 * Copyright 2022 nK <https://nkdev.info>
 * Licensed under MIT (https://github.com/nk-o/jarallax/blob/master/LICENSE)
 */
(function (global, factory) {
   true ? module.exports = factory() : 0;
})(this, function () {
  "use strict";

  /**
   * Document ready callback.
   * @param {Function} callback - callback will be fired once Document ready.
   */
  function ready(callback) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      // Already ready or interactive, execute callback
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback, {
        capture: true,
        once: true,
        passive: true
      });
    }
  }

  /* eslint-disable import/no-mutable-exports */
  /* eslint-disable no-restricted-globals */
  let win;
  if (typeof window !== "undefined") {
    win = window;
  } else if (typeof globalThis !== "undefined") {
    win = globalThis;
  } else if (typeof self !== "undefined") {
    win = self;
  } else {
    win = {};
  }
  var global$1 = win;
  var defaults = {
    // Base parallax options.
    type: "scroll",
    speed: 0.5,
    containerClass: "jarallax-container",
    imgSrc: null,
    imgElement: ".jarallax-img",
    imgSize: "cover",
    imgPosition: "50% 50%",
    imgRepeat: "no-repeat",
    keepImg: false,
    elementInViewport: null,
    zIndex: -100,
    disableParallax: false,
    // Callbacks.
    onScroll: null,
    onInit: null,
    onDestroy: null,
    onCoverImage: null,
    // Video options.
    videoClass: "jarallax-video",
    videoSrc: null,
    videoStartTime: 0,
    videoEndTime: 0,
    videoVolume: 0,
    videoLoop: true,
    videoPlayOnlyVisible: true,
    videoLazyLoading: true,
    disableVideo: false,
    // Video callbacks.
    onVideoInsert: null,
    onVideoWorkerInit: null
  };

  /**
   * Add styles to element.
   *
   * @param {Element} el - element.
   * @param {String|Object} styles - styles list.
   *
   * @returns {Element}
   */
  function css(el, styles) {
    if (typeof styles === "string") {
      return global$1.getComputedStyle(el).getPropertyValue(styles);
    }
    Object.keys(styles).forEach(key => {
      el.style[key] = styles[key];
    });
    return el;
  }

  /**
   * Extend like jQuery.extend
   *
   * @param {Object} out - output object.
   * @param {...any} args - additional objects to extend.
   *
   * @returns {Object}
   */
  function extend(out, ...args) {
    out = out || {};
    Object.keys(args).forEach(i => {
      if (!args[i]) {
        return;
      }
      Object.keys(args[i]).forEach(key => {
        out[key] = args[i][key];
      });
    });
    return out;
  }

  /**
   * Get all parents of the element.
   *
   * @param {Element} elem - DOM element.
   *
   * @returns {Array}
   */
  function getParents(elem) {
    const parents = [];
    while (elem.parentElement !== null) {
      elem = elem.parentElement;
      if (elem.nodeType === 1) {
        parents.push(elem);
      }
    }
    return parents;
  }
  const {
    navigator: navigator$1
  } = global$1;
  const mobileAgent = /*#__PURE__*//Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator$1.userAgent);
  function isMobile() {
    return mobileAgent;
  }
  let wndW;
  let wndH;
  let $deviceHelper;

  /**
   * The most popular mobile browsers changes height after page scroll and this generates image jumping.
   * We can fix it using this workaround with vh units.
   */
  function getDeviceHeight() {
    if (!$deviceHelper && document.body) {
      $deviceHelper = document.createElement("div");
      $deviceHelper.style.cssText = "position: fixed; top: -9999px; left: 0; height: 100vh; width: 0;";
      document.body.appendChild($deviceHelper);
    }
    return ($deviceHelper ? $deviceHelper.clientHeight : 0) || global$1.innerHeight || document.documentElement.clientHeight;
  }
  function updateWindowHeight() {
    wndW = global$1.innerWidth || document.documentElement.clientWidth;
    if (isMobile()) {
      wndH = getDeviceHeight();
    } else {
      wndH = global$1.innerHeight || document.documentElement.clientHeight;
    }
  }
  updateWindowHeight();
  global$1.addEventListener("resize", updateWindowHeight);
  global$1.addEventListener("orientationchange", updateWindowHeight);
  global$1.addEventListener("load", updateWindowHeight);
  ready(() => {
    updateWindowHeight();
  });
  function getWindowSize() {
    return {
      width: wndW,
      height: wndH
    };
  }

  // List with all jarallax instances
  // need to render all in one scroll/resize event.
  const jarallaxList = [];
  function updateParallax() {
    if (!jarallaxList.length) {
      return;
    }
    const {
      width: wndW,
      height: wndH
    } = getWindowSize();
    jarallaxList.forEach((data, k) => {
      const {
        instance,
        oldData
      } = data;
      if (!instance.isVisible()) {
        return;
      }
      const clientRect = instance.$item.getBoundingClientRect();
      const newData = {
        width: clientRect.width,
        height: clientRect.height,
        top: clientRect.top,
        bottom: clientRect.bottom,
        wndW,
        wndH
      };
      const isResized = !oldData || oldData.wndW !== newData.wndW || oldData.wndH !== newData.wndH || oldData.width !== newData.width || oldData.height !== newData.height;
      const isScrolled = isResized || !oldData || oldData.top !== newData.top || oldData.bottom !== newData.bottom;
      jarallaxList[k].oldData = newData;
      if (isResized) {
        instance.onResize();
      }
      if (isScrolled) {
        instance.onScroll();
      }
    });
    global$1.requestAnimationFrame(updateParallax);
  }
  const visibilityObserver = /*#__PURE__*/new global$1.IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.jarallax.isElementInViewport = entry.isIntersecting;
    });
  }, {
    // We have to start parallax calculation before the block is in view
    // to prevent possible parallax jumping.
    rootMargin: "50px"
  });
  function addObserver(instance) {
    jarallaxList.push({
      instance
    });
    if (jarallaxList.length === 1) {
      global$1.requestAnimationFrame(updateParallax);
    }
    visibilityObserver.observe(instance.options.elementInViewport || instance.$item);
  }
  function removeObserver(instance) {
    jarallaxList.forEach((data, key) => {
      if (data.instance.instanceID === instance.instanceID) {
        jarallaxList.splice(key, 1);
      }
    });
    visibilityObserver.unobserve(instance.options.elementInViewport || instance.$item);
  }

  /* eslint-disable class-methods-use-this */
  const {
    navigator
  } = global$1;
  let instanceID = 0;

  // Jarallax class
  class Jarallax {
    constructor(item, userOptions) {
      const self = this;
      self.instanceID = instanceID;
      instanceID += 1;
      self.$item = item;
      self.defaults = {
        ...defaults
      };

      // prepare data-options
      const dataOptions = self.$item.dataset || {};
      const pureDataOptions = {};
      Object.keys(dataOptions).forEach(key => {
        const lowerCaseOption = key.substr(0, 1).toLowerCase() + key.substr(1);
        if (lowerCaseOption && typeof self.defaults[lowerCaseOption] !== "undefined") {
          pureDataOptions[lowerCaseOption] = dataOptions[key];
        }
      });
      self.options = self.extend({}, self.defaults, pureDataOptions, userOptions);
      self.pureOptions = self.extend({}, self.options);

      // prepare 'true' and 'false' strings to boolean
      Object.keys(self.options).forEach(key => {
        if (self.options[key] === "true") {
          self.options[key] = true;
        } else if (self.options[key] === "false") {
          self.options[key] = false;
        }
      });

      // fix speed option [-1.0, 2.0]
      self.options.speed = Math.min(2, Math.max(-1, parseFloat(self.options.speed)));

      // prepare disableParallax callback
      if (typeof self.options.disableParallax === "string") {
        self.options.disableParallax = new RegExp(self.options.disableParallax);
      }
      if (self.options.disableParallax instanceof RegExp) {
        const disableParallaxRegexp = self.options.disableParallax;
        self.options.disableParallax = () => disableParallaxRegexp.test(navigator.userAgent);
      }
      if (typeof self.options.disableParallax !== "function") {
        self.options.disableParallax = () => false;
      }

      // prepare disableVideo callback
      if (typeof self.options.disableVideo === "string") {
        self.options.disableVideo = new RegExp(self.options.disableVideo);
      }
      if (self.options.disableVideo instanceof RegExp) {
        const disableVideoRegexp = self.options.disableVideo;
        self.options.disableVideo = () => disableVideoRegexp.test(navigator.userAgent);
      }
      if (typeof self.options.disableVideo !== "function") {
        self.options.disableVideo = () => false;
      }

      // custom element to check if parallax in viewport
      let elementInVP = self.options.elementInViewport;
      // get first item from array
      if (elementInVP && typeof elementInVP === "object" && typeof elementInVP.length !== "undefined") {
        [elementInVP] = elementInVP;
      }
      // check if dom element
      if (!(elementInVP instanceof Element)) {
        elementInVP = null;
      }
      self.options.elementInViewport = elementInVP;
      self.image = {
        src: self.options.imgSrc || null,
        $container: null,
        useImgTag: false,
        // 1. Position fixed is needed for the most of browsers because absolute position have glitches
        // 2. On MacOS with smooth scroll there is a huge lags with absolute position - https://github.com/nk-o/jarallax/issues/75
        // 3. Previously used 'absolute' for mobile devices. But we re-tested on iPhone 12 and 'fixed' position is working better, then 'absolute', so for now position is always 'fixed'
        position: "fixed"
      };
      if (self.initImg() && self.canInitParallax()) {
        self.init();
      }
    }
    css(el, styles) {
      return css(el, styles);
    }
    extend(out, ...args) {
      return extend(out, ...args);
    }

    // get window size and scroll position. Useful for extensions
    getWindowData() {
      const {
        width,
        height
      } = getWindowSize();
      return {
        width,
        height,
        y: document.documentElement.scrollTop
      };
    }

    // Jarallax functions
    initImg() {
      const self = this;

      // find image element
      let $imgElement = self.options.imgElement;
      if ($imgElement && typeof $imgElement === "string") {
        $imgElement = self.$item.querySelector($imgElement);
      }

      // check if dom element
      if (!($imgElement instanceof Element)) {
        if (self.options.imgSrc) {
          $imgElement = new Image();
          $imgElement.src = self.options.imgSrc;
        } else {
          $imgElement = null;
        }
      }
      if ($imgElement) {
        if (self.options.keepImg) {
          self.image.$item = $imgElement.cloneNode(true);
        } else {
          self.image.$item = $imgElement;
          self.image.$itemParent = $imgElement.parentNode;
        }
        self.image.useImgTag = true;
      }

      // true if there is img tag
      if (self.image.$item) {
        return true;
      }

      // get image src
      if (self.image.src === null) {
        self.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        self.image.bgImage = self.css(self.$item, "background-image");
      }
      return !(!self.image.bgImage || self.image.bgImage === "none");
    }
    canInitParallax() {
      return !this.options.disableParallax();
    }
    init() {
      const self = this;
      const containerStyles = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden"
      };
      let imageStyles = {
        pointerEvents: "none",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden"
      };
      if (!self.options.keepImg) {
        // save default user styles
        const curStyle = self.$item.getAttribute("style");
        if (curStyle) {
          self.$item.setAttribute("data-jarallax-original-styles", curStyle);
        }
        if (self.image.useImgTag) {
          const curImgStyle = self.image.$item.getAttribute("style");
          if (curImgStyle) {
            self.image.$item.setAttribute("data-jarallax-original-styles", curImgStyle);
          }
        }
      }

      // set relative position and z-index to the parent
      if (self.css(self.$item, "position") === "static") {
        self.css(self.$item, {
          position: "relative"
        });
      }
      if (self.css(self.$item, "z-index") === "auto") {
        self.css(self.$item, {
          zIndex: 0
        });
      }

      // container for parallax image
      self.image.$container = document.createElement("div");
      self.css(self.image.$container, containerStyles);
      self.css(self.image.$container, {
        "z-index": self.options.zIndex
      });

      // it will remove some image overlapping
      // overlapping occur due to an image position fixed inside absolute position element
      // needed only when background in fixed position
      if (this.image.position === "fixed") {
        self.css(self.image.$container, {
          "-webkit-clip-path": "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          "clip-path": "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
        });
      }

      // Add container unique ID.
      self.image.$container.setAttribute("id", `jarallax-container-${self.instanceID}`);

      // Add container class.
      if (self.options.containerClass) {
        self.image.$container.setAttribute("class", self.options.containerClass);
      }
      self.$item.appendChild(self.image.$container);

      // use img tag
      if (self.image.useImgTag) {
        imageStyles = self.extend({
          "object-fit": self.options.imgSize,
          "object-position": self.options.imgPosition,
          "max-width": "none"
        }, containerStyles, imageStyles);

        // use div with background image
      } else {
        self.image.$item = document.createElement("div");
        if (self.image.src) {
          imageStyles = self.extend({
            "background-position": self.options.imgPosition,
            "background-size": self.options.imgSize,
            "background-repeat": self.options.imgRepeat,
            "background-image": self.image.bgImage || `url("${self.image.src}")`
          }, containerStyles, imageStyles);
        }
      }
      if (self.options.type === "opacity" || self.options.type === "scale" || self.options.type === "scale-opacity" || self.options.speed === 1) {
        self.image.position = "absolute";
      }

      // 1. Check if one of parents have transform style (without this check, scroll transform will be inverted if used parallax with position fixed)
      //    discussion - https://github.com/nk-o/jarallax/issues/9
      // 2. Check if parents have overflow scroll
      if (self.image.position === "fixed") {
        const $parents = getParents(self.$item).filter(el => {
          const styles = global$1.getComputedStyle(el);
          const parentTransform = styles["-webkit-transform"] || styles["-moz-transform"] || styles.transform;
          const overflowRegex = /(auto|scroll)/;
          return parentTransform && parentTransform !== "none" || overflowRegex.test(styles.overflow + styles["overflow-y"] + styles["overflow-x"]);
        });
        self.image.position = $parents.length ? "absolute" : "fixed";
      }

      // add position to parallax block
      imageStyles.position = self.image.position;

      // insert parallax image
      self.css(self.image.$item, imageStyles);
      self.image.$container.appendChild(self.image.$item);

      // set initial position and size
      self.onResize();
      self.onScroll(true);

      // call onInit event
      if (self.options.onInit) {
        self.options.onInit.call(self);
      }

      // remove default user background
      if (self.css(self.$item, "background-image") !== "none") {
        self.css(self.$item, {
          "background-image": "none"
        });
      }
      addObserver(self);
    }
    destroy() {
      const self = this;
      removeObserver(self);

      // return styles on container as before jarallax init
      const originalStylesTag = self.$item.getAttribute("data-jarallax-original-styles");
      self.$item.removeAttribute("data-jarallax-original-styles");
      // null occurs if there is no style tag before jarallax init
      if (!originalStylesTag) {
        self.$item.removeAttribute("style");
      } else {
        self.$item.setAttribute("style", originalStylesTag);
      }
      if (self.image.useImgTag) {
        // return styles on img tag as before jarallax init
        const originalStylesImgTag = self.image.$item.getAttribute("data-jarallax-original-styles");
        self.image.$item.removeAttribute("data-jarallax-original-styles");
        // null occurs if there is no style tag before jarallax init
        if (!originalStylesImgTag) {
          self.image.$item.removeAttribute("style");
        } else {
          self.image.$item.setAttribute("style", originalStylesTag);
        }

        // move img tag to its default position
        if (self.image.$itemParent) {
          self.image.$itemParent.appendChild(self.image.$item);
        }
      }

      // remove additional dom elements
      if (self.image.$container) {
        self.image.$container.parentNode.removeChild(self.image.$container);
      }

      // call onDestroy event
      if (self.options.onDestroy) {
        self.options.onDestroy.call(self);
      }

      // delete jarallax from item
      delete self.$item.jarallax;
    }
    coverImage() {
      const self = this;
      const {
        height: wndH
      } = getWindowSize();
      const rect = self.image.$container.getBoundingClientRect();
      const contH = rect.height;
      const {
        speed
      } = self.options;
      const isScroll = self.options.type === "scroll" || self.options.type === "scroll-opacity";
      let scrollDist = 0;
      let resultH = contH;
      let resultMT = 0;

      // scroll parallax
      if (isScroll) {
        // scroll distance and height for image
        if (speed < 0) {
          scrollDist = speed * Math.max(contH, wndH);
          if (wndH < contH) {
            scrollDist -= speed * (contH - wndH);
          }
        } else {
          scrollDist = speed * (contH + wndH);
        }

        // size for scroll parallax
        if (speed > 1) {
          resultH = Math.abs(scrollDist - wndH);
        } else if (speed < 0) {
          resultH = scrollDist / speed + Math.abs(scrollDist);
        } else {
          resultH += (wndH - contH) * (1 - speed);
        }
        scrollDist /= 2;
      }

      // store scroll distance
      self.parallaxScrollDistance = scrollDist;

      // vertical center
      if (isScroll) {
        resultMT = (wndH - resultH) / 2;
      } else {
        resultMT = (contH - resultH) / 2;
      }

      // apply result to item
      self.css(self.image.$item, {
        height: `${resultH}px`,
        marginTop: `${resultMT}px`,
        left: self.image.position === "fixed" ? `${rect.left}px` : "0",
        width: `${rect.width}px`
      });

      // call onCoverImage event
      if (self.options.onCoverImage) {
        self.options.onCoverImage.call(self);
      }

      // return some useful data. Used in the video cover function
      return {
        image: {
          height: resultH,
          marginTop: resultMT
        },
        container: rect
      };
    }
    isVisible() {
      return this.isElementInViewport || false;
    }
    onScroll(force) {
      const self = this;

      // stop calculations if item is not in viewport
      if (!force && !self.isVisible()) {
        return;
      }
      const {
        height: wndH
      } = getWindowSize();
      const rect = self.$item.getBoundingClientRect();
      const contT = rect.top;
      const contH = rect.height;
      const styles = {};

      // calculate parallax helping variables
      const beforeTop = Math.max(0, contT);
      const beforeTopEnd = Math.max(0, contH + contT);
      const afterTop = Math.max(0, -contT);
      const beforeBottom = Math.max(0, contT + contH - wndH);
      const beforeBottomEnd = Math.max(0, contH - (contT + contH - wndH));
      const afterBottom = Math.max(0, -contT + wndH - contH);
      const fromViewportCenter = 1 - 2 * ((wndH - contT) / (wndH + contH));

      // calculate on how percent of section is visible
      let visiblePercent = 1;
      if (contH < wndH) {
        visiblePercent = 1 - (afterTop || beforeBottom) / contH;
      } else if (beforeTopEnd <= wndH) {
        visiblePercent = beforeTopEnd / wndH;
      } else if (beforeBottomEnd <= wndH) {
        visiblePercent = beforeBottomEnd / wndH;
      }

      // opacity
      if (self.options.type === "opacity" || self.options.type === "scale-opacity" || self.options.type === "scroll-opacity") {
        styles.transform = "translate3d(0,0,0)";
        styles.opacity = visiblePercent;
      }

      // scale
      if (self.options.type === "scale" || self.options.type === "scale-opacity") {
        let scale = 1;
        if (self.options.speed < 0) {
          scale -= self.options.speed * visiblePercent;
        } else {
          scale += self.options.speed * (1 - visiblePercent);
        }
        styles.transform = `scale(${scale}) translate3d(0,0,0)`;
      }

      // scroll
      if (self.options.type === "scroll" || self.options.type === "scroll-opacity") {
        let positionY = self.parallaxScrollDistance * fromViewportCenter;

        // fix if parallax block in absolute position
        if (self.image.position === "absolute") {
          positionY -= contT;
        }
        styles.transform = `translate3d(0,${positionY}px,0)`;
      }
      self.css(self.image.$item, styles);

      // call onScroll event
      if (self.options.onScroll) {
        self.options.onScroll.call(self, {
          section: rect,
          beforeTop,
          beforeTopEnd,
          afterTop,
          beforeBottom,
          beforeBottomEnd,
          afterBottom,
          visiblePercent,
          fromViewportCenter
        });
      }
    }
    onResize() {
      this.coverImage();
    }
  }

  // global definition
  const jarallax = function (items, options, ...args) {
    // check for dom element
    // thanks: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    if (typeof HTMLElement === "object" ? items instanceof HTMLElement : items && typeof items === "object" && items !== null && items.nodeType === 1 && typeof items.nodeName === "string") {
      items = [items];
    }
    const len = items.length;
    let k = 0;
    let ret;
    for (k; k < len; k += 1) {
      if (typeof options === "object" || typeof options === "undefined") {
        if (!items[k].jarallax) {
          items[k].jarallax = new Jarallax(items[k], options);
        }
      } else if (items[k].jarallax) {
        // eslint-disable-next-line prefer-spread
        ret = items[k].jarallax[options].apply(items[k].jarallax, args);
      }
      if (typeof ret !== "undefined") {
        return ret;
      }
    }
    return items;
  };
  jarallax.constructor = Jarallax;
  const $ = global$1.jQuery;

  // jQuery support
  if (typeof $ !== "undefined") {
    const $Plugin = function (...args) {
      Array.prototype.unshift.call(args, this);
      const res = jarallax.apply(global$1, args);
      return typeof res !== "object" ? res : this;
    };
    $Plugin.constructor = jarallax.constructor;

    // no conflict
    const old$Plugin = $.fn.jarallax;
    $.fn.jarallax = $Plugin;
    $.fn.jarallax.noConflict = function () {
      $.fn.jarallax = old$Plugin;
      return this;
    };
  }

  // data-jarallax initialization
  ready(() => {
    jarallax(document.querySelectorAll("[data-jarallax]"));
  });
  return jarallax;
});

/***/ },

/***/ "./src/frontend/libs/jquery.backstretch/backstretch.js"
/*!*************************************************************!*\
  !*** ./src/frontend/libs/jquery.backstretch/backstretch.js ***!
  \*************************************************************/
() {

/*! Backstretch - v2.0.4 - 2013-06-19
* http://srobbin.com/jquery-plugins/backstretch/
* Copyright (c) 2013 Scott Robbin; Licensed MIT */

;
(function ($, window, undefined) {
  'use strict';

  /* PLUGIN DEFINITION
   * ========================= */
  $.fn.backstretch = function (images, options) {
    // We need at least one image or method name
    if (images === undefined || images.length === 0) {
      $.error("No images were supplied for Backstretch");
    }

    /*
     * Scroll the page one pixel to get the right window height on iOS
     * Pretty harmless for everyone else
    */
    if ($(window).scrollTop() === 0) {
      window.scrollTo(0, 0);
    }
    return this.each(function () {
      var $this = $(this),
        obj = $this.data('backstretch');

      // Do we already have an instance attached to this element?
      if (obj) {
        // Is this a method they're trying to execute?
        if (typeof images == 'string' && typeof obj[images] == 'function') {
          // Call the method
          obj[images](options);

          // No need to do anything further
          return;
        }

        // Merge the old options with the new
        options = $.extend(obj.options, options);

        // Remove the old instance
        obj.destroy(true);
      }
      obj = new Backstretch(this, images, options);
      $this.data('backstretch', obj);
    });
  };

  // If no element is supplied, we'll attach to body
  $.backstretch = function (images, options) {
    // Return the instance
    return $('body').backstretch(images, options).data('backstretch');
  };

  // Custom selector
  $.expr[':'].backstretch = function (elem) {
    return $(elem).data('backstretch') !== undefined;
  };

  /* DEFAULTS
   * ========================= */

  $.fn.backstretch.defaults = {
    centeredX: true // Should we center the image on the X axis?
    ,
    centeredY: true // Should we center the image on the Y axis?
    ,
    duration: 5000 // Amount of time in between slides (if slideshow)
    ,
    fade: 0 // Speed of fade transition between slides
  };

  /* STYLES
   * 
   * Baked-in styles that we'll apply to our elements.
   * In an effort to keep the plugin simple, these are not exposed as options.
   * That said, anyone can override these in their own stylesheet.
   * ========================= */
  var styles = {
    wrap: {
      left: 0,
      top: 0,
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      height: '100%',
      width: '100%',
      zIndex: -999999
    },
    img: {
      position: 'absolute',
      display: 'none',
      margin: 0,
      padding: 0,
      border: 'none',
      width: 'auto',
      height: 'auto',
      maxHeight: 'none',
      maxWidth: 'none',
      zIndex: -999999
    }
  };

  /* CLASS DEFINITION
   * ========================= */
  var Backstretch = function (container, images, options) {
    this.options = $.extend({}, $.fn.backstretch.defaults, options || {});

    /* In its simplest form, we allow Backstretch to be called on an image path.
     * e.g. $.backstretch('/path/to/image.jpg')
     * So, we need to turn this back into an array.
     */
    this.images = $.isArray(images) ? images : [images];

    // Preload images
    $.each(this.images, function () {
      $('<img />')[0].src = this;
    });

    // Convenience reference to know if the container is body.
    this.isBody = container === document.body;

    /* We're keeping track of a few different elements
     *
     * Container: the element that Backstretch was called on.
     * Wrap: a DIV that we place the image into, so we can hide the overflow.
     * Root: Convenience reference to help calculate the correct height.
     */
    this.$container = $(container);
    this.$root = this.isBody ? supportsFixedPosition ? $(window) : $(document) : this.$container;

    // Don't create a new wrap if one already exists (from a previous instance of Backstretch)
    var $existing = this.$container.children(".backstretch").first();
    this.$wrap = $existing.length ? $existing : $('<div class="backstretch"></div>').css(styles.wrap).appendTo(this.$container);

    // Non-body elements need some style adjustments
    if (!this.isBody) {
      // If the container is statically positioned, we need to make it relative,
      // and if no zIndex is defined, we should set it to zero.
      var position = this.$container.css('position'),
        zIndex = this.$container.css('zIndex');
      this.$container.css({
        position: position === 'static' ? 'relative' : position,
        zIndex: zIndex === 'auto' ? 0 : zIndex,
        background: 'none'
      });

      // Needs a higher z-index
      this.$wrap.css({
        zIndex: -999998
      });
    }

    // Fixed or absolute positioning?
    this.$wrap.css({
      position: this.isBody && supportsFixedPosition ? 'fixed' : 'absolute'
    });

    // Set the first image
    this.index = 0;
    this.show(this.index);

    // Listen for resize
    $(window).on('resize.backstretch', $.proxy(this.resize, this)).on('orientationchange.backstretch', $.proxy(function () {
      // Need to do this in order to get the right window height
      if (this.isBody && window.pageYOffset === 0) {
        window.scrollTo(0, 1);
        this.resize();
      }
    }, this));
  };

  /* PUBLIC METHODS
   * ========================= */
  Backstretch.prototype = {
    resize: function () {
      try {
        var bgCSS = {
            left: 0,
            top: 0
          },
          rootWidth = this.isBody ? this.$root.width() : this.$root.innerWidth(),
          bgWidth = rootWidth,
          rootHeight = this.isBody ? window.innerHeight ? window.innerHeight : this.$root.height() : this.$root.innerHeight(),
          bgHeight = bgWidth / this.$img.data('ratio'),
          bgOffset;

        // Make adjustments based on image ratio
        if (bgHeight >= rootHeight) {
          bgOffset = (bgHeight - rootHeight) / 2;
          if (this.options.centeredY) {
            bgCSS.top = '-' + bgOffset + 'px';
          }
        } else {
          bgHeight = rootHeight;
          bgWidth = bgHeight * this.$img.data('ratio');
          bgOffset = (bgWidth - rootWidth) / 2;
          if (this.options.centeredX) {
            bgCSS.left = '-' + bgOffset + 'px';
          }
        }
        this.$wrap.css({
          width: rootWidth,
          height: rootHeight
        }).find('img:not(.deleteable)').css({
          width: bgWidth,
          height: bgHeight
        }).css(bgCSS);
      } catch (err) {
        // IE7 seems to trigger resize before the image is loaded.
        // This try/catch block is a hack to let it fail gracefully.
      }
      return this;
    }

    // Show the slide at a certain position
    ,
    show: function (newIndex) {
      // Validate index
      if (Math.abs(newIndex) > this.images.length - 1) {
        return;
      }

      // Vars
      var self = this,
        oldImage = self.$wrap.find('img').addClass('deleteable'),
        evtOptions = {
          relatedTarget: self.$container[0]
        };

      // Trigger the "before" event
      self.$container.trigger($.Event('backstretch.before', evtOptions), [self, newIndex]);

      // Set the new index
      this.index = newIndex;

      // Pause the slideshow
      clearInterval(self.interval);

      // New image
      self.$img = $('<img />').css(styles.img).bind('load', function (e) {
        var imgWidth = this.width || $(e.target).width(),
          imgHeight = this.height || $(e.target).height();

        // Save the ratio
        $(this).data('ratio', imgWidth / imgHeight);

        // Show the image, then delete the old one
        // "speed" option has been deprecated, but we want backwards compatibilty
        $(this).fadeIn(self.options.speed || self.options.fade, function () {
          oldImage.remove();

          // Resume the slideshow
          if (!self.paused) {
            self.cycle();
          }

          // Trigger the "after" and "show" events
          // "show" is being deprecated
          $(['after', 'show']).each(function () {
            self.$container.trigger($.Event('backstretch.' + this, evtOptions), [self, newIndex]);
          });
        });

        // Resize
        self.resize();
      }).appendTo(self.$wrap);

      // Hack for IE img onload event
      self.$img.attr('src', self.images[newIndex]);
      return self;
    },
    next: function () {
      // Next slide
      return this.show(this.index < this.images.length - 1 ? this.index + 1 : 0);
    },
    prev: function () {
      // Previous slide
      return this.show(this.index === 0 ? this.images.length - 1 : this.index - 1);
    },
    pause: function () {
      // Pause the slideshow
      this.paused = true;
      return this;
    },
    resume: function () {
      // Resume the slideshow
      this.paused = false;
      this.next();
      return this;
    },
    cycle: function () {
      // Start/resume the slideshow
      if (this.images.length > 1) {
        // Clear the interval, just in case
        clearInterval(this.interval);
        this.interval = setInterval($.proxy(function () {
          // Check for paused slideshow
          if (!this.paused) {
            this.next();
          }
        }, this), this.options.duration);
      }
      return this;
    },
    destroy: function (preserveBackground) {
      // Stop the resize events
      $(window).off('resize.backstretch orientationchange.backstretch');

      // Clear the interval
      clearInterval(this.interval);

      // Remove Backstretch
      if (!preserveBackground) {
        this.$wrap.remove();
      }
      this.$container.removeData('backstretch');
    }
  };

  /* SUPPORTS FIXED POSITION?
   *
   * Based on code from jQuery Mobile 1.1.0
   * http://jquerymobile.com/
   *
   * In a nutshell, we need to figure out if fixed positioning is supported.
   * Unfortunately, this is very difficult to do on iOS, and usually involves
   * injecting content, scrolling the page, etc.. It's ugly.
   * jQuery Mobile uses this workaround. It's not ideal, but works.
   *
   * Modified to detect IE6
   * ========================= */

  var supportsFixedPosition = function () {
    var ua = navigator.userAgent,
      platform = navigator.platform
      // Rendering engine is Webkit, and capture major version
      ,
      wkmatch = ua.match(/AppleWebKit\/([0-9]+)/),
      wkversion = !!wkmatch && wkmatch[1],
      ffmatch = ua.match(/Fennec\/([0-9]+)/),
      ffversion = !!ffmatch && ffmatch[1],
      operammobilematch = ua.match(/Opera Mobi\/([0-9]+)/),
      omversion = !!operammobilematch && operammobilematch[1],
      iematch = ua.match(/MSIE ([0-9]+)/),
      ieversion = !!iematch && iematch[1];
    return !(
    // iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
    (platform.indexOf("iPhone") > -1 || platform.indexOf("iPad") > -1 || platform.indexOf("iPod") > -1) && wkversion && wkversion < 534 ||
    // Opera Mini
    window.operamini && {}.toString.call(window.operamini) === "[object OperaMini]" || operammobilematch && omversion < 7458 ||
    //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
    ua.indexOf("Android") > -1 && wkversion && wkversion < 533 ||
    // Firefox Mobile before 6.0 -
    ffversion && ffversion < 6 ||
    // WebOS less than 3
    "palmGetResource" in window && wkversion && wkversion < 534 ||
    // MeeGo
    ua.indexOf("MeeGo") > -1 && ua.indexOf("NokiaBrowser/8.5.0") > -1 ||
    // IE6
    ieversion && ieversion <= 6);
  }();
})(jQuery, window);

/***/ },

/***/ "./src/frontend/libs/jquery.bully.js"
/*!*******************************************!*\
  !*** ./src/frontend/libs/jquery.bully.js ***!
  \*******************************************/
() {

/*!
 * jQuery Bully Plugin v0.1.3
 * Examples and documentation at http://pixelgrade.github.io/rellax/
 * Copyright (c) 2016 PixelGrade http://www.pixelgrade.com
 * Licensed under MIT http://www.opensource.org/licenses/mit-license.php/
 */
(function ($, window, document, undefined) {
  if (typeof Onepress_Bully === 'undefined') {
    return;
  }
  var $window = $(window),
    windowHeight = $window.height(),
    elements = [],
    $bully,
    lastScrollY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0),
    current = 0,
    inversed = false,
    frameRendered = true;
  $bully = $('<div class="c-bully">').appendTo("body");
  if (Onepress_Bully.disable_mobile) {
    $bully.addClass('c-bully-hide-on-mobile');
  }
  $current = $('<div class="c-bully__bullet c-bully__bullet--active">').appendTo($bully);
  (function update() {
    if (frameRendered !== true) {
      var count = 0;
      var lastItemId = false;

      // Ty to to find item that bully over
      var _bt = $bully.offset().top;
      var _bh = $bully.height();
      var _bb = _bh + _bt;
      if ($("#masthead").hasClass("is-sticky")) {
        _bb -= $("#masthead").height();
      }
      if ($("#wpadminbar").length) {
        _bb -= $("#wpadminbar").height();
      }
      $.each(Onepress_Bully.sections, function (id, arg) {
        var element = $("#" + id);
        if (element.length) {
          var _et = element.offset().top;
          var _eh = element.height();
          var _eb = _eh + _et;
          if (_et <= _bt || _bb >= _eb || _bb >= _et && _eb > _bb) {
            lastItemId = id;
            if (arg.enable) {
              count = count + 1;
            }
          }
        }
      });

      // New insverse
      if (lastItemId && typeof Onepress_Bully.sections[lastItemId] !== "undefined") {
        if (Onepress_Bully.sections[lastItemId].inverse) {
          $bully.addClass("c-bully--inversed");
        } else {
          $bully.removeClass("c-bully--inversed");
        }
      }
      if (count !== current) {
        var activeBullet = $bully.find("#bully__" + lastItemId);
        var bullyOffset = $bully.offset();
        var offset = 0;
        if (activeBullet.length > 0) {
          offset = activeBullet.offset().top - bullyOffset.top;
        }
        var offset = $bully.children('.c-bully__bullet').not('.c-bully__bullet--active').first().outerHeight(true) * (count - 1);
        $current.removeClass("c-bully__bullet--squash");
        setTimeout(function () {
          $current.addClass("c-bully__bullet--squash");
        });
        $current.css("top", offset);
        current = count;
        $bully.find(".c-bully__bullet--pop").removeClass("c-bully__current");
        activeBullet.addClass("c-bully__current");
      }
    }
    window.requestAnimationFrame(update);
    frameRendered = true;
  })();
  function reloadAll() {
    $.each(elements, function (i, element) {
      element._reloadElement();
    });
  }
  function staggerClass($elements, classname, timeout) {
    $.each($elements, function (i, obj) {
      obj.$bullet.addClass(classname);
      /*
      	var stagger = i * timeout;
      		setTimeout( function() {
      		obj.$bullet.addClass( classname );
      	}, stagger );
      	*/
    });
  }
  $window.on("load", function (e) {
    staggerClass(elements, "c-bully__bullet--pop", 400);
    frameRendered = false;
  });
  $window.on("scroll", function (e) {
    if (frameRendered === true) {
      lastScrollY = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);
    }
    frameRendered = false;
  });
  $window.on("load resize", function () {
    reloadAll();
  });
  $(document).on("hero_ready", function () {
    reloadAll();
  });
  function Bully(element, options) {
    this.element = element;
    this.options = $.extend({}, $.fn.bully.defaults, options);
    var label = "";
    var id = element.id;
    var self = this,
      $bullet = $('<div id="bully__' + id + '" class="c-bully__bullet">');
    if (Onepress_Bully.enable_label) {
      if (id && typeof Onepress_Bully.sections[id] !== "undefined") {
        label = Onepress_Bully.sections[id].title;
      }
      if (label) {
        $bullet.append('<div class="c-bully__title">' + label + "</div>");
      }
    }
    $bullet.data("bully-data", self).appendTo($bully);
    $bullet.on("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      self.onClick();
    });
    this.$bullet = $bullet;
    self._reloadElement();
    elements.push(self);
    current = 0;
  }
  Bully.prototype = {
    constructor: Bully,
    _reloadElement: function () {
      this.offset = $(this.element).offset();
      this.height = $(this.element).outerHeight();
    },
    _calcTop: function (top) {
      // check if has sticky
      if ($("#masthead").hasClass("is-sticky")) {
        top -= $("#masthead").height();
      }
      if ($("#wpadminbar").length) {
        top -= $("#wpadminbar").height();
      }
      return top;
    },
    onClick: function () {
      var self = this,
        $target = $("html, body");
      if (self.options.scrollDuration == 0) {
        $target.scrollTop(this._calcTop(self.offset.top));
        return;
      }
      if (self.options.scrollDuration === "auto") {
        var duration = Math.abs(lastScrollY - self.offset.top) / (self.options.scrollPerSecond / 1000);
        $target.animate({
          scrollTop: this._calcTop(self.offset.top)
        }, duration);
        return;
      }
      $target.animate({
        scrollTop: this._calcTop(self.offset.top)
      }, self.options.scrollDuration);
    }
  };
  $.fn.bully = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + Bully)) {
        $.data(this, "plugin_" + Bully, new Bully(this, options));
      }
    });
  };
  $.fn.bully.defaults = {
    scrollDuration: "auto",
    scrollPerSecond: 4000,
    sections: {}
  };
  $window.on("rellax load", reloadAll);
  $.each(Onepress_Bully.sections, function (id, args) {
    if (args.enable) {
      const section = $("#" + id);
      if (section.length) {
        section.bully({
          scrollPerSecond: 3000
        });
      }
    }
  });
})(jQuery, window, document);

/***/ },

/***/ "./src/frontend/libs/jquery.counterup.js"
/*!***********************************************!*\
  !*** ./src/frontend/libs/jquery.counterup.js ***!
  \***********************************************/
() {

/*!
 * jquery.counterup.js 2.1.0
 *
 * Copyright 2013, Benjamin Intal http://gambit.ph @bfintal
 * Released under the GPL v2 License
 *
 * Amended by Jeremy Paris, Ciro Mattia Gonano and others
 *
 * Date: Feb 24, 2017
 */
(function ($) {
  "use strict";

  $.fn.counterUp = function (options) {
    // Defaults
    var settings = $.extend({
        time: 400,
        delay: 10,
        offset: 100,
        beginAt: 0,
        formatter: false,
        context: "window",
        callback: function () {}
      }, options),
      s;
    return this.each(function () {
      // Store the object
      var $this = $(this),
        counter = {
          time: $(this).data("counterup-time") || settings.time,
          delay: $(this).data("counterup-delay") || settings.delay,
          offset: $(this).data("counterup-offset") || settings.offset,
          beginAt: $(this).data("counterup-beginat") || settings.beginAt,
          context: $(this).data("counterup-context") || settings.context
        };
      var counterUpper = function () {
        var nums = [];
        var divisions = counter.time / counter.delay;
        var num = $this.attr("data-num") ? $this.attr("data-num") : $this.text();
        var isComma = /[0-9]+,[0-9]+/.test(num);
        num = num.replace(/,/g, "");
        var decimalPlaces = (num.split(".")[1] || []).length;
        if (counter.beginAt > num) counter.beginAt = num;
        var isTime = /[0-9]+:[0-9]+:[0-9]+/.test(num);

        // Convert time to total seconds
        if (isTime) {
          var times = num.split(":"),
            m = 1;
          s = 0;
          while (times.length > 0) {
            s += m * parseInt(times.pop(), 10);
            m *= 60;
          }
        }

        // Generate list of incremental numbers to display
        for (var i = divisions; i >= counter.beginAt / num * divisions; i--) {
          var newNum = parseFloat(num / divisions * i).toFixed(decimalPlaces);

          // Add incremental seconds and convert back to time
          if (isTime) {
            newNum = parseInt(s / divisions * i);
            var hours = parseInt(newNum / 3600) % 24;
            var minutes = parseInt(newNum / 60) % 60;
            var seconds = parseInt(newNum % 60, 10);
            newNum = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
          }

          // Preserve commas if input had commas
          if (isComma) {
            while (/(\d+)(\d{3})/.test(newNum.toString())) {
              newNum = newNum.toString().replace(/(\d+)(\d{3})/, "$1" + "," + "$2");
            }
          }
          if (settings.formatter) {
            newNum = settings.formatter.call(this, newNum);
          }
          nums.unshift(newNum);
        }
        $this.data("counterup-nums", nums);
        $this.text(counter.beginAt);

        // Updates the number until we're done
        var f = function () {
          if (!$this.data("counterup-nums")) {
            settings.callback.call(this);
            return;
          }
          $this.html($this.data("counterup-nums").shift());
          if ($this.data("counterup-nums").length) {
            setTimeout($this.data("counterup-func"), counter.delay);
          } else {
            $this.data("counterup-nums", null);
            $this.data("counterup-func", null);
            settings.callback.call(this);
          }
        };
        $this.data("counterup-func", f);

        // Start the count up
        setTimeout($this.data("counterup-func"), counter.delay);
      };

      // Perform counts when the element gets into view
      $this.waypoint(function (direction) {
        counterUpper();
        this.destroy(); //-- Waypoint 3.0 version of triggerOnce
      }, {
        offset: counter.offset + "%",
        context: counter.context
      });
    });
  };
})(jQuery);

/***/ },

/***/ "./src/frontend/libs/tether/global.js"
/*!********************************************!*\
  !*** ./src/frontend/libs/tether/global.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.js */ "./src/frontend/libs/tether/index.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_index_js__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Side-effect module that exposes Tether on the global scope.
 *
 * Bootstrap 4 alpha 6's Tooltip / Popover IIFEs run
 * `if (typeof Tether === "undefined") throw new Error(...)` at
 * module-evaluation time (the IIFE body, not the constructor) — so the
 * global must exist BEFORE `bootstrap.min.js` is evaluated.
 *
 * ES-module imports are evaluated in source order, but statements in
 * the importing module's body run AFTER all of that module's imports
 * have resolved. The previous fix put the assignment in the entry
 * module's body, which executed too late and made Bootstrap throw at
 * load. Wrapping the assignment in its own module turns it into a
 * side-effect import: it executes during the import-evaluation pass,
 * before bootstrap's IIFE runs, as long as it is imported first in
 * the entry file.
 */

window.Tether = (_index_js__WEBPACK_IMPORTED_MODULE_0___default());

/***/ },

/***/ "./src/frontend/libs/tether/index.js"
/*!*******************************************!*\
  !*** ./src/frontend/libs/tether/index.js ***!
  \*******************************************/
(module) {

/*! tether 2.0.0-beta.5 */

(function (global, factory) {
   true ? module.exports = factory() : 0;
})(this, function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   * @param {*} value The param to check if it is a function
   */
  function isFunction(value) {
    return typeof value === 'function';
  }
  /**
   * Checks if `value` is classified as a `Number` object.
   * @param {*} value The param to check if it is a number
   */

  function isNumber(value) {
    return typeof value === 'number';
  }
  /**
   * Checks if `value` is classified as an `Object`.
   * @param {*} value The param to check if it is an object
   */

  function isObject(value) {
    return typeof value === 'object';
  }
  /**
   * Checks if `value` is classified as a `String` object.
   * @param {*} value The param to check if it is a string
   */

  function isString(value) {
    return typeof value === 'string';
  }
  /**
   * Checks if `value` is undefined.
   * @param {*} value The param to check if it is undefined
   */

  function isUndefined(value) {
    return value === undefined;
  }
  function addClass(el, name) {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.add(cls);
      }
    });
  }
  /**
   * Get class string based on previously determined classes
   * @param  {String} [key=''] - default value for the classes object
   * @param  {Object} classes
   * @param  {String} classPrefix
   */

  function getClass(key, classes, classPrefix) {
    if (key === void 0) {
      key = '';
    }
    if (!isUndefined(classes) && !isUndefined(classes[key])) {
      if (classes[key] === false) {
        return '';
      }
      return classes[key];
    } else if (classPrefix) {
      return classPrefix + "-" + key;
    } else {
      return key;
    }
  }
  function removeClass(el, name) {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.remove(cls);
      }
    });
  }
  function updateClasses(el, add, all) {
    // Of the set of 'all' classes, we need the 'add' classes, and only the
    // 'add' classes to be set.
    all.forEach(function (cls) {
      if (add.indexOf(cls) === -1 && el.classList.contains(cls)) {
        removeClass(el, cls);
      }
    });
    add.forEach(function (cls) {
      if (!el.classList.contains(cls)) {
        addClass(el, cls);
      }
    });
  }
  var deferred = [];
  function defer(fn) {
    deferred.push(fn);
  }
  function flush() {
    var fn; // eslint-disable-next-line

    while (fn = deferred.pop()) {
      fn();
    }
  }
  var _scrollBarSize = null;
  function extend(out) {
    if (out === void 0) {
      out = {};
    }
    var args = [];
    Array.prototype.push.apply(args, arguments);
    args.slice(1).forEach(function (obj) {
      if (obj) {
        for (var key in obj) {
          if ({}.hasOwnProperty.call(obj, key)) {
            out[key] = obj[key];
          }
        }
      }
    });
    return out;
  }
  function getScrollBarSize() {
    if (_scrollBarSize) {
      return _scrollBarSize;
    }
    var inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '200px';
    var outer = document.createElement('div');
    extend(outer.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      visibility: 'hidden',
      width: '200px',
      height: '150px',
      overflow: 'hidden'
    });
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var widthContained = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var widthScroll = inner.offsetWidth;
    if (widthContained === widthScroll) {
      widthScroll = outer.clientWidth;
    }
    document.body.removeChild(outer);
    var width = widthContained - widthScroll;
    _scrollBarSize = {
      width: width,
      height: width
    };
    return _scrollBarSize;
  }
  var uniqueId = function () {
    var id = 0;
    return function () {
      return ++id;
    };
  }();
  var zeroPosCache = {};
  var zeroElement = null;
  function getBounds(body, el) {
    var doc;
    if (el === document) {
      doc = document;
      el = document.documentElement;
    } else {
      doc = el.ownerDocument;
    }
    var docEl = doc.documentElement;
    var box = _getActualBoundingClientRect(el);
    var origin = _getOrigin(body);
    box.top -= origin.top;
    box.left -= origin.left;
    if (isUndefined(box.width)) {
      box.width = document.body.scrollWidth - box.left - box.right;
    }
    if (isUndefined(box.height)) {
      box.height = document.body.scrollHeight - box.top - box.bottom;
    }
    box.top = box.top - docEl.clientTop;
    box.left = box.left - docEl.clientLeft;
    box.right = doc.body.clientWidth - box.width - box.left;
    box.bottom = doc.body.clientHeight - box.height - box.top;
    return box;
  }
  /**
   * Gets bounds for when target modifiier is 'scroll-handle'
   * @param target
   * @return {{left: number, width: number, height: number}}
   */

  function getScrollHandleBounds(body, target) {
    var bounds; // We have to do the check for the scrollTop and if target === document.body here and set to variables
    // because we may reset target below.

    var targetScrollTop = target.scrollTop;
    var targetIsBody = target === document.body;
    if (targetIsBody) {
      target = document.documentElement;
      bounds = {
        left: pageXOffset,
        top: pageYOffset,
        height: innerHeight,
        width: innerWidth
      };
    } else {
      bounds = getBounds(body, target);
    }
    var style = getComputedStyle(target);
    var hasBottomScroll = target.scrollWidth > target.clientWidth || [style.overflow, style.overflowX].indexOf('scroll') >= 0 || !targetIsBody;
    var scrollBottom = 0;
    if (hasBottomScroll) {
      scrollBottom = 15;
    }
    var height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;
    var out = {
      width: 15,
      height: height * 0.975 * (height / target.scrollHeight),
      left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
    };
    var fitAdj = 0;
    if (height < 408 && targetIsBody) {
      fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
    }
    if (!targetIsBody) {
      out.height = Math.max(out.height, 24);
    }
    var scrollPercentage = targetScrollTop / (target.scrollHeight - height);
    out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);
    if (targetIsBody) {
      out.height = Math.max(out.height, 24);
    }
    return out;
  }
  /**
   * Gets bounds for when target modifiier is 'visible
   * @param target
   * @return {{top: *, left: *, width: *, height: *}}
   */

  function getVisibleBounds(body, target) {
    if (target === document.body) {
      return {
        top: pageYOffset,
        left: pageXOffset,
        height: innerHeight,
        width: innerWidth
      };
    } else {
      var bounds = getBounds(body, target);
      var out = {
        height: bounds.height,
        width: bounds.width,
        top: bounds.top,
        left: bounds.left
      };
      out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
      out.height = Math.min(out.height, bounds.height - (bounds.top + bounds.height - (pageYOffset + innerHeight)));
      out.height = Math.min(innerHeight, out.height);
      out.height -= 2;
      out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
      out.width = Math.min(out.width, bounds.width - (bounds.left + bounds.width - (pageXOffset + innerWidth)));
      out.width = Math.min(innerWidth, out.width);
      out.width -= 2;
      if (out.top < pageYOffset) {
        out.top = pageYOffset;
      }
      if (out.left < pageXOffset) {
        out.left = pageXOffset;
      }
      return out;
    }
  }
  function removeUtilElements(body) {
    if (zeroElement) {
      body.removeChild(zeroElement);
    }
    zeroElement = null;
  }
  /**
   * Same as native getBoundingClientRect, except it takes into account parent <frame> offsets
   * if the element lies within a nested document (<frame> or <iframe>-like).
   * @param node
   */

  function _getActualBoundingClientRect(node) {
    var boundingRect = node.getBoundingClientRect(); // The original object returned by getBoundingClientRect is immutable, so we clone it
    // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9

    var rect = {};
    for (var k in boundingRect) {
      rect[k] = boundingRect[k];
    }
    try {
      if (node.ownerDocument !== document) {
        var frameElement = node.ownerDocument.defaultView.frameElement;
        if (frameElement) {
          var frameRect = _getActualBoundingClientRect(frameElement);
          rect.top += frameRect.top;
          rect.bottom += frameRect.top;
          rect.left += frameRect.left;
          rect.right += frameRect.left;
        }
      }
    } catch (err) {// Ignore "Access is denied" in IE11/Edge
    }
    return rect;
  }
  function _getOrigin(body) {
    // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
    // jitter as the user scrolls that messes with our ability to detect if two positions
    // are equivilant or not.  We place an element at the top left of the page that will
    // get the same jitter, so we can cancel the two out.
    var node = zeroElement;
    if (!node || !body.contains(node)) {
      node = document.createElement('div');
      node.setAttribute('data-tether-id', uniqueId());
      extend(node.style, {
        top: 0,
        left: 0,
        position: 'absolute'
      });
      body.appendChild(node);
      zeroElement = node;
    }
    var id = node.getAttribute('data-tether-id');
    if (isUndefined(zeroPosCache[id])) {
      zeroPosCache[id] = _getActualBoundingClientRect(node); // Clear the cache when this position call is done

      defer(function () {
        delete zeroPosCache[id];
      });
    }
    return zeroPosCache[id];
  }
  var Abutment = {
    position: function position(_ref) {
      var _this = this;
      var top = _ref.top,
        left = _ref.left;
      var _this$cache = this.cache('element-bounds', function () {
          return getBounds(_this.element);
        }),
        height = _this$cache.height,
        width = _this$cache.width;
      var targetPos = this.getTargetBounds();
      var bottom = top + height;
      var right = left + width;
      var abutted = [];
      if (top <= targetPos.bottom && bottom >= targetPos.top) {
        ['left', 'right'].forEach(function (side) {
          var targetPosSide = targetPos[side];
          if (targetPosSide === left || targetPosSide === right) {
            abutted.push(side);
          }
        });
      }
      if (left <= targetPos.right && right >= targetPos.left) {
        ['top', 'bottom'].forEach(function (side) {
          var targetPosSide = targetPos[side];
          if (targetPosSide === top || targetPosSide === bottom) {
            abutted.push(side);
          }
        });
      }
      var sides = ['left', 'top', 'right', 'bottom'];
      var _this$options = this.options,
        classes = _this$options.classes,
        classPrefix = _this$options.classPrefix;
      this.all.push(getClass('abutted', classes, classPrefix));
      sides.forEach(function (side) {
        _this.all.push(getClass('abutted', classes, classPrefix) + "-" + side);
      });
      if (abutted.length) {
        this.add.push(getClass('abutted', classes, classPrefix));
      }
      abutted.forEach(function (side) {
        _this.add.push(getClass('abutted', classes, classPrefix) + "-" + side);
      });
      defer(function () {
        if (!(_this.options.addTargetClasses === false)) {
          updateClasses(_this.target, _this.add, _this.all);
        }
        updateClasses(_this.element, _this.add, _this.all);
      });
      return true;
    }
  };
  var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];
  /**
   * Returns an array of bounds of the format [left, top, right, bottom]
   * @param tether
   * @param to
   * @return {*[]|HTMLElement|ActiveX.IXMLDOMElement}
   */

  function getBoundingRect(body, tether, to) {
    // arg to is required
    if (!to) {
      return null;
    }
    if (to === 'scrollParent') {
      to = tether.scrollParents[0];
    } else if (to === 'window') {
      to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
    }
    if (to === document) {
      to = to.documentElement;
    }
    if (!isUndefined(to.nodeType)) {
      var node = to;
      var size = getBounds(body, to);
      var pos = size;
      var style = getComputedStyle(to);
      to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top]; // Account any parent Frames scroll offset

      if (node.ownerDocument !== document) {
        var win = node.ownerDocument.defaultView;
        to[0] += win.pageXOffset;
        to[1] += win.pageYOffset;
        to[2] += win.pageXOffset;
        to[3] += win.pageYOffset;
      }
      BOUNDS_FORMAT.forEach(function (side, i) {
        side = side[0].toUpperCase() + side.substr(1);
        if (side === 'Top' || side === 'Left') {
          to[i] += parseFloat(style["border" + side + "Width"]);
        } else {
          to[i] -= parseFloat(style["border" + side + "Width"]);
        }
      });
    }
    return to;
  }
  /**
   * Add out of bounds classes to the list of classes we add to tether
   * @param {string[]} oob An array of directions that are out of bounds
   * @param {string[]} addClasses The array of classes to add to Tether
   * @param {string[]} classes The array of class types for Tether
   * @param {string} classPrefix The prefix to add to the front of the class
   * @param {string} outOfBoundsClass The class to apply when out of bounds
   * @private
   */

  function _addOutOfBoundsClass(oob, addClasses, classes, classPrefix, outOfBoundsClass) {
    if (oob.length) {
      var oobClass;
      if (!isUndefined(outOfBoundsClass)) {
        oobClass = outOfBoundsClass;
      } else {
        oobClass = getClass('out-of-bounds', classes, classPrefix);
      }
      addClasses.push(oobClass);
      oob.forEach(function (side) {
        addClasses.push(oobClass + "-" + side);
      });
    }
  }
  /**
   * Calculates if out of bounds or pinned in the X direction.
   *
   * @param {number} left
   * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
   * @param {number} width
   * @param pin
   * @param pinned
   * @param {string[]} oob
   * @return {number}
   * @private
   */

  function _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob) {
    if (left < bounds[0]) {
      if (pin.indexOf('left') >= 0) {
        left = bounds[0];
        pinned.push('left');
      } else {
        oob.push('left');
      }
    }
    if (left + width > bounds[2]) {
      if (pin.indexOf('right') >= 0) {
        left = bounds[2] - width;
        pinned.push('right');
      } else {
        oob.push('right');
      }
    }
    return left;
  }
  /**
   * Calculates if out of bounds or pinned in the Y direction.
   *
   * @param {number} top
   * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
   * @param {number} height
   * @param pin
   * @param {string[]} pinned
   * @param {string[]} oob
   * @return {number}
   * @private
   */

  function _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob) {
    if (top < bounds[1]) {
      if (pin.indexOf('top') >= 0) {
        top = bounds[1];
        pinned.push('top');
      } else {
        oob.push('top');
      }
    }
    if (top + height > bounds[3]) {
      if (pin.indexOf('bottom') >= 0) {
        top = bounds[3] - height;
        pinned.push('bottom');
      } else {
        oob.push('bottom');
      }
    }
    return top;
  }
  /**
   * Flip X "together"
   * @param {object} tAttachment The target attachment
   * @param {object} eAttachment The element attachment
   * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
   * @param {number} width
   * @param targetWidth
   * @param {number} left
   * @private
   */

  function _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left) {
    if (left < bounds[0] && tAttachment.left === 'left') {
      if (eAttachment.left === 'right') {
        left += targetWidth;
        tAttachment.left = 'right';
        left += width;
        eAttachment.left = 'left';
      } else if (eAttachment.left === 'left') {
        left += targetWidth;
        tAttachment.left = 'right';
        left -= width;
        eAttachment.left = 'right';
      }
    } else if (left + width > bounds[2] && tAttachment.left === 'right') {
      if (eAttachment.left === 'left') {
        left -= targetWidth;
        tAttachment.left = 'left';
        left -= width;
        eAttachment.left = 'right';
      } else if (eAttachment.left === 'right') {
        left -= targetWidth;
        tAttachment.left = 'left';
        left += width;
        eAttachment.left = 'left';
      }
    } else if (tAttachment.left === 'center') {
      if (left + width > bounds[2] && eAttachment.left === 'left') {
        left -= width;
        eAttachment.left = 'right';
      } else if (left < bounds[0] && eAttachment.left === 'right') {
        left += width;
        eAttachment.left = 'left';
      }
    }
    return left;
  }
  /**
   * Flip Y "together"
   * @param {object} tAttachment The target attachment
   * @param {object} eAttachment The element attachment
   * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
   * @param {number} height
   * @param targetHeight
   * @param {number} top
   * @private
   */

  function _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top) {
    if (tAttachment.top === 'top') {
      if (eAttachment.top === 'bottom' && top < bounds[1]) {
        top += targetHeight;
        tAttachment.top = 'bottom';
        top += height;
        eAttachment.top = 'top';
      } else if (eAttachment.top === 'top' && top + height > bounds[3] && top - (height - targetHeight) >= bounds[1]) {
        top -= height - targetHeight;
        tAttachment.top = 'bottom';
        eAttachment.top = 'bottom';
      }
    }
    if (tAttachment.top === 'bottom') {
      if (eAttachment.top === 'top' && top + height > bounds[3]) {
        top -= targetHeight;
        tAttachment.top = 'top';
        top -= height;
        eAttachment.top = 'bottom';
      } else if (eAttachment.top === 'bottom' && top < bounds[1] && top + (height * 2 - targetHeight) <= bounds[3]) {
        top += height - targetHeight;
        tAttachment.top = 'top';
        eAttachment.top = 'top';
      }
    }
    if (tAttachment.top === 'middle') {
      if (top + height > bounds[3] && eAttachment.top === 'top') {
        top -= height;
        eAttachment.top = 'bottom';
      } else if (top < bounds[1] && eAttachment.top === 'bottom') {
        top += height;
        eAttachment.top = 'top';
      }
    }
    return top;
  }
  /**
   * Get all the initial classes
   * @param classes
   * @param {string} classPrefix
   * @param constraints
   * @return {[*, *]}
   * @private
   */

  function _getAllClasses(classes, classPrefix, constraints) {
    var allClasses = [getClass('pinned', classes, classPrefix), getClass('out-of-bounds', classes, classPrefix)];
    constraints.forEach(function (constraint) {
      var outOfBoundsClass = constraint.outOfBoundsClass,
        pinnedClass = constraint.pinnedClass;
      if (outOfBoundsClass) {
        allClasses.push(outOfBoundsClass);
      }
      if (pinnedClass) {
        allClasses.push(pinnedClass);
      }
    });
    allClasses.forEach(function (cls) {
      ['left', 'top', 'right', 'bottom'].forEach(function (side) {
        allClasses.push(cls + "-" + side);
      });
    });
    return allClasses;
  }
  var Constraint = {
    position: function position(_ref) {
      var _this = this;
      var top = _ref.top,
        left = _ref.left,
        targetAttachment = _ref.targetAttachment;
      if (!this.options.constraints) {
        return true;
      }
      var _this$cache = this.cache('element-bounds', function () {
          return getBounds(_this.bodyElement, _this.element);
        }),
        height = _this$cache.height,
        width = _this$cache.width;
      if (width === 0 && height === 0 && !isUndefined(this.lastSize)) {
        // Handle the item getting hidden as a result of our positioning without glitching
        // the classes in and out
        var _this$lastSize = this.lastSize;
        width = _this$lastSize.width;
        height = _this$lastSize.height;
      }
      var targetSize = this.cache('target-bounds', function () {
        return _this.getTargetBounds();
      });
      var targetHeight = targetSize.height,
        targetWidth = targetSize.width;
      var _this$options = this.options,
        classes = _this$options.classes,
        classPrefix = _this$options.classPrefix;
      var allClasses = _getAllClasses(classes, classPrefix, this.options.constraints);
      var addClasses = [];
      var tAttachment = extend({}, targetAttachment);
      var eAttachment = extend({}, this.attachment);
      this.options.constraints.forEach(function (constraint) {
        var to = constraint.to,
          attachment = constraint.attachment,
          pin = constraint.pin;
        if (isUndefined(attachment)) {
          attachment = '';
        }
        var changeAttachX, changeAttachY;
        if (attachment.indexOf(' ') >= 0) {
          var _attachment$split = attachment.split(' ');
          changeAttachY = _attachment$split[0];
          changeAttachX = _attachment$split[1];
        } else {
          changeAttachX = changeAttachY = attachment;
        }
        var bounds = getBoundingRect(_this.bodyElement, _this, to);
        if (changeAttachY === 'target' || changeAttachY === 'both') {
          if (top < bounds[1] && tAttachment.top === 'top') {
            top += targetHeight;
            tAttachment.top = 'bottom';
          }
          if (top + height > bounds[3] && tAttachment.top === 'bottom') {
            top -= targetHeight;
            tAttachment.top = 'top';
          }
        }
        if (changeAttachY === 'together') {
          top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        }
        if (changeAttachX === 'target' || changeAttachX === 'both') {
          if (left < bounds[0] && tAttachment.left === 'left') {
            left += targetWidth;
            tAttachment.left = 'right';
          }
          if (left + width > bounds[2] && tAttachment.left === 'right') {
            left -= targetWidth;
            tAttachment.left = 'left';
          }
        }
        if (changeAttachX === 'together') {
          left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
        }
        if (changeAttachY === 'element' || changeAttachY === 'both') {
          if (top < bounds[1] && eAttachment.top === 'bottom') {
            top += height;
            eAttachment.top = 'top';
          }
          if (top + height > bounds[3] && eAttachment.top === 'top') {
            top -= height;
            eAttachment.top = 'bottom';
          }
        }
        if (changeAttachX === 'element' || changeAttachX === 'both') {
          if (left < bounds[0]) {
            if (eAttachment.left === 'right') {
              left += width;
              eAttachment.left = 'left';
            } else if (eAttachment.left === 'center') {
              left += width / 2;
              eAttachment.left = 'left';
            }
          }
          if (left + width > bounds[2]) {
            if (eAttachment.left === 'left') {
              left -= width;
              eAttachment.left = 'right';
            } else if (eAttachment.left === 'center') {
              left -= width / 2;
              eAttachment.left = 'right';
            }
          }
        }
        if (isString(pin)) {
          pin = pin.split(',').map(function (p) {
            return p.trim();
          });
        } else if (pin === true) {
          pin = ['top', 'left', 'right', 'bottom'];
        }
        pin = pin || [];
        var pinned = [];
        var oob = [];
        left = _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob);
        top = _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob);
        if (pinned.length) {
          var pinnedClass;
          if (!isUndefined(_this.options.pinnedClass)) {
            pinnedClass = _this.options.pinnedClass;
          } else {
            pinnedClass = getClass('pinned', classes, classPrefix);
          }
          addClasses.push(pinnedClass);
          pinned.forEach(function (side) {
            addClasses.push(pinnedClass + "-" + side);
          });
        }
        _addOutOfBoundsClass(oob, addClasses, classes, classPrefix, _this.options.outOfBoundsClass);
        if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
          eAttachment.left = tAttachment.left = false;
        }
        if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
          eAttachment.top = tAttachment.top = false;
        }
        if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
          _this.updateAttachClasses(eAttachment, tAttachment);
          _this.trigger('update', {
            attachment: eAttachment,
            targetAttachment: tAttachment
          });
        }
      });
      defer(function () {
        if (!(_this.options.addTargetClasses === false)) {
          updateClasses(_this.target, addClasses, allClasses);
        }
        updateClasses(_this.element, addClasses, allClasses);
      });
      return {
        top: top,
        left: left
      };
    }
  };
  var Shift = {
    position: function position(_ref) {
      var top = _ref.top,
        left = _ref.left;
      if (!this.options.shift) {
        return;
      }
      var shift = this.options.shift;
      if (isFunction(shift)) {
        shift = shift.call(this, {
          top: top,
          left: left
        });
      }
      var shiftTop, shiftLeft;
      if (isString(shift)) {
        shift = shift.split(' ');
        shift[1] = shift[1] || shift[0];
        var _shift = shift;
        shiftTop = _shift[0];
        shiftLeft = _shift[1];
        shiftTop = parseFloat(shiftTop, 10);
        shiftLeft = parseFloat(shiftLeft, 10);
      } else {
        var _ref2 = [shift.top, shift.left];
        shiftTop = _ref2[0];
        shiftLeft = _ref2[1];
      }
      top += shiftTop;
      left += shiftLeft;
      return {
        top: top,
        left: left
      };
    }
  };
  var Evented = /*#__PURE__*/function () {
    function Evented() {}
    var _proto = Evented.prototype;
    _proto.on = function on(event, handler, ctx, once) {
      if (once === void 0) {
        once = false;
      }
      if (isUndefined(this.bindings)) {
        this.bindings = {};
      }
      if (isUndefined(this.bindings[event])) {
        this.bindings[event] = [];
      }
      this.bindings[event].push({
        handler: handler,
        ctx: ctx,
        once: once
      });
      return this;
    };
    _proto.once = function once(event, handler, ctx) {
      return this.on(event, handler, ctx, true);
    };
    _proto.off = function off(event, handler) {
      var _this = this;
      if (isUndefined(this.bindings) || isUndefined(this.bindings[event])) {
        return this;
      }
      if (isUndefined(handler)) {
        delete this.bindings[event];
      } else {
        this.bindings[event].forEach(function (binding, index) {
          if (binding.handler === handler) {
            _this.bindings[event].splice(index, 1);
          }
        });
      }
      return this;
    };
    _proto.trigger = function trigger(event) {
      var _this2 = this;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (!isUndefined(this.bindings) && this.bindings[event]) {
        this.bindings[event].forEach(function (binding, index) {
          var ctx = binding.ctx,
            handler = binding.handler,
            once = binding.once;
          var context = ctx || _this2;
          handler.apply(context, args);
          if (once) {
            _this2.bindings[event].splice(index, 1);
          }
        });
      }
      return this;
    };
    return Evented;
  }();
  var MIRROR_LR = {
    center: 'center',
    left: 'right',
    right: 'left'
  };
  var MIRROR_TB = {
    middle: 'middle',
    top: 'bottom',
    bottom: 'top'
  };
  var OFFSET_MAP = {
    top: 0,
    left: 0,
    middle: '50%',
    center: '50%',
    bottom: '100%',
    right: '100%'
  };
  function addOffset() {
    var out = {
      top: 0,
      left: 0
    };
    for (var _len = arguments.length, offsets = new Array(_len), _key = 0; _key < _len; _key++) {
      offsets[_key] = arguments[_key];
    }
    offsets.forEach(function (_ref) {
      var top = _ref.top,
        left = _ref.left;
      if (isString(top)) {
        top = parseFloat(top);
      }
      if (isString(left)) {
        left = parseFloat(left);
      }
      out.top += top;
      out.left += left;
    });
    return out;
  }
  function attachmentToOffset(attachment) {
    var left = attachment.left,
      top = attachment.top;
    if (!isUndefined(OFFSET_MAP[attachment.left])) {
      left = OFFSET_MAP[attachment.left];
    }
    if (!isUndefined(OFFSET_MAP[attachment.top])) {
      top = OFFSET_MAP[attachment.top];
    }
    return {
      left: left,
      top: top
    };
  }
  function autoToFixedAttachment(attachment, relativeToAttachment) {
    var left = attachment.left,
      top = attachment.top;
    if (left === 'auto') {
      left = MIRROR_LR[relativeToAttachment.left];
    }
    if (top === 'auto') {
      top = MIRROR_TB[relativeToAttachment.top];
    }
    return {
      left: left,
      top: top
    };
  }
  function offsetToPx(offset, size) {
    if (isString(offset.left) && offset.left.indexOf('%') !== -1) {
      offset.left = parseFloat(offset.left) / 100 * size.width;
    }
    if (isString(offset.top) && offset.top.indexOf('%') !== -1) {
      offset.top = parseFloat(offset.top) / 100 * size.height;
    }
    return offset;
  }
  function parseTopLeft(value) {
    var _value$split = value.split(' '),
      top = _value$split[0],
      left = _value$split[1];
    return {
      top: top,
      left: left
    };
  }
  function getScrollParents(el) {
    // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
    // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    var computedStyle = getComputedStyle(el) || {};
    var position = computedStyle.position;
    var parents = [];
    if (position === 'fixed') {
      return [el];
    }
    var parent = el;
    while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
      var style = void 0;
      try {
        style = getComputedStyle(parent);
      } catch (err) {// Intentionally blank
      }
      if (isUndefined(style) || style === null) {
        parents.push(parent);
        return parents;
      }
      var _style = style,
        overflow = _style.overflow,
        overflowX = _style.overflowX,
        overflowY = _style.overflowY;
      if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
        if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
          parents.push(parent);
        }
      }
    }
    parents.push(el.ownerDocument.body); // If the node is within a frame, account for the parent window scroll

    if (el.ownerDocument !== document) {
      parents.push(el.ownerDocument.defaultView);
    }
    return parents;
  }
  function getOffsetParent(el) {
    return el.offsetParent || document.documentElement;
  }
  var TetherBase = {
    modules: [Constraint, Abutment, Shift]
  };
  function isFullscreenElement(e) {
    var d = e.ownerDocument;
    var fe = d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement;
    return fe === e;
  }
  function within(a, b, diff) {
    if (diff === void 0) {
      diff = 1;
    }
    return a + diff >= b && b >= a - diff;
  }
  var transformKey = function () {
    if (isUndefined(document)) {
      return '';
    }
    var el = document.createElement('div');
    var transforms = ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
    for (var i = 0; i < transforms.length; ++i) {
      var key = transforms[i];
      if (el.style[key] !== undefined) {
        return key;
      }
    }
  }();
  var tethers = [];
  var position = function position() {
    tethers.forEach(function (tether) {
      tether.position(false);
    });
    flush();
  };
  function now() {
    return performance.now();
  }
  (function () {
    var lastCall = null;
    var lastDuration = null;
    var pendingTimeout = null;
    var tick = function tick() {
      if (!isUndefined(lastDuration) && lastDuration > 16) {
        // We voluntarily throttle ourselves if we can't manage 60fps
        lastDuration = Math.min(lastDuration - 16, 250); // Just in case this is the last event, remember to position just once more

        pendingTimeout = setTimeout(tick, 250);
        return;
      }
      if (!isUndefined(lastCall) && now() - lastCall < 10) {
        // Some browsers call events a little too frequently, refuse to run more than is reasonable
        return;
      }
      if (pendingTimeout != null) {
        clearTimeout(pendingTimeout);
        pendingTimeout = null;
      }
      lastCall = now();
      position();
      lastDuration = now() - lastCall;
    };
    if (!isUndefined(window) && !isUndefined(window.addEventListener)) {
      ['resize', 'scroll', 'touchmove'].forEach(function (event) {
        window.addEventListener(event, tick);
      });
    }
  })();
  var TetherClass = /*#__PURE__*/function (_Evented) {
    _inheritsLoose(TetherClass, _Evented);
    function TetherClass(options) {
      var _this;
      _this = _Evented.call(this) || this;
      _this.position = _this.position.bind(_assertThisInitialized(_this));
      tethers.push(_assertThisInitialized(_this));
      _this.history = [];
      _this.setOptions(options, false);
      TetherBase.modules.forEach(function (module) {
        if (!isUndefined(module.initialize)) {
          module.initialize.call(_assertThisInitialized(_this));
        }
      });
      _this.position();
      return _this;
    }
    var _proto = TetherClass.prototype;
    _proto.setOptions = function setOptions(options, pos) {
      var _this2 = this;
      if (pos === void 0) {
        pos = true;
      }
      var defaults = {
        offset: '0 0',
        targetOffset: '0 0',
        targetAttachment: 'auto auto',
        classPrefix: 'tether',
        bodyElement: document.body
      };
      this.options = extend(defaults, options);
      var _this$options = this.options,
        element = _this$options.element,
        target = _this$options.target,
        targetModifier = _this$options.targetModifier,
        bodyElement = _this$options.bodyElement;
      this.element = element;
      this.target = target;
      this.targetModifier = targetModifier;
      if (typeof bodyElement === 'string') {
        bodyElement = document.querySelector(bodyElement);
      }
      this.bodyElement = bodyElement;
      if (this.target === 'viewport') {
        this.target = document.body;
        this.targetModifier = 'visible';
      } else if (this.target === 'scroll-handle') {
        this.target = document.body;
        this.targetModifier = 'scroll-handle';
      }
      ['element', 'target'].forEach(function (key) {
        if (isUndefined(_this2[key])) {
          throw new Error('Tether Error: Both element and target must be defined');
        }
        if (!isUndefined(_this2[key].jquery)) {
          _this2[key] = _this2[key][0];
        } else if (isString(_this2[key])) {
          _this2[key] = document.querySelector(_this2[key]);
        }
      });
      this._addClasses();
      if (!this.options.attachment) {
        throw new Error('Tether Error: You must provide an attachment');
      }
      this.targetAttachment = parseTopLeft(this.options.targetAttachment);
      this.attachment = parseTopLeft(this.options.attachment);
      this.offset = parseTopLeft(this.options.offset);
      this.targetOffset = parseTopLeft(this.options.targetOffset);
      if (!isUndefined(this.scrollParents)) {
        this.disable();
      }
      if (this.targetModifier === 'scroll-handle') {
        this.scrollParents = [this.target];
      } else {
        this.scrollParents = getScrollParents(this.target);
      }
      if (!(this.options.enabled === false)) {
        this.enable(pos);
      }
    };
    _proto.getTargetBounds = function getTargetBounds() {
      if (!isUndefined(this.targetModifier)) {
        if (this.targetModifier === 'visible') {
          return getVisibleBounds(this.bodyElement, this.target);
        } else if (this.targetModifier === 'scroll-handle') {
          return getScrollHandleBounds(this.bodyElement, this.target);
        }
      } else {
        return getBounds(this.bodyElement, this.target);
      }
    };
    _proto.clearCache = function clearCache() {
      this._cache = {};
    };
    _proto.cache = function cache(k, getter) {
      // More than one module will often need the same DOM info, so
      // we keep a cache which is cleared on each position call
      if (isUndefined(this._cache)) {
        this._cache = {};
      }
      if (isUndefined(this._cache[k])) {
        this._cache[k] = getter.call(this);
      }
      return this._cache[k];
    };
    _proto.enable = function enable(pos) {
      var _this3 = this;
      if (pos === void 0) {
        pos = true;
      }
      var _this$options2 = this.options,
        classes = _this$options2.classes,
        classPrefix = _this$options2.classPrefix;
      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, getClass('enabled', classes, classPrefix));
      }
      addClass(this.element, getClass('enabled', classes, classPrefix));
      this.enabled = true;
      this.scrollParents.forEach(function (parent) {
        if (parent !== _this3.target.ownerDocument) {
          parent.addEventListener('scroll', _this3.position);
        }
      });
      if (pos) {
        this.position();
      }
    };
    _proto.disable = function disable() {
      var _this4 = this;
      var _this$options3 = this.options,
        classes = _this$options3.classes,
        classPrefix = _this$options3.classPrefix;
      removeClass(this.target, getClass('enabled', classes, classPrefix));
      removeClass(this.element, getClass('enabled', classes, classPrefix));
      this.enabled = false;
      if (!isUndefined(this.scrollParents)) {
        this.scrollParents.forEach(function (parent) {
          parent.removeEventListener('scroll', _this4.position);
        });
      }
    };
    _proto.destroy = function destroy() {
      var _this5 = this;
      this.disable();
      this._removeClasses();
      tethers.forEach(function (tether, i) {
        if (tether === _this5) {
          tethers.splice(i, 1);
        }
      }); // Remove any elements we were using for convenience from the DOM

      if (tethers.length === 0) {
        removeUtilElements(this.bodyElement);
      }
    };
    _proto.updateAttachClasses = function updateAttachClasses(elementAttach, targetAttach) {
      var _this6 = this;
      elementAttach = elementAttach || this.attachment;
      targetAttach = targetAttach || this.targetAttachment;
      var sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];
      var _this$options4 = this.options,
        classes = _this$options4.classes,
        classPrefix = _this$options4.classPrefix;
      if (!isUndefined(this._addAttachClasses) && this._addAttachClasses.length) {
        // updateAttachClasses can be called more than once in a position call, so
        // we need to clean up after ourselves such that when the last defer gets
        // ran it doesn't add any extra classes from previous calls.
        this._addAttachClasses.splice(0, this._addAttachClasses.length);
      }
      if (isUndefined(this._addAttachClasses)) {
        this._addAttachClasses = [];
      }
      this.add = this._addAttachClasses;
      if (elementAttach.top) {
        this.add.push(getClass('element-attached', classes, classPrefix) + "-" + elementAttach.top);
      }
      if (elementAttach.left) {
        this.add.push(getClass('element-attached', classes, classPrefix) + "-" + elementAttach.left);
      }
      if (targetAttach.top) {
        this.add.push(getClass('target-attached', classes, classPrefix) + "-" + targetAttach.top);
      }
      if (targetAttach.left) {
        this.add.push(getClass('target-attached', classes, classPrefix) + "-" + targetAttach.left);
      }
      this.all = [];
      sides.forEach(function (side) {
        _this6.all.push(getClass('element-attached', classes, classPrefix) + "-" + side);
        _this6.all.push(getClass('target-attached', classes, classPrefix) + "-" + side);
      });
      defer(function () {
        if (isUndefined(_this6._addAttachClasses)) {
          return;
        }
        updateClasses(_this6.element, _this6._addAttachClasses, _this6.all);
        if (!(_this6.options.addTargetClasses === false)) {
          updateClasses(_this6.target, _this6._addAttachClasses, _this6.all);
        }
        delete _this6._addAttachClasses;
      });
    };
    _proto.position = function position(flushChanges) {
      var _this7 = this;
      if (flushChanges === void 0) {
        flushChanges = true;
      }

      // flushChanges commits the changes immediately, leave true unless you are positioning multiple
      // tethers (in which case call Tether.Utils.flush yourself when you're done)
      if (!this.enabled) {
        return;
      }
      this.clearCache(); // Turn 'auto' attachments into the appropriate corner or edge

      var targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);
      this.updateAttachClasses(this.attachment, targetAttachment);
      var elementPos = this.cache('element-bounds', function () {
        return getBounds(_this7.bodyElement, _this7.element);
      });
      var width = elementPos.width,
        height = elementPos.height;
      if (width === 0 && height === 0 && !isUndefined(this.lastSize)) {
        // We cache the height and width to make it possible to position elements that are
        // getting hidden.
        var _this$lastSize = this.lastSize;
        width = _this$lastSize.width;
        height = _this$lastSize.height;
      } else {
        this.lastSize = {
          width: width,
          height: height
        };
      }
      var targetPos = this.cache('target-bounds', function () {
        return _this7.getTargetBounds();
      });
      var targetSize = targetPos; // Get an actual px offset from the attachment

      var offset = offsetToPx(attachmentToOffset(this.attachment), {
        width: width,
        height: height
      });
      var targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);
      var manualOffset = offsetToPx(this.offset, {
        width: width,
        height: height
      });
      var manualTargetOffset = offsetToPx(this.targetOffset, targetSize); // Add the manually provided offset

      offset = addOffset(offset, manualOffset);
      targetOffset = addOffset(targetOffset, manualTargetOffset); // It's now our goal to make (element position + offset) == (target position + target offset)

      var left = targetPos.left + targetOffset.left - offset.left;
      var top = targetPos.top + targetOffset.top - offset.top;
      for (var i = 0; i < TetherBase.modules.length; ++i) {
        var module = TetherBase.modules[i];
        var ret = module.position.call(this, {
          left: left,
          top: top,
          targetAttachment: targetAttachment,
          targetPos: targetPos,
          elementPos: elementPos,
          offset: offset,
          targetOffset: targetOffset,
          manualOffset: manualOffset,
          manualTargetOffset: manualTargetOffset,
          scrollbarSize: scrollbarSize,
          attachment: this.attachment
        });
        if (ret === false) {
          return false;
        } else if (isUndefined(ret) || !isObject(ret)) {
          continue;
        } else {
          top = ret.top;
          left = ret.left;
        }
      } // We describe the position three different ways to give the optimizer
      // a chance to decide the best possible way to position the element
      // with the fewest repaints.

      var next = {
        // It's position relative to the page (absolute positioning when
        // the element is a child of the body)
        page: {
          top: top,
          left: left
        },
        // It's position relative to the viewport (fixed positioning)
        viewport: {
          top: top - pageYOffset,
          bottom: pageYOffset - top - height + innerHeight,
          left: left - pageXOffset,
          right: pageXOffset - left - width + innerWidth
        }
      };
      var doc = this.target.ownerDocument;
      var win = doc.defaultView;
      var scrollbarSize;
      if (win.innerHeight > doc.documentElement.clientHeight) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.bottom -= scrollbarSize.height;
      }
      if (win.innerWidth > doc.documentElement.clientWidth) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.right -= scrollbarSize.width;
      }
      if (['', 'static'].indexOf(doc.body.style.position) === -1 || ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
        // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
        next.page.bottom = doc.body.scrollHeight - top - height;
        next.page.right = doc.body.scrollWidth - left - width;
      }
      if (!isUndefined(this.options.optimizations) && this.options.optimizations.moveElement !== false && isUndefined(this.targetModifier)) {
        var offsetParent = this.cache('target-offsetparent', function () {
          return getOffsetParent(_this7.target);
        });
        var offsetPosition = this.cache('target-offsetparent-bounds', function () {
          return getBounds(_this7.bodyElement, offsetParent);
        });
        var offsetParentStyle = getComputedStyle(offsetParent);
        var offsetParentSize = offsetPosition;
        var offsetBorder = {};
        ['Top', 'Left', 'Bottom', 'Right'].forEach(function (side) {
          offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle["border" + side + "Width"]);
        });
        offsetPosition.right = doc.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
        offsetPosition.bottom = doc.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;
        if (next.page.top >= offsetPosition.top + offsetBorder.top && next.page.bottom >= offsetPosition.bottom) {
          if (next.page.left >= offsetPosition.left + offsetBorder.left && next.page.right >= offsetPosition.right) {
            // We're within the visible part of the target's scroll parent
            var scrollLeft = offsetParent.scrollLeft,
              scrollTop = offsetParent.scrollTop; // It's position relative to the target's offset parent (absolute positioning when
            // the element is moved to be a child of the target's offset parent).

            next.offset = {
              top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
              left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
            };
          }
        }
      } // We could also travel up the DOM and try each containing context, rather than only
      // looking at the body, but we're gonna get diminishing returns.

      this.move(next);
      this.history.unshift(next);
      if (this.history.length > 3) {
        this.history.pop();
      }
      if (flushChanges) {
        flush();
      }
      return true;
    } // THE ISSUE
;
    _proto.move = function move(pos) {
      var _this8 = this;
      if (isUndefined(this.element.parentNode)) {
        return;
      }
      var same = {};
      for (var type in pos) {
        same[type] = {};
        for (var key in pos[type]) {
          var found = false;
          for (var i = 0; i < this.history.length; ++i) {
            var point = this.history[i];
            if (!isUndefined(point[type]) && !within(point[type][key], pos[type][key])) {
              found = true;
              break;
            }
          }
          if (!found) {
            same[type][key] = true;
          }
        }
      }
      var css = {
        top: '',
        left: '',
        right: '',
        bottom: ''
      };
      var transcribe = function transcribe(_same, _pos) {
        var hasOptimizations = !isUndefined(_this8.options.optimizations);
        var gpu = hasOptimizations ? _this8.options.optimizations.gpu : null;
        if (gpu !== false) {
          var yPos, xPos;
          if (_same.top) {
            css.top = 0;
            yPos = _pos.top;
          } else {
            css.bottom = 0;
            yPos = -_pos.bottom;
          }
          if (_same.left) {
            css.left = 0;
            xPos = _pos.left;
          } else {
            css.right = 0;
            xPos = -_pos.right;
          }
          if (isNumber(window.devicePixelRatio) && devicePixelRatio % 1 === 0) {
            xPos = Math.round(xPos * devicePixelRatio) / devicePixelRatio;
            yPos = Math.round(yPos * devicePixelRatio) / devicePixelRatio;
          }
          css[transformKey] = "translateX(" + xPos + "px) translateY(" + yPos + "px)";
          if (transformKey !== 'msTransform') {
            // The Z transform will keep this in the GPU (faster, and prevents artifacts),
            // but IE9 doesn't support 3d transforms and will choke.
            css[transformKey] += ' translateZ(0)';
          }
        } else {
          if (_same.top) {
            css.top = _pos.top + "px";
          } else {
            css.bottom = _pos.bottom + "px";
          }
          if (_same.left) {
            css.left = _pos.left + "px";
          } else {
            css.right = _pos.right + "px";
          }
        }
      };
      var hasOptimizations = !isUndefined(this.options.optimizations);
      var allowPositionFixed = true;
      if (hasOptimizations && this.options.optimizations.allowPositionFixed === false) {
        allowPositionFixed = false;
      }
      var moved = false;
      if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
        css.position = 'absolute';
        transcribe(same.page, pos.page);
      } else if (allowPositionFixed && (same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
        css.position = 'fixed';
        transcribe(same.viewport, pos.viewport);
      } else if (!isUndefined(same.offset) && same.offset.top && same.offset.left) {
        css.position = 'absolute';
        var offsetParent = this.cache('target-offsetparent', function () {
          return getOffsetParent(_this8.target);
        });
        if (getOffsetParent(this.element) !== offsetParent) {
          defer(function () {
            _this8.element.parentNode.removeChild(_this8.element);
            offsetParent.appendChild(_this8.element);
          });
        }
        transcribe(same.offset, pos.offset);
        moved = true;
      } else {
        css.position = 'absolute';
        transcribe({
          top: true,
          left: true
        }, pos.page);
      }
      if (!moved) {
        if (this.options.bodyElement) {
          if (this.element.parentNode !== this.options.bodyElement) {
            this.options.bodyElement.appendChild(this.element);
          }
        } else {
          var offsetParentIsBody = true;
          var currentNode = this.element.parentNode;
          while (currentNode && currentNode.nodeType === 1 && currentNode.tagName !== 'BODY' && !isFullscreenElement(currentNode)) {
            if (getComputedStyle(currentNode).position !== 'static') {
              offsetParentIsBody = false;
              break;
            }
            currentNode = currentNode.parentNode;
          }
          if (!offsetParentIsBody) {
            this.element.parentNode.removeChild(this.element);
            this.element.ownerDocument.body.appendChild(this.element);
          }
        }
      } // Any css change will trigger a repaint, so let's avoid one if nothing changed

      var writeCSS = {};
      var write = false;
      for (var _key in css) {
        var val = css[_key];
        var elVal = this.element.style[_key];
        if (elVal !== val) {
          write = true;
          writeCSS[_key] = val;
        }
      }
      if (write) {
        defer(function () {
          extend(_this8.element.style, writeCSS);
          _this8.trigger('repositioned');
        });
      }
    };
    _proto._addClasses = function _addClasses() {
      var _this$options5 = this.options,
        classes = _this$options5.classes,
        classPrefix = _this$options5.classPrefix;
      addClass(this.element, getClass('element', classes, classPrefix));
      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, getClass('target', classes, classPrefix));
      }
    };
    _proto._removeClasses = function _removeClasses() {
      var _this9 = this;
      var _this$options6 = this.options,
        classes = _this$options6.classes,
        classPrefix = _this$options6.classPrefix;
      removeClass(this.element, getClass('element', classes, classPrefix));
      if (!(this.options.addTargetClasses === false)) {
        removeClass(this.target, getClass('target', classes, classPrefix));
      }
      this.all.forEach(function (className) {
        _this9.element.classList.remove(className);
        _this9.target.classList.remove(className);
      });
    };
    return TetherClass;
  }(Evented);
  TetherClass.modules = [];
  TetherBase.position = position;
  var Tether = extend(TetherClass, TetherBase);
  Tether.modules.push({
    initialize: function initialize() {
      var _this10 = this;
      var _this$options7 = this.options,
        classes = _this$options7.classes,
        classPrefix = _this$options7.classPrefix;
      this.markers = {};
      ['target', 'element'].forEach(function (type) {
        var el = document.createElement('div');
        el.className = getClass(type + "-marker", classes, classPrefix);
        var dot = document.createElement('div');
        dot.className = getClass('marker-dot', classes, classPrefix);
        el.appendChild(dot);
        _this10[type].appendChild(el);
        _this10.markers[type] = {
          dot: dot,
          el: el
        };
      });
    },
    position: function position(_ref) {
      var manualOffset = _ref.manualOffset,
        manualTargetOffset = _ref.manualTargetOffset;
      var offsets = {
        element: manualOffset,
        target: manualTargetOffset
      };
      for (var type in offsets) {
        var offset = offsets[type];
        for (var side in offset) {
          var _this$markers$type$do;
          var val = offset[side];
          if (!isString(val) || val.indexOf('%') === -1 && val.indexOf('px') === -1) {
            val += 'px';
          }
          if (this.markers[type] && ((_this$markers$type$do = this.markers[type].dot) == null ? void 0 : _this$markers$type$do.style[side]) !== val) {
            this.markers[type].dot.style[side] = val;
          }
        }
      }
      return true;
    }
  });
  return Tether;
});

/***/ },

/***/ "./src/frontend/libs/waypoints/index.js"
/*!**********************************************!*\
  !*** ./src/frontend/libs/waypoints/index.js ***!
  \**********************************************/
() {

/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function () {
  "use strict";

  var keyCounter = 0;
  var allWaypoints = {};

  /* http://imakewebthings.com/waypoints/api/waypoint */
  function Waypoint(options) {
    if (!options) {
      throw new Error("No options passed to Waypoint constructor");
    }
    if (!options.element) {
      throw new Error("No element option passed to Waypoint constructor");
    }
    if (!options.handler) {
      throw new Error("No handler option passed to Waypoint constructor");
    }
    this.key = "waypoint-" + keyCounter;
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
    this.element = this.options.element;
    this.adapter = new Waypoint.Adapter(this.element);
    this.callback = options.handler;
    this.axis = this.options.horizontal ? "horizontal" : "vertical";
    this.enabled = this.options.enabled;
    this.triggerPoint = null;
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    });
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context);
    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset];
    }
    this.group.add(this);
    this.context.add(this);
    allWaypoints[this.key] = this;
    keyCounter += 1;
  }

  /* Private */
  Waypoint.prototype.queueTrigger = function (direction) {
    this.group.queueTrigger(this, direction);
  };

  /* Private */
  Waypoint.prototype.trigger = function (args) {
    if (!this.enabled) {
      return;
    }
    if (this.callback) {
      this.callback.apply(this, args);
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy */
  Waypoint.prototype.destroy = function () {
    this.context.remove(this);
    this.group.remove(this);
    delete allWaypoints[this.key];
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable */
  Waypoint.prototype.disable = function () {
    this.enabled = false;
    return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable */
  Waypoint.prototype.enable = function () {
    this.context.refresh();
    this.enabled = true;
    return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/next */
  Waypoint.prototype.next = function () {
    return this.group.next(this);
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/previous */
  Waypoint.prototype.previous = function () {
    return this.group.previous(this);
  };

  /* Private */
  Waypoint.invokeAll = function (method) {
    var allWaypointsArray = [];
    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey]);
    }
    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]();
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy-all */
  Waypoint.destroyAll = function () {
    Waypoint.invokeAll("destroy");
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable-all */
  Waypoint.disableAll = function () {
    Waypoint.invokeAll("disable");
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable-all */
  Waypoint.enableAll = function () {
    Waypoint.Context.refreshAll();
    for (var waypointKey in allWaypoints) {
      allWaypoints[waypointKey].enabled = true;
    }
    return this;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/refresh-all */
  Waypoint.refreshAll = function () {
    Waypoint.Context.refreshAll();
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-height */
  Waypoint.viewportHeight = function () {
    return window.innerHeight || document.documentElement.clientHeight;
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-width */
  Waypoint.viewportWidth = function () {
    return document.documentElement.clientWidth;
  };
  Waypoint.adapters = [];
  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: "default",
    horizontal: false,
    offset: 0
  };
  Waypoint.offsetAliases = {
    "bottom-in-view": function () {
      return this.context.innerHeight() - this.adapter.outerHeight();
    },
    "right-in-view": function () {
      return this.context.innerWidth() - this.adapter.outerWidth();
    }
  };
  window.Waypoint = Waypoint;
})();
(function () {
  "use strict";

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60);
  }
  var keyCounter = 0;
  var contexts = {};
  var Waypoint = window.Waypoint;
  var oldWindowLoad = window.onload;

  /* http://imakewebthings.com/waypoints/api/context */
  function Context(element) {
    this.element = element;
    this.Adapter = Waypoint.Adapter;
    this.adapter = new this.Adapter(element);
    this.key = "waypoint-context-" + keyCounter;
    this.didScroll = false;
    this.didResize = false;
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    };
    this.waypoints = {
      vertical: {},
      horizontal: {}
    };
    element.waypointContextKey = this.key;
    contexts[element.waypointContextKey] = this;
    keyCounter += 1;
    if (!Waypoint.windowContext) {
      Waypoint.windowContext = true;
      Waypoint.windowContext = new Context(window);
    }
    this.createThrottledScrollHandler();
    this.createThrottledResizeHandler();
  }

  /* Private */
  Context.prototype.add = function (waypoint) {
    var axis = waypoint.options.horizontal ? "horizontal" : "vertical";
    this.waypoints[axis][waypoint.key] = waypoint;
    this.refresh();
  };

  /* Private */
  Context.prototype.checkEmpty = function () {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal);
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);
    var isWindow = this.element == this.element.window;
    if (horizontalEmpty && verticalEmpty && !isWindow) {
      this.adapter.off(".waypoints");
      delete contexts[this.key];
    }
  };

  /* Private */
  Context.prototype.createThrottledResizeHandler = function () {
    var self = this;
    function resizeHandler() {
      self.handleResize();
      self.didResize = false;
    }
    this.adapter.on("resize.waypoints", function () {
      if (!self.didResize) {
        self.didResize = true;
        Waypoint.requestAnimationFrame(resizeHandler);
      }
    });
  };

  /* Private */
  Context.prototype.createThrottledScrollHandler = function () {
    var self = this;
    function scrollHandler() {
      self.handleScroll();
      self.didScroll = false;
    }
    this.adapter.on("scroll.waypoints", function () {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true;
        Waypoint.requestAnimationFrame(scrollHandler);
      }
    });
  };

  /* Private */
  Context.prototype.handleResize = function () {
    Waypoint.Context.refreshAll();
  };

  /* Private */
  Context.prototype.handleScroll = function () {
    var triggeredGroups = {};
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: "right",
        backward: "left"
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: "down",
        backward: "up"
      }
    };
    for (var axisKey in axes) {
      var axis = axes[axisKey];
      var isForward = axis.newScroll > axis.oldScroll;
      var direction = isForward ? axis.forward : axis.backward;
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];
        if (waypoint.triggerPoint === null) {
          continue;
        }
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint;
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint;
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint;
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint;
        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }
    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers();
    }
    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    };
  };

  /* Private */
  Context.prototype.innerHeight = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight();
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerHeight();
  };

  /* Private */
  Context.prototype.remove = function (waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key];
    this.checkEmpty();
  };

  /* Private */
  Context.prototype.innerWidth = function () {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth();
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerWidth();
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-destroy */
  Context.prototype.destroy = function () {
    var allWaypoints = [];
    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey]);
      }
    }
    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy();
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-refresh */
  Context.prototype.refresh = function () {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window;
    /*eslint-enable eqeqeq */
    var contextOffset = isWindow ? undefined : this.adapter.offset();
    var triggeredGroups = {};
    var axes;
    this.handleScroll();
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: "right",
        backward: "left",
        offsetProp: "left"
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: "down",
        backward: "up",
        offsetProp: "top"
      }
    };
    for (var axisKey in axes) {
      var axis = axes[axisKey];
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey];
        var adjustment = waypoint.options.offset;
        var oldTriggerPoint = waypoint.triggerPoint;
        var elementOffset = 0;
        var freshWaypoint = oldTriggerPoint == null;
        var contextModifier, wasBeforeScroll, nowAfterScroll;
        var triggeredBackward, triggeredForward;
        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp];
        }
        if (typeof adjustment === "function") {
          adjustment = adjustment.apply(waypoint);
        } else if (typeof adjustment === "string") {
          adjustment = parseFloat(adjustment);
          if (waypoint.options.offset.indexOf("%") > -1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100);
          }
        }
        contextModifier = axis.contextScroll - axis.contextOffset;
        waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment);
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
        triggeredBackward = wasBeforeScroll && nowAfterScroll;
        triggeredForward = !wasBeforeScroll && !nowAfterScroll;
        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        } else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward);
          triggeredGroups[waypoint.group.id] = waypoint.group;
        }
      }
    }
    Waypoint.requestAnimationFrame(function () {
      for (var groupKey in triggeredGroups) {
        triggeredGroups[groupKey].flushTriggers();
      }
    });
    return this;
  };

  /* Private */
  Context.findOrCreateByElement = function (element) {
    return Context.findByElement(element) || new Context(element);
  };

  /* Private */
  Context.refreshAll = function () {
    for (var contextId in contexts) {
      contexts[contextId].refresh();
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-find-by-element */
  Context.findByElement = function (element) {
    return contexts[element.waypointContextKey];
  };
  window.onload = function () {
    if (oldWindowLoad) {
      oldWindowLoad();
    }
    Context.refreshAll();
  };
  Waypoint.requestAnimationFrame = function (callback) {
    var requestFn = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || requestAnimationFrameShim;
    requestFn.call(window, callback);
  };
  Waypoint.Context = Context;
})();
(function () {
  "use strict";

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint;
  }
  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint;
  }
  var groups = {
    vertical: {},
    horizontal: {}
  };
  var Waypoint = window.Waypoint;

  /* http://imakewebthings.com/waypoints/api/group */
  function Group(options) {
    this.name = options.name;
    this.axis = options.axis;
    this.id = this.name + "-" + this.axis;
    this.waypoints = [];
    this.clearTriggerQueues();
    groups[this.axis][this.name] = this;
  }

  /* Private */
  Group.prototype.add = function (waypoint) {
    this.waypoints.push(waypoint);
  };

  /* Private */
  Group.prototype.clearTriggerQueues = function () {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    };
  };

  /* Private */
  Group.prototype.flushTriggers = function () {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction];
      var reverse = direction === "up" || direction === "left";
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);
      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i];
        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction]);
        }
      }
    }
    this.clearTriggerQueues();
  };

  /* Private */
  Group.prototype.next = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    var isLast = index === this.waypoints.length - 1;
    return isLast ? null : this.waypoints[index + 1];
  };

  /* Private */
  Group.prototype.previous = function (waypoint) {
    this.waypoints.sort(byTriggerPoint);
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    return index ? this.waypoints[index - 1] : null;
  };

  /* Private */
  Group.prototype.queueTrigger = function (waypoint, direction) {
    this.triggerQueues[direction].push(waypoint);
  };

  /* Private */
  Group.prototype.remove = function (waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
    if (index > -1) {
      this.waypoints.splice(index, 1);
    }
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/first */
  Group.prototype.first = function () {
    return this.waypoints[0];
  };

  /* Public */
  /* http://imakewebthings.com/waypoints/api/last */
  Group.prototype.last = function () {
    return this.waypoints[this.waypoints.length - 1];
  };

  /* Private */
  Group.findOrCreate = function (options) {
    return groups[options.axis][options.name] || new Group(options);
  };
  Waypoint.Group = Group;
})();
(function () {
  "use strict";

  var $ = window.jQuery;
  var Waypoint = window.Waypoint;
  function JQueryAdapter(element) {
    this.$element = $(element);
  }
  $.each(["innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop"], function (i, method) {
    JQueryAdapter.prototype[method] = function () {
      var args = Array.prototype.slice.call(arguments);
      return this.$element[method].apply(this.$element, args);
    };
  });
  $.each(["extend", "inArray", "isEmptyObject"], function (i, method) {
    JQueryAdapter[method] = $[method];
  });
  Waypoint.adapters.push({
    name: "jquery",
    Adapter: JQueryAdapter
  });
  Waypoint.Adapter = JQueryAdapter;
})();
(function () {
  "use strict";

  var Waypoint = window.Waypoint;
  function createExtension(framework) {
    return function () {
      var waypoints = [];
      var overrides = arguments[0];
      if (framework.isFunction(arguments[0])) {
        overrides = framework.extend({}, arguments[1]);
        overrides.handler = arguments[0];
      }
      this.each(function () {
        var options = framework.extend({}, overrides, {
          element: this
        });
        if (typeof options.context === "string") {
          options.context = framework(this).closest(options.context)[0];
        }
        waypoints.push(new Waypoint(options));
      });
      return waypoints;
    };
  }
  if (window.jQuery) {
    window.jQuery.fn.waypoint = createExtension(window.jQuery);
  }
  if (window.Zepto) {
    window.Zepto.fn.waypoint = createExtension(window.Zepto);
  }
})();

/***/ },

/***/ "./src/frontend/libs/wow.js/wow.js"
/*!*****************************************!*\
  !*** ./src/frontend/libs/wow.js/wow.js ***!
  \*****************************************/
(module) {

(function () {
  var MutationObserver,
    Util,
    WeakMap,
    getComputedStyle,
    getComputedStyleRX,
    bind = function (fn, me) {
      return function () {
        return fn.apply(me, arguments);
      };
    },
    indexOf = [].indexOf || function (item) {
      for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item) return i;
      }
      return -1;
    };
  Util = function () {
    function Util() {}
    Util.prototype.extend = function (custom, defaults) {
      var key, value;
      for (key in defaults) {
        value = defaults[key];
        if (custom[key] == null) {
          custom[key] = value;
        }
      }
      return custom;
    };
    Util.prototype.isMobile = function (agent) {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent);
    };
    Util.prototype.createEvent = function (event, bubble, cancel, detail) {
      var customEvent;
      if (bubble == null) {
        bubble = false;
      }
      if (cancel == null) {
        cancel = false;
      }
      if (detail == null) {
        detail = null;
      }
      if (document.createEvent != null) {
        customEvent = document.createEvent('CustomEvent');
        customEvent.initCustomEvent(event, bubble, cancel, detail);
      } else if (document.createEventObject != null) {
        customEvent = document.createEventObject();
        customEvent.eventType = event;
      } else {
        customEvent.eventName = event;
      }
      return customEvent;
    };
    Util.prototype.emitEvent = function (elem, event) {
      if (elem.dispatchEvent != null) {
        return elem.dispatchEvent(event);
      } else if (event in (elem != null)) {
        return elem[event]();
      } else if ("on" + event in (elem != null)) {
        return elem["on" + event]();
      }
    };
    Util.prototype.addEvent = function (elem, event, fn) {
      if (elem.addEventListener != null) {
        return elem.addEventListener(event, fn, false);
      } else if (elem.attachEvent != null) {
        return elem.attachEvent("on" + event, fn);
      } else {
        return elem[event] = fn;
      }
    };
    Util.prototype.removeEvent = function (elem, event, fn) {
      if (elem.removeEventListener != null) {
        return elem.removeEventListener(event, fn, false);
      } else if (elem.detachEvent != null) {
        return elem.detachEvent("on" + event, fn);
      } else {
        return delete elem[event];
      }
    };
    Util.prototype.innerHeight = function () {
      if ('innerHeight' in window) {
        return window.innerHeight;
      } else {
        return document.documentElement.clientHeight;
      }
    };
    return Util;
  }();
  WeakMap = this.WeakMap || this.MozWeakMap || (WeakMap = function () {
    function WeakMap() {
      this.keys = [];
      this.values = [];
    }
    WeakMap.prototype.get = function (key) {
      var i, item, j, len, ref;
      ref = this.keys;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        if (item === key) {
          return this.values[i];
        }
      }
    };
    WeakMap.prototype.set = function (key, value) {
      var i, item, j, len, ref;
      ref = this.keys;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        item = ref[i];
        if (item === key) {
          this.values[i] = value;
          return;
        }
      }
      this.keys.push(key);
      return this.values.push(value);
    };
    return WeakMap;
  }());
  MutationObserver = this.MutationObserver || this.WebkitMutationObserver || this.MozMutationObserver || (MutationObserver = function () {
    function MutationObserver() {
      if (typeof console !== "undefined" && console !== null) {
        console.warn('MutationObserver is not supported by your browser.');
      }
      if (typeof console !== "undefined" && console !== null) {
        console.warn('WOW.js cannot detect dom mutations, please call .sync() after loading new content.');
      }
    }
    MutationObserver.notSupported = true;
    MutationObserver.prototype.observe = function () {};
    return MutationObserver;
  }());
  getComputedStyle = this.getComputedStyle || function (el, pseudo) {
    this.getPropertyValue = function (prop) {
      var ref;
      if (prop === 'float') {
        prop = 'styleFloat';
      }
      if (getComputedStyleRX.test(prop)) {
        prop.replace(getComputedStyleRX, function (_, _char) {
          return _char.toUpperCase();
        });
      }
      return ((ref = el.currentStyle) != null ? ref[prop] : void 0) || null;
    };
    return this;
  };
  getComputedStyleRX = /(\-([a-z]){1})/g;
  this.WOW = function () {
    WOW.prototype.defaults = {
      boxClass: 'wow',
      animateClass: 'animated',
      offset: 0,
      mobile: true,
      live: true,
      callback: null,
      scrollContainer: null
    };
    function WOW(options) {
      if (options == null) {
        options = {};
      }
      this.scrollCallback = bind(this.scrollCallback, this);
      this.scrollHandler = bind(this.scrollHandler, this);
      this.resetAnimation = bind(this.resetAnimation, this);
      this.start = bind(this.start, this);
      this.scrolled = true;
      this.config = this.util().extend(options, this.defaults);
      if (options.scrollContainer != null) {
        this.config.scrollContainer = document.querySelector(options.scrollContainer);
      }
      this.animationNameCache = new WeakMap();
      this.wowEvent = this.util().createEvent(this.config.boxClass);
    }
    WOW.prototype.init = function () {
      var ref;
      this.element = window.document.documentElement;
      if ((ref = document.readyState) === "interactive" || ref === "complete") {
        this.start();
      } else {
        this.util().addEvent(document, 'DOMContentLoaded', this.start);
      }
      return this.finished = [];
    };
    WOW.prototype.start = function () {
      var box, j, len, ref;
      this.stopped = false;
      this.boxes = function () {
        var j, len, ref, results;
        ref = this.element.querySelectorAll("." + this.config.boxClass);
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          box = ref[j];
          results.push(box);
        }
        return results;
      }.call(this);
      this.all = function () {
        var j, len, ref, results;
        ref = this.boxes;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          box = ref[j];
          results.push(box);
        }
        return results;
      }.call(this);
      if (this.boxes.length) {
        if (this.disabled()) {
          this.resetStyle();
        } else {
          ref = this.boxes;
          for (j = 0, len = ref.length; j < len; j++) {
            box = ref[j];
            this.applyStyle(box, true);
          }
        }
      }
      if (!this.disabled()) {
        this.util().addEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler);
        this.util().addEvent(window, 'resize', this.scrollHandler);
        this.interval = setInterval(this.scrollCallback, 50);
      }
      if (this.config.live) {
        return new MutationObserver(function (_this) {
          return function (records) {
            var k, len1, node, record, results;
            results = [];
            for (k = 0, len1 = records.length; k < len1; k++) {
              record = records[k];
              results.push(function () {
                var l, len2, ref1, results1;
                ref1 = record.addedNodes || [];
                results1 = [];
                for (l = 0, len2 = ref1.length; l < len2; l++) {
                  node = ref1[l];
                  results1.push(this.doSync(node));
                }
                return results1;
              }.call(_this));
            }
            return results;
          };
        }(this)).observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    };
    WOW.prototype.stop = function () {
      this.stopped = true;
      this.util().removeEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler);
      this.util().removeEvent(window, 'resize', this.scrollHandler);
      if (this.interval != null) {
        return clearInterval(this.interval);
      }
    };
    WOW.prototype.sync = function (element) {
      if (MutationObserver.notSupported) {
        return this.doSync(this.element);
      }
    };
    WOW.prototype.doSync = function (element) {
      var box, j, len, ref, results;
      if (element == null) {
        element = this.element;
      }
      if (element.nodeType !== 1) {
        return;
      }
      element = element.parentNode || element;
      ref = element.querySelectorAll("." + this.config.boxClass);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        box = ref[j];
        if (indexOf.call(this.all, box) < 0) {
          this.boxes.push(box);
          this.all.push(box);
          if (this.stopped || this.disabled()) {
            this.resetStyle();
          } else {
            this.applyStyle(box, true);
          }
          results.push(this.scrolled = true);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    WOW.prototype.show = function (box) {
      this.applyStyle(box);
      box.className = box.className + " " + this.config.animateClass;
      if (this.config.callback != null) {
        this.config.callback(box);
      }
      this.util().emitEvent(box, this.wowEvent);
      this.util().addEvent(box, 'animationend', this.resetAnimation);
      this.util().addEvent(box, 'oanimationend', this.resetAnimation);
      this.util().addEvent(box, 'webkitAnimationEnd', this.resetAnimation);
      this.util().addEvent(box, 'MSAnimationEnd', this.resetAnimation);
      return box;
    };
    WOW.prototype.applyStyle = function (box, hidden) {
      var delay, duration, iteration;
      duration = box.getAttribute('data-wow-duration');
      delay = box.getAttribute('data-wow-delay');
      iteration = box.getAttribute('data-wow-iteration');
      return this.animate(function (_this) {
        return function () {
          return _this.customStyle(box, hidden, duration, delay, iteration);
        };
      }(this));
    };
    WOW.prototype.animate = function () {
      if ('requestAnimationFrame' in window) {
        return function (callback) {
          return window.requestAnimationFrame(callback);
        };
      } else {
        return function (callback) {
          return callback();
        };
      }
    }();
    WOW.prototype.resetStyle = function () {
      var box, j, len, ref, results;
      ref = this.boxes;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        box = ref[j];
        results.push(box.style.visibility = 'visible');
      }
      return results;
    };
    WOW.prototype.resetAnimation = function (event) {
      var target;
      if (event.type.toLowerCase().indexOf('animationend') >= 0) {
        target = event.target || event.srcElement;
        return target.className = target.className.replace(this.config.animateClass, '').trim();
      }
    };
    WOW.prototype.customStyle = function (box, hidden, duration, delay, iteration) {
      if (hidden) {
        this.cacheAnimationName(box);
      }
      box.style.visibility = hidden ? 'hidden' : 'visible';
      if (duration) {
        this.vendorSet(box.style, {
          animationDuration: duration
        });
      }
      if (delay) {
        this.vendorSet(box.style, {
          animationDelay: delay
        });
      }
      if (iteration) {
        this.vendorSet(box.style, {
          animationIterationCount: iteration
        });
      }
      this.vendorSet(box.style, {
        animationName: hidden ? 'none' : this.cachedAnimationName(box)
      });
      return box;
    };
    WOW.prototype.vendors = ["moz", "webkit"];
    WOW.prototype.vendorSet = function (elem, properties) {
      var name, results, value, vendor;
      results = [];
      for (name in properties) {
        value = properties[name];
        elem["" + name] = value;
        results.push(function () {
          var j, len, ref, results1;
          ref = this.vendors;
          results1 = [];
          for (j = 0, len = ref.length; j < len; j++) {
            vendor = ref[j];
            results1.push(elem["" + vendor + name.charAt(0).toUpperCase() + name.substr(1)] = value);
          }
          return results1;
        }.call(this));
      }
      return results;
    };
    WOW.prototype.vendorCSS = function (elem, property) {
      var j, len, ref, result, style, vendor;
      style = getComputedStyle(elem);
      result = style.getPropertyCSSValue(property);
      ref = this.vendors;
      for (j = 0, len = ref.length; j < len; j++) {
        vendor = ref[j];
        result = result || style.getPropertyCSSValue("-" + vendor + "-" + property);
      }
      return result;
    };
    WOW.prototype.animationName = function (box) {
      var animationName, error;
      try {
        animationName = this.vendorCSS(box, 'animation-name').cssText;
      } catch (error) {
        animationName = getComputedStyle(box).getPropertyValue('animation-name');
      }
      if (animationName === 'none') {
        return '';
      } else {
        return animationName;
      }
    };
    WOW.prototype.cacheAnimationName = function (box) {
      return this.animationNameCache.set(box, this.animationName(box));
    };
    WOW.prototype.cachedAnimationName = function (box) {
      return this.animationNameCache.get(box);
    };
    WOW.prototype.scrollHandler = function () {
      return this.scrolled = true;
    };
    WOW.prototype.scrollCallback = function () {
      var box;
      if (this.scrolled) {
        this.scrolled = false;
        this.boxes = function () {
          var j, len, ref, results;
          ref = this.boxes;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            box = ref[j];
            if (!box) {
              continue;
            }
            if (this.isVisible(box)) {
              this.show(box);
              continue;
            }
            results.push(box);
          }
          return results;
        }.call(this);
        if (!(this.boxes.length || this.config.live)) {
          return this.stop();
        }
      }
    };
    WOW.prototype.offsetTop = function (element) {
      var top;
      while (element.offsetTop === void 0) {
        element = element.parentNode;
      }
      top = element.offsetTop;
      while (element = element.offsetParent) {
        top += element.offsetTop;
      }
      return top;
    };
    WOW.prototype.isVisible = function (box) {
      var bottom, offset, top, viewBottom, viewTop;
      offset = box.getAttribute('data-wow-offset') || this.config.offset;
      viewTop = this.config.scrollContainer && this.config.scrollContainer.scrollTop || window.pageYOffset;
      viewBottom = viewTop + Math.min(this.element.clientHeight, this.util().innerHeight()) - offset;
      top = this.offsetTop(box);
      bottom = top + box.clientHeight;
      return top <= viewBottom && bottom >= viewTop;
    };
    WOW.prototype.util = function () {
      return this._util != null ? this._util : this._util = new Util();
    };
    WOW.prototype.disabled = function () {
      return !this.config.mobile && this.util().isMobile(navigator.userAgent);
    };
    return WOW;
  }();
  if ( true && module.exports) {
    module.exports = this.WOW;
  }
  if (typeof window !== "undefined") {
    window.WOW = this.WOW;
  }
}).call(this);

/***/ },

/***/ "./node_modules/ev-emitter/ev-emitter.js"
/*!***********************************************!*\
  !*** ./node_modules/ev-emitter/ev-emitter.js ***!
  \***********************************************/
(module) {

/**
 * EvEmitter v2.1.1
 * Lil' event emitter
 * MIT License
 */

( function( global, factory ) {
  // universal module definition
  if (  true && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {

function EvEmitter() {}

let proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) return this;

  // set events hash
  let events = this._events = this._events || {};
  // set listeners array
  let listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( !listeners.includes( listener ) ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) return this;

  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  let onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  let onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  let listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) return this;

  let index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  let listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) return this;

  // copy over to avoid interference if .off() in listener
  listeners = listeners.slice( 0 );
  args = args || [];
  // once stuff
  let onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  for ( let listener of listeners ) {
    let isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
  }

  return this;
};

proto.allOff = function() {
  delete this._events;
  delete this._onceEvents;
  return this;
};

return EvEmitter;

} ) );


/***/ },

/***/ "./src/frontend/fontawesome-v6/css/all.css"
/*!*************************************************!*\
  !*** ./src/frontend/fontawesome-v6/css/all.css ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/frontend/fontawesome-v6/css/v4-shims.css"
/*!******************************************************!*\
  !*** ./src/frontend/fontawesome-v6/css/v4-shims.css ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/frontend/libs/bootstrap/bootstrap.min.css"
/*!*******************************************************!*\
  !*** ./src/frontend/libs/bootstrap/bootstrap.min.css ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/frontend/styles/animate.scss"
/*!******************************************!*\
  !*** ./src/frontend/styles/animate.scss ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/frontend/styles/style.scss"
/*!****************************************!*\
  !*** ./src/frontend/styles/style.scss ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*******************************!*\
  !*** ./src/frontend/index.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _libs_FitVids_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./libs/FitVids.js */ "./src/frontend/libs/FitVids.js");
/* harmony import */ var _libs_FitVids_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_libs_FitVids_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _libs_Morphext_morphext_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./libs/Morphext/morphext.js */ "./src/frontend/libs/Morphext/morphext.js");
/* harmony import */ var _libs_Morphext_morphext_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_libs_Morphext_morphext_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _libs_jquery_backstretch_backstretch_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./libs/jquery.backstretch/backstretch.js */ "./src/frontend/libs/jquery.backstretch/backstretch.js");
/* harmony import */ var _libs_jquery_backstretch_backstretch_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_libs_jquery_backstretch_backstretch_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _libs_waypoints__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./libs/waypoints */ "./src/frontend/libs/waypoints/index.js");
/* harmony import */ var _libs_waypoints__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_libs_waypoints__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _libs_jquery_counterup__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./libs/jquery.counterup */ "./src/frontend/libs/jquery.counterup.js");
/* harmony import */ var _libs_jquery_counterup__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_libs_jquery_counterup__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _libs_imagesloaded_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./libs/imagesloaded.js */ "./src/frontend/libs/imagesloaded.js");
/* harmony import */ var _libs_imagesloaded_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_libs_imagesloaded_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _libs_jarallax_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./libs/jarallax.js */ "./src/frontend/libs/jarallax.js");
/* harmony import */ var _libs_jarallax_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_libs_jarallax_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _libs_jquery_bully_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./libs/jquery.bully.js */ "./src/frontend/libs/jquery.bully.js");
/* harmony import */ var _libs_jquery_bully_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_libs_jquery_bully_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _libs_wow_js_wow_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./libs/wow.js/wow.js */ "./src/frontend/libs/wow.js/wow.js");
/* harmony import */ var _libs_wow_js_wow_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_libs_wow_js_wow_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _libs_tether_global_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./libs/tether/global.js */ "./src/frontend/libs/tether/global.js");
/* harmony import */ var _libs_bootstrap_bootstrap_min_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./libs/bootstrap/bootstrap.min.js */ "./src/frontend/libs/bootstrap/bootstrap.min.js");
/* harmony import */ var _libs_bootstrap_bootstrap_min_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_libs_bootstrap_bootstrap_min_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _libs_bootstrap_bootstrap_min_css__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./libs/bootstrap/bootstrap.min.css */ "./src/frontend/libs/bootstrap/bootstrap.min.css");
/* harmony import */ var _fontawesome_v6_css_all_css__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./fontawesome-v6/css/all.css */ "./src/frontend/fontawesome-v6/css/all.css");
/* harmony import */ var _fontawesome_v6_css_v4_shims_css__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./fontawesome-v6/css/v4-shims.css */ "./src/frontend/fontawesome-v6/css/v4-shims.css");
/* harmony import */ var _styles_animate_scss__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./styles/animate.scss */ "./src/frontend/styles/animate.scss");
/* harmony import */ var _styles_style_scss__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./styles/style.scss */ "./src/frontend/styles/style.scss");
/* harmony import */ var _inc_theme_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./inc/theme.js */ "./src/frontend/inc/theme.js");
/* harmony import */ var _inc_theme_js__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(_inc_theme_js__WEBPACK_IMPORTED_MODULE_16__);









// Must precede the bootstrap import — Bootstrap 4 alpha 6 checks
// `typeof Tether === "undefined"` at module-evaluation time, before any
// constructor runs. See `libs/tether/global.js` for the full reasoning.








})();

/******/ })()
;
//# sourceMappingURL=theme.js.map