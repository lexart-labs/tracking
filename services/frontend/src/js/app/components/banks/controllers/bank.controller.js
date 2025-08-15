(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('BankCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'BankServices', 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, BankServices, ngDialog) {

    $scope.clients  = [];
    $scope.client  ={};
    $scope.users  = [];
    $scope.user  ={};
    $scope.select={};

    $scope.bank={};

    $scope.query    = "";
    $scope.currentPage  = 0;

    var idBank          = $stateParams.id;

    if (idBank) {
      BankServices.findById(idBank, function(err, response) {
        if (!err) {
          var bank= angular.copy(response);
          console.log(bank);
          if (bank.priceUsd &&  bank.priceUsd!="") {
            bank.priceUsd=parseFloat(bank.priceUsd);
          }
          $scope.bank = angular.copy(bank);
        }
      });
    }








    $scope.save = function () {
      var bank=angular.copy($scope.bank);
      bank.borrado=0;
      BankServices.save(bank,function (err,result) {
        if (!err) {
          $state.go('app.banks');
        }
      })
    };

    function changeFormatDate(date) {
      if (date != null && typeof date =="object") {
        date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' +
        ('00' + date.getUTCHours()).slice(-2) + ':' +
        ('00' + date.getUTCMinutes()).slice(-2) + ':' +
        ('00' + date.getUTCSeconds()).slice(-2);
        return date;
      }

    }

  }]);

}(angular));
