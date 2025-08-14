// iframeResizer.directive.js
(function (ng) {

  "use strict";

  var Module = ng.module('LexTracking');

  Module.directive('iframeResizer', ["$timeout", "$rootScope", "$window", function($timeout, $rootScope, $window) {  
      return { 
        restrict: 'A',
        scope: {
          onReady: '&?',
          onInitialized: '&?' // ⬅️ nuevo callback con la instancia resizer
          // <-- Permite pasar una función como atributo
        },
        link: function(scope, element, attrs) {
          function initResizer() {
            iframeResize({
              log: false,
              checkOrigin: false,
              license: "GPLv3",
              scrolling: "omit",
              onResized: function(data) {
                console.log('Iframe resized:', data.height);
              },
              onReady: function(iframeEl) {
                console.log('iframe listo:', iframeEl.iframeResizer);
                  scope.$applyAsync(function() {
                    scope.onReady({ iframe: iframeEl });
                  });
                let user = {
                  userId: $rootScope.userId,
                  userName: $rootScope.userName,
                  userRole: $rootScope.userRole,
                  isAdmin: $rootScope.isAdmin,
                  userPhoto: $rootScope.userPhoto,
                  userEmail: $rootScope.userEmail
                }
                  iframeEl.iframeResizer.sendMessage({ user, token: $window.localStorage[TOKEN_KEY] }, '*');
              }
            }, element[0]);
          }
    
          // Esperar que el iframe cargue
          element.on('load', function() {
            initResizer();
          });
        }
      }
  }]);


}(angular));