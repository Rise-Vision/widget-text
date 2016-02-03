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

  function _getTableName() {
    return "text_events";
  }

  function _logEvent(params) {
    RiseVision.Common.LoggerUtils.logEvent(_getTableName(), params);
  }

  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"), true,
      true, true, true, true);
  }

  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));
    _logEvent({ "event": "done" });
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

    _logEvent({ "event": "play"});
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
