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
            if ($scope.url) {
              return $scope.url.split("/").pop().split(".")[0];
            }

            return null;
          }

          // Apply custom font to preview text.
          $scope.addFont = function() {
            var family = getFamily(),
              rule;

            if (family) {
              rule = "font-family: " + family + "; " + "src: url('" + $scope.url.trim() + "');";
              // broadcast custom font loaded
              $scope.$emit("customFontLoaded", {family:family, rule:rule});
            }

            $el.modal("hide");
          };

          $scope.$on("showCustom", function () {
            $el.modal("show");
          });
        }
      };
  }]);
