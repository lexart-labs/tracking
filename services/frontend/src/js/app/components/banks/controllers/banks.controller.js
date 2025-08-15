(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('BanksCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'BankServices', 'ngDialog', function($scope,$interval, $rootScope, $filter, $timeout, BankServices, ngDialog) {

    $scope.banks  = [];
    $scope.query    = "";
    $scope.currentPage  = 0;


    BankServices.find($scope.currentPage, $scope.query, function(err, bank, countItems) {
        if (!err) {
            $scope.banks  = bank;
            $scope.total    = countItems;
        }
    });
  }]);

}(angular));
