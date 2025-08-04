(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('HourCostCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'HourCostServices','ClientServices' ,'UserServices', 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, HourCostServices,ClientServices,UserServices, ngDialog) {

    $scope.clients  = [];
    $scope.client  ={};
    $scope.users  = [];
    $scope.user  ={};
    $scope.select={};

    $scope.hourCost={};

    $scope.query    = "";
    $scope.currentPage  = 0;

    var idHourCost          = $stateParams.id;

    if (idHourCost) {
      HourCostServices.findById(idHourCost, function(err, response) {
        if (!err) {
          var hourCost= angular.copy(response);
          console.log(hourCost);
          if (hourCost.date && hourCost.date!="") {
            hourCost.date=new Date(hourCost.date);
          }
          if (hourCost.costClient && hourCost.costClient!="") {
            hourCost.costClient = parseFloat(hourCost.costClient);


          }
          if (hourCost.costUser && hourCost.costUser!="") {
            hourCost.costUser = parseFloat(hourCost.costUser);
          }

          if (hourCost.idClient && hourCost.idClient!="") {
            ClientServices.findById(hourCost.idClient, function(err, client) {
              if (!err) {
                $scope.select.client = client;
              }
            });
          }
          if (hourCost.idUser && hourCost.idUser!="") {
            UserServices.findById(hourCost.idUser, function(err, user) {
              if (!err) {
                $scope.select.user = user;
              }
            });
          }
          $scope.hourCost = angular.copy(hourCost);
        }
      });
    }



    ClientServices.find($scope.currentPage, $scope.query, function(err, clients, countItems) {
      if (!err) {
        $scope.clients  = clients;
        $scope.total    = countItems;
      }
    });

    UserServices.find($scope.currentPage, $scope.query, function(err, users, countItems) {
      if (!err) {
        $scope.users  = users;
        $scope.total    = countItems;
      }
    });




    $scope.save = function () {
      var hourCost=angular.copy($scope.hourCost);
      console.log($scope.select);
      if ($scope.select.client) {
        hourCost.idClient=$scope.select.client.id;
      }
      if ($scope.select.user) {
        hourCost.idUser=$scope.select.user.id;
      }
      hourCost.active=1;

      hourCost.date=changeFormatDate($scope.hourCost.date);


      HourCostServices.save(hourCost,function (err,result) {
        if (!err) {
          console.log(result);
          $state.go('app.hoursCost');

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
