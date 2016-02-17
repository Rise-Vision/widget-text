angular.module("risevision.widget.text.settings")
  .factory("googleFonts", ["$log", "$q", "$window", "googleFontLoader",
    function($log, $q, $window, googleFontLoader) {

      var fallback = ",sans-serif",
        fonts = "",
        urls = [],
        families = [],
        factory = {},
        inactiveFonts = [];

      factory.getFonts = function() {
        var deferred = $q.defer(),
          totalFonts = 100;

        families = [];

        googleFontLoader.getPopularFonts()
          .then(function(resp) {
            if (resp.data && resp.data.items) {
              for (var i = 0; i < totalFonts; i++) {
                families.push(resp.data.items[i].family);
              }
            }

            $window.WebFont.load({
              google: {
                families: families
              },
              timeout: 2000,
              active: function() {
                angular.forEach(families, function (family) {
                  if (inactiveFonts.indexOf(family) === -1) {
                    urls.push("//fonts.googleapis.com/css?family=" + family);
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
              },
              loading: function () {
                deferred.notify("Loading google fonts");
              }
            });
          });

        return deferred.promise;

      };

      factory.getFontsUsed = function(familyList) {
        var fontsUsed = [];

        angular.forEach(families, function (family) {
          if (familyList.indexOf(family) !== -1) {
            fontsUsed.push(family);
          }
        });

        return fontsUsed;

      };

      return factory;
  }]);
