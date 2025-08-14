(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('ProjectsCtrl', ['$scope','$rootScope', '$timeout', '$filter', 'ProjectsServices', 'TracksServices', 'ngDialog', function($scope,$rootScope, $timeout, $filter, ProjectsServices, ngDialog, TracksServices) {

    $scope.projects     = [];
    $scope.allProjects  = [];
    $scope.filter       = {};
    $scope.query        = "";
    $scope.currentPage  = 0;

    var timeout;
    $scope.$watch('filter', function() {
      $timeout.cancel(timeout);
      timeout = $timeout(function() {
        $scope.filterProjects();
      }, 250);
    }, true);



    if ($rootScope.isAdmin=="true") {
      ProjectsServices.find($scope.currentPage, $scope.query, function(err, projects, countItems) {
        if (!err) {
          console.log('projects', projects, countItems);
          $scope.allProjects  = projects;
          $scope.projects     = projects.slice(0, PAGE_SIZE - 1);
          $scope.total        = projects.length;
        }
      });
    }else if($rootScope.isClient =="true") {
      ProjectsServices.getProjectsByClient($rootScope.userIdClient, function(err, projects) {
        console.log(err, projects);
        if (!err) {
          console.log('projects', projects);
          $scope.allProjects  = projects;
          $scope.projects     = angular.copy($scope.allProjects);
        }
      });
    }else {
      // ProjectsServices.getProjectsByUser($rootScope.userId, function(err, projects) {
      //   console.log(err, projects);
      //   if (!err) {
      //     console.log('projects', projects);
      //     $scope.allProjects  = projects;
      //     $scope.projects     = angular.copy($scope.allProjects);
      //   }
      // });
      ProjectsServices.find($scope.currentPage, $scope.query, function(err, projects, countItems) {
        if (!err) {
          console.log('projects', projects, countItems);
          $scope.allProjects  = projects;
          $scope.projects     = projects.slice(0, PAGE_SIZE - 1);
          $scope.total        = projects.length;
        }
      });
    }

    $scope.filterProjects = function () {
      $scope.currentPage = 0;
      $scope.projects = ($filter('filter')($scope.allProjects, $scope.filter));
      if ($scope.projects) {
        $scope.total    = $scope.projects.length;
        $scope.projects = $scope.projects.slice(0,  PAGE_SIZE - 1);
      }
    };

    $scope.pager = function(page) {
      var offset = PAGE_SIZE * (page - 1);
      $scope.projects = $scope.allProjects.slice(offset, offset + PAGE_SIZE - 1);
    };  

  }]);

}(angular));
