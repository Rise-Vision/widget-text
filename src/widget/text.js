/* global gadgets:false, WebFont:false */

var RiseVision = RiseVision || {};
RiseVision.Text = {};

RiseVision.Text = (function(gadgets, WebFont) {
  "use strict";

  var _additionalParams = null,
    _prefs = new gadgets.Prefs(),
    _utils = RiseVision.Common.Utilities;

  /*
   *  Private Methods
   */
  function _loadGoogleFonts(fonts, cb) {

    function complete() {
      if (cb && typeof cb === "function"){
        cb();
      }
    }

    if (Array.isArray(fonts) && fonts.length > 0) {
      WebFont.load({
        google: {
          families: fonts
        },
        timeout: 2000,
        active: function() {
          complete();
        },
        inactive: function() {
          console.warn("No google fonts were loaded");
          complete();
        },
        fontinactive: function(familyName) {
          _logEvent({
            "event": "error",
            "event_details": "Google font not loaded",
            "error_details": familyName
          });
        }
      });
    }
    else {
      complete();
    }

  }

  function _init() {
    document.querySelector(".page").innerHTML = _additionalParams.data;

    _loadGoogleFonts(_additionalParams.googleFonts, function () {
      // load custom fonts
      $.each(_additionalParams.customFonts.fonts, function (index, font) {
        _utils.loadCustomFont(font.family, font.url);
      });

      $("#container").autoScroll(_additionalParams.scroll).on("done", function() {
        _done();
      });

      _ready();
    });

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
})(gadgets, WebFont);
