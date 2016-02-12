angular.module("risevision.widget.text.settings")
  .directive("customFont", ["$log",
    function (/*$log*/) {
      return {
        restrict: "A",
        link: function ($scope, elem) {
          var $el = $(elem);

          $scope.url = "";

          // Extract font name from font URL.
          function getFamily() {
            var family = null;

            if ($scope.url) {
              // decode escape sequences to account for spaces in font name
              family = decodeURI($scope.url.trim());
              return family.split("/").pop().split(".")[0];
            }

            return null;
          }

          // Apply custom font to preview text.
          $scope.addFont = function() {
            var family = getFamily(),
              url;

            if (family) {
              url = $scope.url.trim();
              // escape potential single quotes in url
              url = url.replace(/'/g, "\\'");
              // broadcast custom font loaded
              $scope.$emit("customFontLoaded", {family:family, url:url});
            }

            $el.modal("hide");
          };

          $scope.$on("showCustom", function () {
            $el.modal("show");
          });
        }
      };
  }]);
