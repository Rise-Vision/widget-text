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

      return browser.wait(function() {
        return element(by.css(".mce-btn[aria-label='Font Family']")).isPresent()
          .then(function(isPresent) {
            if (isPresent) {
              return element(by.css(".mce-btn[aria-label='Font Family']")).isDisplayed()
                .then(function(isDisplayed) {
                  return isDisplayed;
                });
            }
          });
      });
    });

    describe("Initialization", function() {

      describe("Scroll Setting", function () {
        it("Should load scroll component", function () {
          expect(element(by.id("scroll-by")).isPresent())
            .to.eventually.be.true;
        });

        it("Should default to 'none'", function () {
          expect(element(by.id("scroll-by")).getAttribute("value"))
            .to.eventually.equal("none");
        });
      });

      describe("Font Family", function() {
        it("should load all fonts", function() {
          element(by.css(".mce-btn[aria-label='Font Family']")).click();

          element.all(by.css("#mceu_32-body div")).then(function(elements) {
            expect(elements.length).to.equal(53);
          });
        });

        it("should show 'Add Custom Font' first", function() {
          element(by.css(".mce-btn[aria-label='Font Family']")).click();

          expect(element(by.css("#mceu_33-text")).getText()).to.eventually.equal("Add Custom Font");
        });

        it("should show font family", function() {
          expect(element(by.css(".mce-btn[aria-label='Font Family']")).isDisplayed()).to.eventually.be.true;
        });

        it("should set font family to Verdana", function() {
          expect(element(by.css(".mce-btn[aria-label='Font Family'] .mce-txt")).getText()).to.eventually.equal("Verdana");
        });

      });

      describe("Font Sizes", function() {
        it("should show font sizes", function() {
          expect(element(by.css(".mce-btn[aria-label='Font Sizes']")).isDisplayed()).to.eventually.be.true;
        });

        it("should set font size to 24px", function() {
          expect(element(by.css(".mce-btn[aria-label='Font Sizes'] .mce-txt")).getText()).to.eventually.equal("24px");
        });

      });

      describe("Alignment", function() {
        it("should show align left", function() {
          expect(element(by.css(".mce-btn[aria-label='Align left']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show align center", function() {
          expect(element(by.css(".mce-btn[aria-label='Align center']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show align right", function() {
          expect(element(by.css(".mce-btn[aria-label='Align right']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show justify", function() {
          expect(element(by.css(".mce-btn[aria-label='Justify']")).isDisplayed()).to.eventually.be.true;
        });

      });

      describe("Text Color", function() {
        it("should show text color", function() {
          expect(element(by.css(".mce-colorbutton[aria-label='Text color']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show background color", function() {
          expect(element(by.css(".mce-colorbutton[aria-label='Background color']")).isDisplayed()).to.eventually.be.true;
        });

      });

      describe("Other Tools", function() {
        it("should show bold", function() {
          expect(element(by.css(".mce-btn[aria-label='Bold']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show italic", function() {
          expect(element(by.css(".mce-btn[aria-label='Italic']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show underline", function() {
          expect(element(by.css(".mce-btn[aria-label='Underline']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show bullet list", function() {
          expect(element(by.css(".mce-btn[aria-label='Bullet list']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show increase indent", function() {
          expect(element(by.css(".mce-btn[aria-label='Increase indent']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show decrease indent", function() {
          expect(element(by.css(".mce-btn[aria-label='Decrease indent']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show clear formatting", function() {
          expect(element(by.css(".mce-btn[aria-label='Clear formatting']")).isDisplayed()).to.eventually.be.true;
        });

        it("should show source code", function() {
          expect(element(by.css(".mce-btn[aria-label='Source code']")).isDisplayed()).to.eventually.be.true;
        });

      });

    });

    describe("Custom Font", function() {
      var url = "",
        customFontUrl = "https://my.custom.font/BrushScriptStd.otf";

      beforeEach(function () {
        url = browser.findElement(by.model("url"));

        element(by.css(".mce-btn[aria-label='Font Family']")).click();
        element(by.css("#mceu_33-text")).click();
      });

      describe("Modal visibility", function() {
        it("should show modal for custom font", function() {
          expect(element(by.css(".custom-font")).isDisplayed()).to.eventually.be.true;
        });

        it("should hide modal when cancel button is clicked", function() {
          element(by.css(".custom-font .cancel")).click();

          expect(element(by.css(".custom-font")).isDisplayed()).to.eventually.be.false;
        });
      });

      describe("Select button", function() {
        it("should disable Select button if custom font URL is invalid", function() {
          element(by.css(".custom-font input[name='url']")).clear();
          element(by.css(".custom-font input[name='url']")).sendKeys("http://abc123");

          expect(element(by.css(".custom-font .select")).isEnabled()).to.eventually.be.false;
        });

        it("should enable Select button if custom font URL is valid", function() {
          url.clear();
          url.sendKeys(customFontUrl);

          expect(element(by.css(".custom-font .select")).isEnabled()).to.eventually.be.true;
        });
      });

      describe("Apply font", function() {
        it("should set font family to custom font", function() {
          url.clear();
          url.sendKeys(customFontUrl);
          element(by.css(".custom-font .select")).click();

          expect(element(by.css(".mce-btn[aria-label='Font Family'] .mce-txt")).getText()).to.eventually.equal("BrushScriptStd");
        });

        it("should set font family with that has spaces and single quotes in file name", function() {
          url.clear();
          url.sendKeys("https://my.custom.font/My%20font'%20name.otf");
          element(by.css(".custom-font .select")).click();

          expect(element(by.css(".mce-btn[aria-label='Font Family'] .mce-txt")).getText()).to.eventually.equal("My font' name");
        });
      });
    });

    describe("Saving", function() {

      it("Should correctly save settings", function() {
        var settings = {
          "params": {},
          "additionalParams": {
            "data": "<p><span style=\"font-family: verdana, geneva, sans-serif; font-size: 24px;\">This is a test</span></p>",
            "customFonts": {
              "formats": "",
              "fonts": []
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

        browser.driver.switchTo().frame(0);
        browser.ignoreSynchronization = true;

        element(by.css(".mce-content-body")).isDisplayed().sendKeys("This is a test");

        browser.driver.switchTo().defaultContent();
        browser.ignoreSynchronization = false;

        element(by.id("save")).click();

        expect(browser.executeScript("return window.result")).to.eventually.deep.equal({
          "params": "",
          "additionalParams": JSON.stringify(settings.additionalParams)
        });
      });

      it("Should correctly save settings with a custom font", function () {
        var customFontUrl = "https://my.custom.font/My%20font'%20name.otf",
          settings = {
            "params": {},
            "additionalParams": {
              "data": "<p><span style=\"font-family: verdana, geneva, sans-serif; font-size: 24px;\">This is a test<span style=\"font-family: \'my font name\', sans-serif;\"> with a custom font!</span></span></p>",
              "customFonts": {
                "formats": "",
                "fonts": [{"family": "My font' name", "url": "https://my.custom.font/My%20font'%20name.otf"}]
              },
              "googleFonts": [],
              "scroll": {
                "by": "none",
                "speed": "medium",
                "pause": 5,
                "pud": 10
              }
            }
          },
          url;

        browser.driver.switchTo().frame(0);
        browser.ignoreSynchronization = true;

        element(by.css(".mce-content-body")).isDisplayed().sendKeys("This is a test");

        browser.driver.switchTo().defaultContent();
        browser.ignoreSynchronization = false;

        url = browser.findElement(by.model("url"));

        element(by.css(".mce-btn[aria-label='Font Family']")).click();
        element(by.css("#mceu_33-text")).click();

        url.sendKeys(customFontUrl);
        element(by.css(".custom-font .select")).click();

        browser.driver.switchTo().frame(0);
        browser.ignoreSynchronization = true;

        element(by.css(".mce-content-body")).isDisplayed().sendKeys(" with a custom font!");

        browser.driver.switchTo().defaultContent();
        browser.ignoreSynchronization = false;

        element(by.id("save")).click();

        expect(browser.executeScript("return window.result")).to.eventually.deep.equal({
          "params": "",
          "additionalParams": JSON.stringify(settings.additionalParams)
        });

      });

      it("Should correctly save settings and provide google fonts used", function () {
        var settings = {
            "params": {},
            "additionalParams": {
              "data": "<p><span style=\"font-family: verdana, geneva, sans-serif; font-size: 24px;\">This is a test<span style=\"font-family: Domine, sans-serif;\"> with a google font!</span></span></p>",
              "customFonts": {
                "formats": "",
                "fonts": []
              },
              "googleFonts": ["Domine"],
              "scroll": {
                "by": "none",
                "speed": "medium",
                "pause": 5,
                "pud": 10
              }
            }
          };

        browser.driver.switchTo().frame(0);
        browser.ignoreSynchronization = true;

        element(by.css(".mce-content-body")).isDisplayed().sendKeys("This is a test");

        browser.driver.switchTo().defaultContent();
        browser.ignoreSynchronization = false;

        element(by.css(".mce-btn[aria-label='Font Family']")).click();
        element(by.css("#mceu_61-text")).click();

        browser.driver.switchTo().frame(0);
        browser.ignoreSynchronization = true;

        element(by.css(".mce-content-body")).isDisplayed().sendKeys(" with a google font!");

        browser.driver.switchTo().defaultContent();
        browser.ignoreSynchronization = false;

        element(by.id("save")).click();

        expect(browser.executeScript("return window.result")).to.eventually.deep.equal({
          "params": "",
          "additionalParams": JSON.stringify(settings.additionalParams)
        });

      });

    });

  });
})();
