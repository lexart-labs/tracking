(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('HoursCostCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'HourCostServices', 'ngDialog', function($scope,$interval, $rootScope, $filter, $timeout, HourCostServices, ngDialog) {

    $scope.hoursCost  = [];
    $scope.query    = "";
    $scope.currentPage  = 0;


    HourCostServices.find($scope.currentPage, $scope.query, function(err, hoursCost, countItems) {
        if (!err) {
          console.log(hoursCost);
            $scope.hoursCost  = hoursCost;
            $scope.total    = countItems;
        }
    });
  }]);

}(angular));
