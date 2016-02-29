angular.module("risevision.widget.text.settings")
  .controller("textSettingsController", ["$scope", "$rootScope", "$log", "$window", "$timeout", "googleFontLoader", "FONT_SIZES", "FONT_FAMILIES",
    function ($scope, $rootScope, $log, $window, $timeout, googleFontLoader, FONT_SIZES, FONT_FAMILIES) {

      var _isLoading = true,
        _googleFonts = "",
        _googleFontUrls = [],
        _customFontToSelect = "",
        _lineHeightTool = null;

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

      function applyLineHeight(editor, value) {
        editor.focus();
        editor.formatter.toggle("lineHeight", {value: value});
        editor.nodeChanged();
      }

      function updateLineHeight(editor) {
        var value = null,
          selectedNode,
          selectedNodeParents;

        selectedNode = editor.selection.getNode();

        // only check <span> elements
        if (!_isLoading && selectedNode.nodeName === "SPAN" && _lineHeightTool) {

          value = editor.dom.getStyle(selectedNode, "line-height");

          if (!value) {
            // traverse up the nodes parents to find the root <span> node that does have line height applied
            selectedNodeParents = editor.dom.getParents(selectedNode);

            for (var i = 0; i < selectedNodeParents.length; i += 1) {
              if (selectedNodeParents[i].nodeName === "SPAN" && editor.dom.getStyle(selectedNodeParents[i], "line-height")) {
                value = editor.dom.getStyle(selectedNodeParents[i], "line-height");
                break;
              }
            }
          }

          if (value) {
            // update line height tool selection
            _lineHeightTool.value(value.toString());
          }

        }
      }

      // Initialize TinyMCE.
      function initTinyMCE() {
        $scope.tinymceOptions = {
          plugins: "code colorpicker textcolor wordcount",
          skin_url: "//s3.amazonaws.com/rise-common/styles/tinymce/rise",
          font_formats: getFontFormats(),
          formats: {
            fontsize: { inline: "span", split: false, styles: { fontSize: "%value" } },
            lineHeight: { inline: "span", styles: { lineHeight: "%value" } },
            paragraph: { block: "p", styles: { margin: "0", padding: "0" } }
          },
          content_css: _googleFontUrls,
          style_formats_merge: true,
          fontsize_formats: FONT_SIZES,
          min_height: 175,
          menubar: false,
          toolbar1: "fontselect fontsizeselect | " +
          "forecolor backcolor | " +
          "bold italic underline | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist indent outdent lineheight | " +
          "removeformat code",
          setup: function(editor) {
            // add the Line Height list box
            editor.addButton("lineheight", {
              type: "listbox",
              text: "Line Height",
              title: "Line Height",
              icon: false,
              values: [
                {text:"Single", value: "1"},
                {text:"Double", value: "2"}
              ],
              onselect: function () {
                applyLineHeight(editor, this.value());
              },
              onPostRender: function () {
                // save a reference to the custom line height listbox
                _lineHeightTool = this;
              }
            });

            editor.on("init", function() {
              // ensure custom fonts are added to frame with every editor init() call to account for editor refresh
              addCustomFontsToFrame(editor);

              if (_isLoading) {
                // only call this when initially loading, it loads all previously saved custom fonts
                addCustomFontsToDocument($scope.settings.additionalParams.customFonts.fonts);

                // force fontselect and fontsize tools to select defaults
                editor.execCommand("FontName", false, "verdana,geneva,sans-serif");
                editor.execCommand("FontSize", false, "24px");

                // Applying no margin or padding for all paragraphs
                editor.formatter.apply("paragraph");

                // Register applying line-height styling on all <span> elements
                editor.formatter.register("lineHeight", {inline : "span", styles : {lineHeight : "%value"}});

                // force line height selection to not just default on Single, but display Single in tool text
                // need to first change selection, then change back
                _lineHeightTool.value("2");
                _lineHeightTool.value("1");

                // force editor to apply single spacing as default
                applyLineHeight(editor, "1");
              }
              else {
                // this happens when a custom font was loaded and a refresh of editor occurred

                // focus cursor to the end of the text
                editor.selection.select(editor.getBody(), true);
                editor.selection.collapse(false);

                if (_customFontToSelect) {
                  // select the custom font in fontselect list
                  editor.execCommand("FontName", false, _customFontToSelect.replace(/'/g, "\\'").toLowerCase() + ",sans-serif");
                  _customFontToSelect = "";
                }
              }

              _isLoading = false;
            });

            editor.on("ExecCommand", function(args) {
              initCommands(editor, args);
            });

            editor.on("NodeChange", function() {
              // NodeChange fires when the selection is moved to a new location or the DOM is updated by some command
              // Update which selection shows in line height tool
              updateLineHeight(editor);
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

      // Initialize TinyMCE toolbar.
      function addCustomFontsToFrame(editor) {
        var doc = editor.getDoc();

        if ($scope.settings.additionalParams.customFonts.fonts.length > 0) {
          $timeout(function getSheet() {
            var sheet = doc.styleSheets[0];

            if (sheet) {
              angular.forEach($scope.settings.additionalParams.customFonts.fonts, function (font) {
                var rule = "font-family: " + font.family.replace(/'/g, "") + "; " +
                  "src: url('" + font.url.replace(/'/g, "\\'") + "');";

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
                var rule = "font-family: " + font.family.replace(/'/g, "").toLowerCase() + "; " +
                  "src: url('" + font.url.replace(/'/g, "\\'") + "');";

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

      function getCustomFontFormats() {
        var formats = "";

        angular.forEach($scope.settings.additionalParams.customFonts.fonts, function (font) {
          formats += font.family + "=" + font.family.replace(/'/g, "").toLowerCase() + ",sans-serif;";
        });

        return formats;
      }

      function getFontFormats() {
        return "Add Custom Font=custom;" + getCustomFontFormats() + FONT_FAMILIES + _googleFonts;
      }

      $scope.processFonts = function () {
        var wrapper = document.createElement("div"),
          families = "",
          $wrapper;

        wrapper.innerHTML = $scope.settings.additionalParams.data;
        $wrapper = $(wrapper);

        // go through fonts applied in html to prepare a list to find out which ones are google fonts
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
        $scope.settings.additionalParams.googleFonts = googleFontLoader.getFontsUsed(families);

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

      $scope.$watch("settings.additionalParams.customFonts.fonts", function (value) {
        if (typeof value !== "undefined") {
          if (_isLoading) {

            // Load Google fonts.
            googleFontLoader.getGoogleFonts().then(function(data) {
              if (data !== null) {
                _googleFonts = data.fonts;
                _googleFontUrls = data.urls;

                // kick off initialization now that customFonts.fonts has a value and google fonts have been loaded
                initTinyMCE();
              }
            }, function (error) {
              $log.warn(error);
              // kick off initialization now that customFonts.fonts has a value, disregard no google fonts
              initTinyMCE();
            });
          }
        }
      });

      $scope.$on("customFontLoaded", function (e, data) {
        addCustomFontsToDocument([data]);

        _customFontToSelect = data.family.replace(/'/g, "");

        $scope.settings.additionalParams.customFonts.fonts.push(data);

        // update value of font_formats
        $scope.tinymceOptions.font_formats = getFontFormats();
      });

    }])
  .value("defaultSettings", {
    "params": {},
    "additionalParams": {
      "data": "",
      "customFonts": {
        "formats": "", // legacy, backwards compatible
        "fonts": []
      },
      "googleFonts": [],
      "scroll": {}
    }
  });
