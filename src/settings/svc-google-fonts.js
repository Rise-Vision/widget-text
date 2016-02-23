angular.module("risevision.widget.text.settings")
  .factory("googleFonts", ["$log", "$q", "$window", "googleFontLoader",
    function($log, $q, $window, googleFontLoader) {

      var fallback = ",sans-serif",
        factory = {},
        allFonts = [],
        loadedFamilies = [],
        inactiveFonts = [];

      /* Get the specified Google fonts. */
      factory.getFonts = function(families) {
        // Only load those fonts that have not already been loaded.
        families = families.filter(function(family) {
          return loadedFamilies.indexOf(family) === -1;
        });

        return loadFonts(families).then(function(data) {
          loadedFamilies.push.apply(loadedFamilies, families);

          return data;
        });
      };

      /* Get the next set of Google fonts. */
      factory.getMoreFonts = function() {
        if (allFonts.length === 0) {
          return getPopularFonts().then(function() {
            return getMoreFonts();
          });
        }
        else {
          return getMoreFonts();
        }
      };

      factory.getFontsUsed = function(familyList) {
        var fontsUsed = [];

        angular.forEach(loadedFamilies, function (family) {
          if (familyList.indexOf(family) !== -1) {
            fontsUsed.push(family);
          }
        });

        return fontsUsed;
      };

      /* Get the names of all Google fonts sorted by popularity. */
      function getPopularFonts() {
        var deferred = $q.defer();

        googleFontLoader.getPopularFonts()
          .then(function(resp) {
            if (resp.data && resp.data.items) {
              // Save all Google fonts.
              for (var i = 0, length = resp.data.items.length; i < length; i++) {
                allFonts.push(resp.data.items[i].family);
              }
            }

            deferred.resolve();
          });

        return deferred.promise;
      }

      /* Get the next set of Google fonts. */
      function getMoreFonts() {
        var totalFonts = 100,
          familiesToLoad = [];

        // Get the next set of families to load.
        familiesToLoad = allFonts.splice(0, totalFonts);

        // Only load those fonts that have not already been loaded.
        familiesToLoad = familiesToLoad.filter(function(family) {
          return loadedFamilies.indexOf(family) === -1;
        });

        // Keep track of the loaded families.
        loadedFamilies.push.apply(loadedFamilies, familiesToLoad);

        if (familiesToLoad.length > 0) {
          return loadFonts(familiesToLoad).then(function(data) {
            if (allFonts.length > 0) {
              data.moreFonts = true;
            }
            else {
              data.moreFonts = false;
            }

            return data;
          });
        }
      }

      /* Load the specified Google fonts. */
      function loadFonts(families) {
        var deferred = $q.defer(),
          urls = [],
          fonts = "";

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

        return deferred.promise;
      }

      return factory;
  }]);
