(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('BillsCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'BillServices', 'ngDialog', function($scope,$interval, $rootScope, $filter, $timeout, BillServices, ngDialog) {

    $scope.bills  = [];
    $scope.query    = "";
    $scope.currentPage  = 0;


    BillServices.find($scope.currentPage, $scope.query, function(err, bill, countItems) {
        if (!err) {
          console.log(bill);
            $scope.bills  = bill;
            $scope.total    = countItems;
        }
    });
  }]);

}(angular));
