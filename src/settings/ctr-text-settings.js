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

        $timeout(function getSheet() {
          var sheet = doc.styleSheets[0];

          if (sheet) {
            if ($scope.settings.additionalParams.customFonts.rules.length > 0) {
              angular.forEach($scope.settings.additionalParams.customFonts.rules, function (value) {
                // load font
                sheet.addRule("@font-face", value);
              });
            }
          }
          else {
            getSheet();
          }
        }, 200);
      }

      function addCustomFontsToDocument(rules, cb) {
        $timeout(function getSheet() {
          var sheet = document.styleSheets[0];

          if (sheet) {
            if (Array.isArray(rules) && rules.length > 0) {
              angular.forEach(rules, function (value) {
                // load font
                sheet.addRule("@font-face", value);
              });

              if (cb && typeof cb === "function") {
                cb();
              }
            }
          }
          else {
            getSheet();
          }
        }, 200);
      }

      // Initialize TinyMCE.
      function initTinyMCE() {
        $scope.tinymceOptions = {
          plugins: "code colorpicker textcolor wordcount",
          skin_url: "//s3.amazonaws.com/rise-common/styles/tinymce/rise",
          font_formats: "Use Custom Font=custom;" + $scope.settings.additionalParams.customFonts.formats + FONT_FAMILIES + _googleFonts,
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
                // only call this when initially loading, it loads all previously saved custom rules
                addCustomFontsToDocument($scope.settings.additionalParams.customFonts.rules);

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
        addCustomFontsToDocument([data.rule]);

        _customFontToSelect = data.family.toLowerCase() + ",sans-serif";

        $scope.settings.additionalParams.customFonts.rules.push(data.rule);
        $scope.settings.additionalParams.customFonts.formats += data.family + "=" + _customFontToSelect + ";";

        // update value of font_formats
        $scope.tinymceOptions.font_formats = "Use Custom Font=custom;" + $scope.settings.additionalParams.customFonts.formats + FONT_FAMILIES + _googleFonts;
      });

    }])
  .value("defaultSettings", {
    "params": {},
    "additionalParams": {
      "data": "",
      "customFonts": {
        "formats": "",
        "rules": []
      },
      "scroll": {}
    }
  });
