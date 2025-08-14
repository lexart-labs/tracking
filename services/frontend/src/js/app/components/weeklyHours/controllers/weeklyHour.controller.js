(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('WeeklyHourCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'WeeklyHourServices','UserServices' , 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, WeeklyHourServices,UserServices, ngDialog) {

    $scope.users  = [];
    $scope.user  ={};
    $scope.select={};

    $scope.weeklyHour={};
    $scope.query    = "";
    $scope.currentPage  = 0;

    var idWeeklyHour          = $stateParams.id;

    if (idWeeklyHour) {
      WeeklyHourServices.findById(idWeeklyHour, function(err, response) {
        if (!err) {
          $scope.weeklyHour = angular.copy(response);
          if ($scope.weeklyHour.costHour && $scope.weeklyHour.costHour!="") {
            $scope.weeklyHour.costHour=parseFloat($scope.weeklyHour.costHour);
          }
          if ($scope.weeklyHour.workLoad && $scope.weeklyHour.workLoad!="") {
            $scope.weeklyHour.workLoad=parseFloat($scope.weeklyHour.workLoad);
          }
          if ($scope.weeklyHour.idUser && $scope.weeklyHour.idUser!="") {
            UserServices.findById($scope.weeklyHour.idUser,function (err,resp) {
              $scope.select.user=angular.copy(resp);
              
            });
          }

        }
      });
    }

   

    UserServices.find($scope.currentPage, $scope.query, function(err, users, countItems) {
      if (!err) {
        $scope.users  = users;
        $scope.total    = countItems;
      }
    });


    $scope.save = function () {
      var weeklyHour=angular.copy($scope.weeklyHour);
      if ($scope.select.user) {
        weeklyHour.idUser=$scope.select.user.id;
        weeklyHour.userName=$scope.select.user.name;

      }
      weeklyHour.borrado=0;


      console.log("weeklyHour to save",weeklyHour);
      WeeklyHourServices.save(weeklyHour,function (err,result) {
        if (!err) {
          console.log(result);
          $state.go('app.weeklyHours');

        }
      })
    };



  }]);

}(angular));
