angular.module("risevision.widget.text.settings")
  .controller("textSettingsController", ["$scope", "$rootScope", "$log", "$window", "$timeout", "googleFonts", "FONT_SIZES", "FONT_FAMILIES",
    function ($scope, $rootScope, $log, $window, $timeout, googleFonts, FONT_SIZES, FONT_FAMILIES) {

      var _isLoading = true,
        _googleFonts = "",
        _googleFontUrls = [],
        _customFontToSelect = "";

      // Handle toolbar interactions.
      function initCommands(editor, args) {
        switch(args.command) {
          case "FontName":
            if (_isLoading) {
              return;
            }
            else if (args.value === "custom") {
              $rootScope.$broadcast("showCustom");

              return;
            }
            break;

          default:
            break;
        }
      }

      // Initialize TinyMCE toolbar.
      function addCustomFontsToFrame(editor) {
        var doc = editor.getDoc();

        if ($scope.settings.additionalParams.customFonts.fonts.length > 0) {
          $timeout(function getSheet() {
            var sheet = doc.styleSheets[0];

            if (sheet) {
              angular.forEach($scope.settings.additionalParams.customFonts.fonts, function (font) {
                var rule = "font-family: " + font.family + "; " + "src: url('" + font.url + "');";

                // load font
                sheet.addRule("@font-face", rule);
              });
            }
            else {
              getSheet();
            }
          }, 200);
        }

      }

      function addCustomFontsToDocument(fonts, cb) {

        function complete() {
          if (cb && typeof cb === "function") {
            cb();
          }
        }

        if (Array.isArray(fonts) && fonts.length > 0) {
          $timeout(function getSheet() {
            var sheet = document.styleSheets[0];

            if (sheet) {
              angular.forEach(fonts, function (font) {
                var rule = "font-family: " + font.family + "; " + "src: url('" + font.url + "');";

                // load font
                sheet.addRule("@font-face", rule);
              });
            }
            else {
              getSheet();
            }
          }, 200);
        }
        else {
          complete();
        }

      }

      // Initialize TinyMCE.
      function initTinyMCE() {
        $scope.tinymceOptions = {
          plugins: "code colorpicker textcolor wordcount",
          skin_url: "//s3.amazonaws.com/rise-common/styles/tinymce/rise",
          font_formats: "Add Custom Font=custom;" + $scope.settings.additionalParams.customFonts.formats + FONT_FAMILIES + _googleFonts,
          content_css: _googleFontUrls,
          style_formats_merge: true,
          fontsize_formats: FONT_SIZES,
          min_height: 175,
          menubar: false,
          toolbar1: "fontselect fontsizeselect | " +
          "forecolor backcolor | " +
          "bold italic underline | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist indent outdent | " +
          "removeformat code",
          setup: function(editor) {
            editor.on("init", function() {
              // ensure custom fonts are added to frame with every editor init() call to account for editor refresh
              addCustomFontsToFrame(editor);

              if (_isLoading) {
                // only call this when initially loading, it loads all previously saved custom fonts
                addCustomFontsToDocument($scope.settings.additionalParams.customFonts.fonts);

                // force fontselect and fontsize tools to select defaults
                editor.execCommand("FontName", false, "verdana,geneva,sans-serif");
                editor.execCommand("FontSize", false, "24px");
              }
              else {
                // this happens when a custom font was loaded and a refresh of editor occurred

                // focus cursor to the end of the text
                editor.selection.select(editor.getBody(), true);
                editor.selection.collapse(false);

                if (_customFontToSelect) {
                  // select the custom font in fontselect list
                  editor.execCommand("FontName", false, _customFontToSelect);
                }
              }

              _isLoading = false;
            });

            editor.on("ExecCommand", function(args) {
              initCommands(editor, args);
            });
          },
          init_instance_callback: function(editor) {
            var oldApply = editor.formatter.apply,
              oldRemove = editor.formatter.remove;

            // Reference - http://goo.gl/55IhWI
            editor.formatter.apply = function apply(name, vars, node) {
              var args = {
                command: name,
                value: vars.value
              };

              oldApply(name, vars, node);
              editor.fire("ExecCommand", args);
            };

            editor.formatter.remove = function remove(name, vars, node) {
              var args = {
                command: name,
                value: (vars && vars.value) ? vars.value : null
              };

              oldRemove(name, vars, node);
              editor.fire("ExecCommand", args);
            };
          }
        };
      }

      $scope.processFonts = function () {
        var wrapper = document.createElement("div"),
          families = "",
          $wrapper;

        wrapper.innerHTML = $scope.settings.additionalParams.data;
        $wrapper = $(wrapper);

        angular.forEach($wrapper.find("span"), function(span) {
          var family = $(span).css("font-family");
          // remove single quotes (if applied) and fallback fonts
          family = family.replace(/[']/g, "").split(",")[0];

          if (families.indexOf(family) === -1) {
            // add font family to the list
            families += family + ",";
          }
        });

        // save which google fonts were used
        $scope.settings.additionalParams.googleFonts = googleFonts.getFontsUsed(families);

        // proceed with saving settings
        $scope.$parent.saveSettings();
      };

      $scope.$watch("tinymceOptions.font_formats", function (value) {
        if (typeof value !== "undefined") {
          if (!_isLoading) {
            // leverage ui-tinymce workaround of refreshing editor
            $scope.$broadcast("$tinymce:refresh");
          }
        }
      });

      $scope.$watch("settings.additionalParams.customFonts.formats", function (value) {
        if (typeof value !== "undefined") {
          if (_isLoading) {

            // Load Google fonts.
            googleFonts.getFonts().then(function(data) {

              _googleFonts = data.fonts;
              _googleFontUrls = data.urls;

              // kick off initialization now that customFonts.formats has a value and google fonts have been loaded
              initTinyMCE();

            }, function (error) {
              $log.warn(error);
              // kick off initialization now that customFonts.formats has a value, disregard no google fonts
              initTinyMCE();
            }, function (update) {
              $log.debug(update);
            });
          }
        }
      });

      $scope.$on("customFontLoaded", function (e, data) {
        addCustomFontsToDocument([data]);

        _customFontToSelect = data.family.toLowerCase() + ",sans-serif";

        $scope.settings.additionalParams.customFonts.fonts.push(data);
        $scope.settings.additionalParams.customFonts.formats += data.family + "=" + _customFontToSelect + ";";

        // update value of font_formats
        $scope.tinymceOptions.font_formats = "Add Custom Font=custom;" + $scope.settings.additionalParams.customFonts.formats + FONT_FAMILIES + _googleFonts;
      });

    }])
  .value("defaultSettings", {
    "params": {},
    "additionalParams": {
      "data": "",
      "customFonts": {
        "formats": "",
        "fonts": []
      },
      "googleFonts": [],
      "scroll": {}
    }
  });
