var RiseVision = RiseVision || {};
RiseVision.Text = {};
RiseVision.Text.Settings = {};

RiseVision.Text.Settings = (function($, gadgets) {
	"use strict";

	var _editor = null;
	var FONT_SIZE_PICKER_STYLESHEET = "http://s3.amazonaws.com/rise-common-test/scripts/bootstrap-font-size-picker/css/bootstrap-font-size-picker.css";

	function _getSettings() {
		var settings = null, additionalParams = {};

		$(".errors").empty();

		additionalParams.data = $("#editable").val();

	settings = {
			"params" : null,
			"additionalParams" : JSON.stringify(additionalParams)
		};

		$(".alert").hide();

		gadgets.rpc.call("", "rscmd_saveSettings", null, settings);
	}

	function init() {
		var $editable = $("#editable");

		// Configure editor toolbar.
		$editable.wysihtml5({
			"toolbar": {
				"font-picker":
					"<li>" +
						"<div class='font-picker'>" +
						"</div>" +
					"</li>",
				"font-size":
					"<li>" +
						"<div class='font-size-picker'>" +
						"</div>" +
					"</li>"
			},
			"font-styles": false,
			"lists": false,
			"link": false,
			"image": false,
			"color": false,
			"html": false,
			"stylesheets": [FONT_SIZE_PICKER_STYLESHEET]
		});

		_editor = $editable.data("wysihtml5").editor;

		// Initialize the font picker.
		$(".font-picker").fontPicker({
			"contentDocument": _editor.composer.iframe.contentDocument
		})
			.on("standardFontSelected", function(e, font, fontFamily) {
				_editor.composer.commands.exec("standardFont", font, fontFamily, [{
					name: "data-standard-font",
					value: font
				},
				{
					name: "data-standard-font-family",
					value: fontFamily
				}
				]);

				$editable.focus();
			})
			.on("googleFontSelected", function(e, font) {
				_editor.composer.commands.exec("googleFont", font, [{
					name: "data-google-font",
					value: font
				}]);

				$editable.focus();
			})
			.on("customFontSelected", function(e, font, fontURL) {
				_editor.composer.commands.exec("customFont", font, [{
					name: "data-custom-font",
					value: font
				},
				{
					name: "data-custom-font-url",
					value: fontURL
				}
				]);

				$editable.focus();
			});

		// Initialize the font size picker.
		$(".font-size-picker").fontSizePicker({})
			.on("change.bfhselectbox", function() {
				_editor.composer.commands.exec("fontSize", $(this).find(".bfh-fontsizes").val());
			});

		i18n.init(function(t) {
			$(".widget-wrapper").i18n().show();
			$(".selectpicker").selectpicker();

			// Set buttons to be sticky only after wrapper is visible.
			$(".buttons").sticky({
				container : $("#wrapper"),
				topSpacing : 41
			});
		});

		$("#save").on("click", function() {
			_getSettings();
		});

		$("#cancel, #close").on("click", function() {
			gadgets.rpc.call("", "rscmd_closeSettings", null);
		});

		$("#help").on("click", function() {
			window.open("http://www.risevision.com/help/users/what-are-gadgets/content/playlist-item-text-editor/", "_blank");
		});

		$(".alert").hide();

		//Request additional parameters from the Viewer.
		gadgets.rpc.call("", "rscmd_getAdditionalParams", function(result) {
			var prefs = new gadgets.Prefs();
			var util = RiseVision.Common.Utilities;
			var standardFont, googleFont, customFont;

			// Settings have been saved before.
			if (result) {
				result = JSON.parse(result);

				_editor.setValue(result.data);

				// Load all Google fonts.
				$.each($(result.data).find("span").andSelf(), function(index, value) {
					standardFont = $(this).attr("data-standard-font");
					googleFont = $(this).attr("data-google-font");
					customFont = $(this).attr("data-custom-font");

					if (standardFont) {
						_editor.composer.commands.exec("standardFont", standardFont, $(this).attr("data-standard-font-family"));
					}

					if (googleFont) {
						util.loadGoogleFont(googleFont, _editor.composer.iframe.contentDocument);
						// This won't add a new span tag because a range will not have been selected, which is what we want.
						_editor.composer.commands.exec("googleFont", googleFont, null);
					}

					if (customFont) {
						util.loadCustomFont(customFont, $(this).attr("data-custom-font-url"), _editor.composer.iframe.contentDocument);
						_editor.composer.commands.exec("customFont", customFont, $(this).attr("data-custom-font-url"));
					}
				});
			}
		});
	}

	return {
		init: init
	};
})($, gadgets);