(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('UsersCtrl', ['$scope', '$timeout', 'UserServices', 'ngDialog', function($scope, $timeout, UserServices, ngDialog) {

        $scope.users  = [];
        $scope.filter = {};
        $scope.query  = "";
        $scope.currentPage  = 0;

        // USER LIST
        UserServices.find($scope.currentPage, $scope.query, function(err, users, countItems) {
            if (!err) {
                console.log('users', users, countItems);
                $scope.users = users;
                $scope.total = countItems;
            }
        });

        $scope.pager = function(page) {
            var offset = PAGE_SIZE * (page - 1);
            UserServices.find(offset, $scope.query, function(err, users, countItems){
                console.log('users', users);
                $scope.users = users;
            });
        };

    }]);

}(angular));