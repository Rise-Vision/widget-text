(function(window) {
  "use strict";

  window.gadget = window.gadget || {};
  window.gadget.settings = {
    "params": {},
    "additionalParams": {
      "data": "<p><span style=\"font-size: 24px; font-family: brushscriptstd, sans-serif;\">Custom Font</span></p>",
      "customFonts": {
        "formats": "BrushScriptStd=brushscriptstd,sans-serif;",
        "fonts": [{
          "family": "BrushScriptStd",
          "url": "https://my.custom.font/BrushScriptStd.otf"
        }]
      },
      "googleFonts": [],
      "scroll": {
        "by": "none",
        "speed": "medium",
        "pause": 5,
        "pud": 10
      }
    }
  };
})(window);
