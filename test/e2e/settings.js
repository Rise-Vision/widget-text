/* jshint expr: true */
/* global element: false, browser: false, by: false */

(function () {
  "use strict";

  var expect;
  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  expect = chai.expect;

  browser.driver.manage().window().setSize(1024, 768);

  describe("Text Widget Settings", function() {
    beforeEach(function () {
      browser.get("/src/settings-e2e.html");
    });

    it("Should load scroll component", function () {
      expect(element(by.id("scroll-by")).isPresent())
        .to.eventually.be.true;

      expect(element(by.id("scroll-by")).getAttribute("value"))
        .to.eventually.equal("none");
    });

    it("Should correctly save settings", function() {
      var settings = {
        "params": {},
        "additionalParams": {
          "data": "",
          "customFonts": {
            "formats": "",
            "rules": []
          },
          "scroll": {
            "by": "none",
            "speed": "medium",
            "pause": 5,
            "pud": 10
          }
        }
      };

      element(by.id("save")).click();

      expect(browser.executeScript("return window.result")).to.eventually.deep.equal({
        "params": "",
        "additionalParams": JSON.stringify(settings.additionalParams)
      });
    });
  });
})();
