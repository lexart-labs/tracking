// iframeResizer.directive.js
(function (ng) {

  "use strict";

  var Module = ng.module('LexTracking');

  Module.directive('iframeResizer', ["$timeout", "$rootScope", "$window", function ($timeout, $rootScope, $window) {
    return {
      restrict: 'A',
      scope: {
        onReady: '&?',
        onInitialized: '&?' // ⬅️ nuevo callback con la instancia resizer
        // <-- Permite pasar una función como atributo
      },
      link: function (scope, element, attrs) {
        var resizerInstance = null;

        function initResizer() {
          iframeResize({
            log: false,
            checkOrigin: false,
            license: "GPLv3",
            scrolling: "omit",
            onReady: function (iframeEl) {
              console.log('iframe listo:', iframeEl.iframeResizer);
              resizerInstance = iframeEl.iframeResizer;
              scope.$applyAsync(function () {
                if (scope.onReady) scope.onReady({ iframe: iframeEl });
              });
              let user = {
                userId: $rootScope.userId,
                userName: $rootScope.userName,
                userRole: $rootScope.userRole,
                isAdmin: $rootScope.isAdmin,
                userPhoto: $rootScope.userPhoto,
                userEmail: $rootScope.userEmail
              }
              resizerInstance.sendMessage({ user, token: $window.localStorage[TOKEN_KEY] }, '*');
            }
          }, element[0]);
        }

        // Esperar que el iframe cargue
        element.on('load', function () {
          initResizer();
        });
      }
    }
  }]);


}(angular));
