(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('EvalCtrl', ['$scope','$interval', '$state', '$rootScope', '$filter', '$timeout', 'UserServices', 'ClientServices', 'ProjectsServices', 'TracksServices', 'ngDialog','WeeklyHourServices', 'TasksServices', function($scope,$interval, $state, $rootScope, $filter, $timeout, UserServices, ClientServices, ProjectsServices, TracksServices, ngDialog,WeeklyHourServices,TasksServices) {

  $scope.developers = [];

  UserServices.find($scope.currentPage, $scope.query, function(err, users, countItems) {
    if (!err) {
      $scope.users = users;
      for (var i = 0; i < $scope.users.length; i++){
        if ($scope.users[i].role == 'developer') {
          $scope.developers.push($scope.users[i]);
          $scope.total = countItems;
          console.log('role users::', $scope.developers);
        }
      }
    }
  });

  }]);

}(angular));
