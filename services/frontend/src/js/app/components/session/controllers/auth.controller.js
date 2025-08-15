(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('AuthCtrl', ['$scope', '$rootScope', '$window', 'RestClient', '$log', '$state', '$filter', 'WeeklyHourServices', function ($scope, $rootScope, $window, RestClient, $log, $state, $filter, WeeklyHourServices) {

        $scope.user = {
            email: '',
            password: ''
        };
        $scope.sendingData = false;
        // AUTO FOCUS
        jQuery('input[type=email]').focus();

        $window.localStorage["userName"] = "";
        $window.localStorage["userRole"] = "";
        $window.localStorage["userId"] = "";

        $scope.isChecked = false;

        if ($window.localStorage[TOKEN_KEY]) {
            $state.go('app.dashboard');
        }

        $scope.authenticate = function () {
            $scope.sendingData = true;
            $scope.error = "";
            RestClient.post('user/login', $scope.user, function (err, result) {
                $scope.sendingData = false;
                if (result && !result.token) {
                    $rootScope.showToaster($filter('translate')('session.error_email_password'), 'error');
                    // $rootScope.showToaster($filter('translate')('session.error_email_password'), 'error');
                    // $scope.error = $filter('translate')('session.error_email_password');
                }
                else {
                    // LOCAL STORAGE
                    var user = result;

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

                    $rootScope.userId = $window.localStorage["userId"];
                    $rootScope.userName = $window.localStorage["userName"];
                    $rootScope.userEmail = $window.localStorage["userEmail"];
                    $rootScope.userRole = $window.localStorage["userRole"];
                    $rootScope.isAdmin = $window.localStorage["isAdmin"];
                    $rootScope.isClient = $window.localStorage["isClient"];
                    $rootScope.isDeveloper = $window.localStorage["isDeveloper"];
                    $rootScope.userPhoto = $window.localStorage["photo"];
                    if ($rootScope.isClient == 'true') {
                        $rootScope.userIdClient = $window.localStorage["idUserClient"];
                    }
                    $state.go('app.dashboard');
                }
            });
        };

    }]);

}(angular));
