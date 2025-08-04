(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('WeeklyHoursCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'WeeklyHourServices', 'ngDialog', function($scope,$interval, $rootScope, $filter, $timeout, WeeklyHourServices, ngDialog) {

    $scope.weeklyHours  = [];
    $scope.query    = "";
    $scope.currentPage  = 0;


    WeeklyHourServices.find($scope.currentPage, $scope.query, function(err, weeklyHours, countItems) {
        if (!err) {
            $scope.weeklyHours  = weeklyHours;
            $scope.total    = countItems;
        }
    });
  }]);

}(angular));
