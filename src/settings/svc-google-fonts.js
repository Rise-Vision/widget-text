angular.module("risevision.widget.text.settings")
  .factory("googleFonts", ["$log", "$q", "$window", "GOOGLE_FONT_FAMILIES",
    function($log, $q, $window, GOOGLE_FONT_FAMILIES) {

      var fallback = ",sans-serif",
        fonts = "",
        urls = [],
        factory = {},
        inactiveFonts = [];

      factory.getFonts = function() {
        var deferred = $q.defer();

        $window.WebFont.load({
          google: {
            families: GOOGLE_FONT_FAMILIES
          },
          timeout: 2000,
          active: function() {
            angular.forEach(GOOGLE_FONT_FAMILIES, function (family) {
              if (inactiveFonts.indexOf(family) === -1) {
                urls.push("http://fonts.googleapis.com/css?family=" + family);
                fonts += family + "=" + family + fallback + ";";
              }
            });

            deferred.resolve({fonts: fonts, urls: urls});
          },
          inactive: function() {
            deferred.reject("No google fonts were loaded");
          },
          fontinactive: function(familyName) {
            inactiveFonts.push(familyName);
            $log.warn("Google font '" + familyName + "' failed to load");
          },
          loading: function () {
            deferred.notify("Loading google fonts");
          }
        });

        return deferred.promise;

      };

      factory.getFontsUsed = function(familyList) {
        var fontsUsed = [];

        angular.forEach(GOOGLE_FONT_FAMILIES, function (family) {
          if (familyList.indexOf(family) !== -1) {
            fontsUsed.push(family);
          }
        });

        return fontsUsed;

      };

      return factory;
  }]);
