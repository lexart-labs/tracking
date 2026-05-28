(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('WeeklyHourCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'WeeklyHourServices','UserServices' , 'ngDialog', '$sce', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, WeeklyHourServices,UserServices, ngDialog, $sce) {

    $scope.users  = [];
    $scope.user  ={};
    $scope.select={};

    $scope.weeklyHour={};
    $scope.query    = "";
    $scope.currentPage  = 0;

    var idWeeklyHour          = $stateParams.id;

    $scope.env_react_url = $sce.trustAsResourceUrl($rootScope.trackingReactUrl + '/#/weeklyhour/' + (idWeeklyHour || 'NEW'));

    if ($rootScope.showIframe) return false;

    if (!idWeeklyHour) {
      $scope.weeklyHour.valid_from = new Date();
    }

    function parseLocalDate(s) {
      if (!s) return null;
      var parts = s.split('-');
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

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
          $scope.weeklyHour.valid_from  = parseLocalDate($scope.weeklyHour.valid_from);
          $scope.weeklyHour.valid_until = parseLocalDate($scope.weeklyHour.valid_until);
        }
      });
    }



    UserServices.find($scope.currentPage, $scope.query, function(err, users, countItems) {
      if (!err) {
        $scope.users  = users;
        $scope.total    = countItems;
      }
    });


    function toLocalDateString(d) {
      if (!d) return null;
      if (typeof d === 'string') return d;
      var month = '' + (d.getMonth() + 1);
      var day   = '' + d.getDate();
      var year  = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length   < 2) day   = '0' + day;
      return [year, month, day].join('-');
    }

    $scope.delete = function () {
      ngDialog.open({
        template: '/app/shared/views/delete.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            WeeklyHourServices.remove($scope.weeklyHour.id, function(err, result) {
              if (!err) {
                $state.go('app.weeklyHours');
              }
            });
          }
        }
      });
    };

    $scope.activate = function () {
      WeeklyHourServices.activate($scope.weeklyHour.id, function(err, result) {
        if (!err) {
          $state.go('app.weeklyHours');
        }
      });
    };

    $scope.save = function () {
      $scope.dateError = null;

      if ($scope.weeklyHour.valid_until && $scope.weeklyHour.valid_from) {
        if ($scope.weeklyHour.valid_until <= $scope.weeklyHour.valid_from) {
          $scope.dateError = $filter('translate')('weeklyHours.validUntilError');
          return;
        }
      }

      var weeklyHour=angular.copy($scope.weeklyHour);
      if ($scope.select.user) {
        weeklyHour.idUser=$scope.select.user.id;
        weeklyHour.userName=$scope.select.user.name;

      }
      weeklyHour.borrado=0;
      weeklyHour.valid_from  = toLocalDateString(weeklyHour.valid_from);
      weeklyHour.valid_until = toLocalDateString(weeklyHour.valid_until);

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
