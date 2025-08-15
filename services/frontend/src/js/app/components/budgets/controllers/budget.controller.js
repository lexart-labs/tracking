(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('BudgetCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'BudgetServices','ClientServices' , 'ngDialog', '$window', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, BudgetServices,ClientServices, ngDialog, $window) {

    $scope.clients  = [];
    $scope.client  ={};
    $scope.select={};
    $scope.statuses=[];
    $scope.concepts =[];

    $scope.budget={};

    $scope.query    = "";
    $scope.currentPage  = 0;

    var idBudget          = $stateParams.id;

    if (idBudget) {
      BudgetServices.findById(idBudget, function(err, response) {
        if (!err) {
          var budget= angular.copy(response);
          if (budget.date && budget.date!="") {
            budget.date=new Date(budget.date);
          }
          if (budget.amount && budget.amount!="") {
            budget.amount=parseFloat(budget.amount);
          }
          if (budget.hoursPayable && budget.hoursPayable!="") {
            budget.hoursPayable=parseFloat(budget.hoursPayable);
          }
          if (budget.hoursTotal && budget.hoursTotal!="") {
            budget.hoursTotal=parseFloat(budget.hoursTotal);
          }
          if (budget.idClient && budget.idClient!="") {
            ClientServices.findById(budget.idClient, function(err, client) {
              if (!err) {
                $scope.select.client = client;
              }
            });
          }
          $scope.budget = angular.copy(budget);
          console.log(budget);
        }
      });
    }



    ClientServices.find($scope.currentPage, $scope.query, function(err, clients, countItems) {
      if (!err) {
        $scope.clients  = clients;
        $scope.total    = countItems;
      }
    });

    BudgetServices.allStatus(function (err,status) {
      if (!err) {
        $scope.statuses  = status;
      }

    });


    BudgetServices.allConcepts(function (err,concepts) {
      console.log(concepts);
      if (!err) {
        $scope.concepts  = concepts;
      }

    });




    $scope.save = function () {
      var budget=angular.copy($scope.budget);
      if ($scope.select.client) {
        budget.idClient=$scope.select.client.id;
      }
      budget.active=1;

      budget.date=changeFormatDate($scope.budget.date);
      budget.idUser     = $window.localStorage["userId"];

      console.log("budget to save",budget);
      BudgetServices.save(budget,function (err,result) {
        if (!err) {
          console.log(result);
          $state.go('app.budgets');

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
