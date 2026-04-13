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
          $scope.allProjects  = projects.filter(function(p){ return p.active == 1; });
          $scope.filterProjects();
        }
      });
    }else if($rootScope.isClient =="true") {
      ProjectsServices.getProjectsByClient($rootScope.userIdClient, function(err, projects) {
        console.log(err, projects);
        if (!err) {
          console.log('projects', projects);
          $scope.allProjects  = projects.filter(function(p){ return p.active == 1; });
          $scope.filterProjects();
        }
      });
    }else {
      ProjectsServices.find($scope.currentPage, $scope.query, function(err, projects, countItems) {
        if (!err) {
          console.log('projects', projects, countItems);
          $scope.allProjects  = projects.filter(function(p){ return p.active == 1; });
          $scope.filterProjects();
        }
      });
    }

    $scope.deleteProject = function (id) {
      if (confirm('Tem certeza que deseja excluir este projeto?')) {
        ProjectsServices.remove(id, function (err, result) {
          if (!err) {
            $scope.allProjects = $scope.allProjects.filter(function (project) {
              return project.id !== id;
            });
            $scope.filterProjects();
            $rootScope.showToaster('Projeto excluído com sucesso', 'success');
          } else {
            $rootScope.showToaster('Erro ao excluir projeto', 'error');
          }
        });
      }
    };

    $scope.filterProjects = function () {
      $scope.currentPage = 0;
      var filtered = $filter('filter')($scope.allProjects, $scope.filter);

      $scope.filteredList = filtered;
      $scope.total = filtered.length;
      $scope.projects = filtered.slice(0, PAGE_SIZE - 1);
    };

    $scope.pager = function(page) {
      var offset = PAGE_SIZE * (page - 1);
      $scope.projects = $scope.filteredList.slice(offset, offset + PAGE_SIZE - 1);
    };  

  }]);

}(angular));
