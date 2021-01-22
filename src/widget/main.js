/* global RiseVision, gadgets, version */

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

      RiseVision.Common.LoggerUtils.setIds(companyId, displayId);
      RiseVision.Common.LoggerUtils.setVersion( version );
      RiseVision.Common.LoggerUtils.startEndpointHeartbeats( "widget-text" );

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
