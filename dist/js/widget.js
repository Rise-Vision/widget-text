/*
 *  Project: Auto-Scroll
 *  Description: Auto-scroll plugin for use with Rise Vision Widgets
 *  Author: @donnapep
 *  License: MIT
 */

;(function ($, window, document, undefined) {
	"use strict";

	var pluginName = "autoScroll",
		defaults = {
			by: "continuous",
			speed: "medium",
			pause: 5,
			click: false,
			minimumMovement: 3 // Draggable default value - http://greensock.com/docs/#/HTML5/Drag/Draggable/
		};


	function Plugin(element, options) {
		this.element = element;
		this.page = $(element).find(".page");
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.isLoading = true;
		this.draggable = null;
		this.tween = null;
		this.calculateProgress = null;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			var speed, duration;
			var self = this;
			var scrollComplete = null;
			var pageComplete = null;
			var elementHeight = $(this.element).outerHeight(true);
			var pauseHeight = elementHeight;
			var max = this.element.scrollHeight - this.element.offsetHeight;

			function pauseTween() {
				self.tween.pause();

				TweenLite.killDelayedCallsTo(self.calculateProgress);
				TweenLite.killDelayedCallsTo(scrollComplete);
				// Only used when scrolling by page.
				TweenLite.killDelayedCallsTo(pageComplete);
			}

			this.calculateProgress = function() {
				// Set pauseHeight to new value.
				pauseHeight = $(self.element).scrollTop() +
					elementHeight;

				self.tween.progress($(self.element).scrollTop() / max)
					.play();
			};

			if (this.canScroll()) {
				// Set scroll speed.
				if (this.options.by === "page") {
					if (this.options.speed === "fastest") {
						speed = 0.4;
					}
					else if (this.options.speed === "fast") {
						speed = 0.8;
					}
					else if (this.options.speed === "medium") {
						speed = 1.2;
					}
					else if (this.options.speed === "slow") {
						speed = 1.6;
					}
					else {
						speed = 2;
					}

					duration = this.page.outerHeight(true) /
						$(this.element).outerHeight(true) * speed;
				}
				else {  // Continuous or by row
					if (this.options.speed === "fastest") {
						speed = 60;
					}
					else if (this.options.speed === "fast") {
						speed = 50;
					}
					else if (this.options.speed === "medium") {
						speed = 40;
					}
					else if (this.options.speed === "slow") {
						speed = 30;
					}
					else {
						speed = 20;
					}

					duration = Math.abs((this.page.outerHeight(true) -
						$(this.element).outerHeight(true)) / speed);
				}

				Draggable.create(this.element, {
					type: "scrollTop",
					throwProps: true,
					edgeResistance: 0.75,
					minimumMovement: self.options.minimumMovement,
					onPress: function() {
						pauseTween();
					},
					onRelease: function() {
						if (self.options.by !== "none") {
							/* Figure out what the new scroll position is and
							 translate that into the progress of the tween (0-1)
							 so that we can calibrate it; otherwise, it'd jump
							 back to where it paused when we resume(). */
							TweenLite.delayedCall(self.options.pause, self.calculateProgress);
						}
					},
					onClick: function() {
						if (self.options.click) {
							pauseTween();
							$(self.element).trigger("scrollClick", [this.pointerEvent]);
						}
					}
				});

				this.draggable = Draggable.get(this.element);

				this.tween = TweenLite.to(this.draggable.scrollProxy, duration, {
					scrollTop: max,
					ease: Linear.easeNone,
					delay: this.options.pause,
					paused: true,
					onUpdate: (this.options.by === "page" ? function() {
						if (Math.abs(self.draggable.scrollProxy.top()) >= pauseHeight) {
							self.tween.pause();

							// Next height at which to pause scrolling.
							pauseHeight += elementHeight;

							TweenLite.delayedCall(self.options.pause,
								pageComplete = function() {
									self.tween.resume();
								}
							);
						}
					} : undefined),
					onComplete: function() {
						TweenLite.delayedCall(self.options.pause,
							scrollComplete = function() {
								TweenLite.to(self.page, 1, {
									autoAlpha: 0,
									onComplete: function() {
										self.tween.seek(0).pause();

										if (self.options.by === "page") {
											pauseHeight = elementHeight;
										}

										$(self.element).trigger("done");
									}
								});
							}
						);
					}
				});

				// Hide scrollbar.
				TweenLite.set(this.element, { overflowY: "hidden" });
			} else {
				if (this.options.click) {
					// Account for content that is to be clicked when content not needed to be scrolled
					// Leverage Draggable for touch/click event handling
					Draggable.create(this.element, {
						type: "scrollTop",
						throwProps: true,
						edgeResistance: 0.95,
						minimumMovement: this.options.minimumMovement,
						onClick: function() {
							$(self.element).trigger("scrollClick", [this.pointerEvent]);
						}
					});

					this.draggable = Draggable.get(this.element);
				}
			}
		},
		// Check if content is larger than viewable area and if the scroll settings is set to actually scroll.
		canScroll: function() {
			return this.options && (this.page.height() > $(this.element).height());
		},
		destroy: function() {
			$(this.element).removeData();
			if (this.tween) {
				this.tween.kill();
			}

			if (this.draggable) {
				this.draggable.kill();
			}

			// Remove elements.
			this.element = null;
			this.page = null;
			this.options = null;
			this._defaults = null;
			this.draggable = null;
			this.tween = null;
			this.calculateProgress = null;
		}
	};

	Plugin.prototype.play = function() {
		if (this.canScroll() && this.options.by !== "none") {
			if (this.tween) {
				if (this.isLoading) {
					this.tween.play();
					this.isLoading = false;
				}
				else {
					TweenLite.to(this.page, 1, {autoAlpha: 1});
					TweenLite.delayedCall(this.options.pause, this.calculateProgress);
				}
			}
		}
	};

	Plugin.prototype.pause = function() {
		if (this.tween) {
			TweenLite.killDelayedCallsTo(this.calculateProgress);
			this.tween.pause();
		}
	};

	Plugin.prototype.stop = function() {
		if (this.tween) {
			TweenLite.killDelayedCallsTo(this.calculateProgress);
			this.tween.kill();
		}

		this.element = null;
		this.page = null;
	};

	// A lightweight plugin wrapper around the constructor that prevents
	// multiple instantiations.
	$.fn.autoScroll = function(options) {
		return this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);

var RiseVision = RiseVision || {};

RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Utilities = (function() {

  function getFontCssStyle(className, fontObj) {
    var family = "font-family:" + fontObj.font.family + "; ";
    var color = "color: " + (fontObj.color ? fontObj.color : fontObj.forecolor) + "; ";
    var size = "font-size: " + (fontObj.size.indexOf("px") === -1 ? fontObj.size + "px; " : fontObj.size + "; ");
    var weight = "font-weight: " + (fontObj.bold ? "bold" : "normal") + "; ";
    var italic = "font-style: " + (fontObj.italic ? "italic" : "normal") + "; ";
    var underline = "text-decoration: " + (fontObj.underline ? "underline" : "none") + "; ";
    var highlight = "background-color: " + (fontObj.highlightColor ? fontObj.highlightColor : fontObj.backcolor) + "; ";

    return "." + className + " {" + family + color + size + weight + italic + underline + highlight + "}";
  }

  function addCSSRules(rules) {
    var style = document.createElement("style");

    for (var i = 0, length = rules.length; i < length; i++) {
      style.appendChild(document.createTextNode(rules[i]));
    }

    document.head.appendChild(style);
  }

  /*
   * Loads Google or custom fonts, if applicable, and injects CSS styles
   * into the head of the document.
   *
   * @param    array    settings    Array of objects with the following form:
 *                                   [{
 *                                     "class": "date",
 *                                     "fontSetting": {
 *                                         bold: true,
 *                                         color: "black",
 *                                         font: {
 *                                           family: "Akronim",
 *                                           font: "Akronim",
 *                                           name: "Verdana",
 *                                           type: "google",
 *                                           url: "http://custom-font-url"
 *                                         },
 *                                         highlightColor: "transparent",
 *                                         italic: false,
 *                                         size: "20",
 *                                         underline: false
 *                                     }
 *                                   }]
   *
   *           object   contentDoc    Document object into which to inject styles
   *                                  and load fonts (optional).
   */
  function loadFonts(settings, contentDoc) {
    settings.forEach(function(item) {
      if (item.class && item.fontSetting) {
        addCSSRules([ getFontCssStyle(item.class, item.fontSetting) ]);
      }

      if (item.fontSetting.font.type) {
        if (item.fontSetting.font.type === "custom" && item.fontSetting.font.family &&
          item.fontSetting.font.url) {
          loadCustomFont(item.fontSetting.font.family, item.fontSetting.font.url,
            contentDoc);
        }
        else if (item.fontSetting.font.type === "google" && item.fontSetting.font.family) {
          loadGoogleFont(item.fontSetting.font.family, contentDoc);
        }
      }
    });
  }

  function loadCustomFont(family, url, contentDoc) {
    var sheet = null;
    var rule = "font-family: " + family + "; " + "src: url('" + url + "');";

    contentDoc = contentDoc || document;

    sheet = contentDoc.styleSheets[0];

    if (sheet !== null) {
      sheet.addRule("@font-face", rule);
    }
  }

  function loadGoogleFont(family, contentDoc) {
    var stylesheet = document.createElement("link");

    contentDoc = contentDoc || document;

    stylesheet.setAttribute("rel", "stylesheet");
    stylesheet.setAttribute("type", "text/css");

    // split to account for family value containing a fallback (eg. Aladin,sans-serif)
    stylesheet.setAttribute("href", "https://fonts.googleapis.com/css?family=" + family.split(",")[0]);

    if (stylesheet !== null) {
      contentDoc.getElementsByTagName("head")[0].appendChild(stylesheet);
    }
  }

  function preloadImages(urls) {
    var length = urls.length,
      images = [];

    for (var i = 0; i < length; i++) {
      images[i] = new Image();
      images[i].src = urls[i];
    }
  }

  function getQueryParameter(param) {
    var query = window.location.search.substring(1),
      vars = query.split("&"),
      pair;

    for (var i = 0; i < vars.length; i++) {
      pair = vars[i].split("=");

      if (pair[0] == param) {
        return decodeURIComponent(pair[1]);
      }
    }

    return "";
  }

  return {
    getQueryParameter: getQueryParameter,
    getFontCssStyle:  getFontCssStyle,
    addCSSRules:      addCSSRules,
    loadFonts:        loadFonts,
    loadCustomFont:   loadCustomFont,
    loadGoogleFont:   loadGoogleFont,
    preloadImages:    preloadImages
  };
})();

/* jshint ignore:start */
var _gaq = _gaq || [];

_gaq.push(["_setAccount", "UA-57092159-13"]);
_gaq.push(["_trackPageview"]);

(function() {
  var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;
  ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
  var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);
})();
/* jshint ignore:end */

/* global gadgets:false */

var RiseVision = RiseVision || {};
RiseVision.Text = {};

RiseVision.Text = (function(gadgets) {
  "use strict";

  var _additionalParams = null,
    _prefs = new gadgets.Prefs(),
    _utils = RiseVision.Common.Utilities;

  /*
   *  Private Methods
   */
  function _init() {
    var i = 0,
      rules = [],
      fontRules = [];

    document.querySelector(".page").innerHTML = _additionalParams.data;

    // Iterate over the data to find any custom or Google fonts that are being used.
    $.each($("<div/>").html(_additionalParams.data).find("span").addBack(), function() {
      fontRules = _getFontRules(this);

      for (i = 0; i < fontRules.length; i++) {
        rules.push(fontRules[i]);
      }
    });

    _utils.addCSSRules(rules);

    $("#container").autoScroll(_additionalParams.scroll).on("done", function() {
      _done();
    });

    _ready();
  }

  function _createFontRule(font) {
    return ".wysiwyg-font-family-" + font.replace(/ /g, "-").toLowerCase() + " { font-family: '" + font + "'; }";
  }

  // Create CSS rules for fonts.
  function _getFontRules(elem) {
    var rules = [],
      googleFont = $(elem).attr("data-google-font"),
      customFont = $(elem).attr("data-custom-font");

    // Load Google font.
    if (googleFont) {
      _utils.loadGoogleFont(googleFont);

      // Add CSS for the Google font.
      rules.push(_createFontRule(googleFont));
    }

    // Load custom font.
    if (customFont) {
      _utils.loadCustomFont(customFont, $(elem).attr("data-custom-font-url"));

      // Add CSS for the custom font.
      rules.push(_createFontRule(customFont));
    }

    return rules;
  }

  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"), true,
      true, true, true, true);
  }

  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));
  }

  /*
   *  Public Methods
   */
  function setAdditionalParams(additionalParams) {
    _additionalParams = JSON.parse(JSON.stringify(additionalParams));

    _additionalParams.width = _prefs.getInt("rsW");
    _additionalParams.height = _prefs.getInt("rsH");

    document.getElementById("container").style.width = _additionalParams.width + "px";
    document.getElementById("container").style.height = _additionalParams.height + "px";

    _init();
  }

  function play() {
    if ($("#container").data("plugin_autoScroll")) {
      $("#container").data("plugin_autoScroll").play();
    }
  }

  function pause() {
    if ($("#container").data("plugin_autoScroll")) {
      $("#container").data("plugin_autoScroll").pause();
    }
  }

  function stop() {
    pause();
  }

  return {
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "stop": stop
  };
})(gadgets);

/* global RiseVision, gadgets */

(function (window, gadgets) {
  "use strict";

  var prefs = new gadgets.Prefs(),
    id = prefs.getString("id");

  window.oncontextmenu = function () {
    return false;
  };

  document.body.onmousedown = function() {
    return false;
  };

  function configure(names, values) {
    var additionalParams,
      companyId = "",
      displayId = "";

    if (Array.isArray(names) && names.length > 0 && Array.isArray(values) && values.length > 0) {
      if (names[0] === "companyId") {
        companyId = values[0];
      }

      if (names[1] === "displayId") {
        if (values[1]) {
          displayId = values[1];
        }
        else {
          displayId = "preview";
        }
      }

      if (names[2] === "additionalParams") {
        additionalParams = JSON.parse(values[2]);

        RiseVision.Text.setAdditionalParams(additionalParams);
      }
    }
  }

  if (id && id !== "") {
    gadgets.rpc.register("rscmd_play_" + id, play);
    gadgets.rpc.register("rscmd_pause_" + id, pause);
    gadgets.rpc.register("rscmd_stop_" + id, stop);

    gadgets.rpc.register("rsparam_set_" + id, configure);
    gadgets.rpc.call("", "rsparam_get", null, id, ["companyId", "displayId", "additionalParams"]);
  }

  function play() {
    RiseVision.Text.play();
  }

  function pause() {
    RiseVision.Text.pause();
  }

  function stop() {
    RiseVision.Text.stop();
  }
})(window, gadgets);
