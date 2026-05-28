(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('WeeklyHoursCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'WeeklyHourServices', 'ngDialog', '$sce', function($scope,$interval, $rootScope, $filter, $timeout, WeeklyHourServices, ngDialog, $sce) {

    $scope.weeklyHours  = [];
    $scope.query    = "";
    $scope.currentPage  = 0;
    $scope.showDeleted  = false;

    $scope.env_react_url = $sce.trustAsResourceUrl($rootScope.trackingReactUrl + '/#/weeklyhours');

    WeeklyHourServices.find($scope.currentPage, $scope.query, function(err, weeklyHours, countItems) {
        if (!err) {
            $scope.weeklyHours  = weeklyHours;
            $scope.total    = countItems;
        }
    });
  }]);

}(angular));
