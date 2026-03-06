(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('UsersCtrl', ['$scope', '$timeout', 'UserServices', 'ngDialog', '$rootScope', '$sce', function ($scope, $timeout, UserServices, ngDialog, $rootScope, $sce) {

        let reactUrl = $rootScope.trackingReactUrl || (typeof TRACKING_REACT_URL !== 'undefined' ? TRACKING_REACT_URL : '');
        let env_react_url = reactUrl + '/users';
        $scope.env_react_url = $sce.trustAsResourceUrl(env_react_url);

        $scope.users = [];
        $scope.filter = {};
        $scope.query = "";
        $scope.currentPage = 0;
        $scope.iframeOptions = {
            license: "GPLv3",
            log: 'collapsed',
            waitForLoad: true,
        };

        // USER LIST
        UserServices.find($scope.currentPage, $scope.query, function (err, users, countItems) {
            if (!err) {
                console.log('users', users, countItems);
                $scope.users = users;
                $scope.total = countItems;
            }
        });

        $scope.pager = function (page) {
            var offset = PAGE_SIZE * (page - 1);
            UserServices.find(offset, $scope.query, function (err, users, countItems) {
                console.log('users', users);
                $scope.users = users;
            });
        };

    }]);

}(angular));