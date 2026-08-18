(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('AuthCtrl', ['$scope', '$rootScope', '$window', '$state', '$sce', function ($scope, $rootScope, $window, $state, $sce) {

        $window.localStorage["userName"] = "";
        $window.localStorage["userRole"] = "";
        $window.localStorage["userId"] = "";

        if ($window.localStorage[TOKEN_KEY]) {
            $state.go('app.dashboard');
            return;
        }

        var reactUrl = $rootScope.trackingReactUrl || (typeof TRACKING_REACT_URL !== 'undefined' ? TRACKING_REACT_URL : '');
        $scope.env_react_url = $sce.trustAsResourceUrl(reactUrl + '/#/login');

        function receiveLogin(event) {
            var iframe = document.getElementById('react-login');
            var user = event.data && event.data.user;

            if (!iframe || event.source !== iframe.contentWindow || !event.data || event.data.action !== 'login-success' || !user || !user.token) return;

            $window.localStorage[TOKEN_KEY] = user.token;
            $window.localStorage["userId"] = user.id;
            $window.localStorage["userName"] = user.name;
            $window.localStorage["userEmail"] = user.email;
            $window.localStorage["userRole"] = user.role;
            $window.localStorage["isAdmin"] = user.role == 'admin';
            $window.localStorage["isClient"] = user.role == 'client';
            $window.localStorage["isDeveloper"] = user.role == 'developer';
            $window.localStorage["idUserClient"] = user.idClient;
            $window.localStorage["photo"] = FILES_BASE + user.photo;

            $rootScope.$applyAsync(function () {
                $state.go('app.dashboard');
            });
        }

        $window.addEventListener('message', receiveLogin);
        $scope.$on('$destroy', function () {
            $window.removeEventListener('message', receiveLogin);
        });

    }]);

}(angular));
