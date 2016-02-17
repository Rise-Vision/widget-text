(function(window) {
  "use strict";

  window.gadget = window.gadget || {};
  window.gadget.settings = {
    "params": {},
    "additionalParams": {
      "data": "<p><span style=\"font-size: 24px; font-family: 'my font name', sans-serif;\">Custom Font</span></p>",
      "customFonts": [{
        "family": "My font' name",
        "url": "https://my.custom.font/My%20font'%20name.otf"
      }],
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
