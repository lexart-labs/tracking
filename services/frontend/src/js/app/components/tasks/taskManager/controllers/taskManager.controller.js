(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('taskManagerCtrl', ['$scope','$rootScope', '$timeout', '$filter', 'ProjectsServices', 'ngDialog','UserServices', function($scope,$rootScope, $timeout, $filter, ProjectsServices, ngDialog,UserServices) {
    $scope.labels = [];
    $scope.allLabels = [];
    $scope.series = ['Total Tareas', 'Total Completas'];
    $scope.ColorBar = ['#0059FF', '#F95C33'];
    UserServices.find(0, '', function(err, users) {
      if (!err) {
          $scope.users = users;
      }
      console.log('users', $scope.users);
    });
    $scope.allData = [
      [],
      []
    ];
    $scope.data = [
      [],
      []
    ];
    $scope.options = {
        maintainAspectRatio: false,
        scales: {
        xAxes: [{
            barPercentage: 0.5,
            barThickness: 30,
            gridLines: {
                color: "rgba(0, 0, 0, 0)",
            }
        }],
        yAxes: [{
            ticks: {
                 beginAtZero: true
             }
            // gridLines: {
            //     color: "rgba(0, 0, 0, 0)",
            // },
            // display: false   
        }]
    }
    }
    $scope.taskManager     = [];
    $scope.allProjects  = [];
    $scope.filter       = {};
    $scope.query        = "";
    $scope.currentPage  = 0;
    var timeout;
      ProjectsServices.getProjectsByDev($rootScope.userId, function(err, projects) {
        console.log(err, projects);
        if (!err) {
          console.log('projects', projects);
          $scope.allProjects  = projects;
          angular.forEach($scope.allProjects, function(value, key) {
                var tasknumber = value.tasknumber.split("/");
                $scope.allLabels[key] = value.name;
                if (!tasknumber[0]) {
                    tasknumber[0] = 0;
                }
                $scope.allData[0][key] = tasknumber[1];
                $scope.allData[1][key] = tasknumber[0];
                $scope.allProjects[key].tasknumber = tasknumber[0] + '/' + tasknumber[1];
          });
          $scope.projects     = angular.copy($scope.allProjects);
          otherfunctions();
        }
      });

    function otherfunctions() {
      $scope.usersel = {};
        $scope.filterProjects = function () {
          $scope.currentPage = 0;
          $scope.projects = ($filter('filter')($scope.allProjects, $scope.filter));
          console.log('filter',$scope.filter);
          if ($scope.projects) {
            $scope.total    = $scope.projects.length;
            $scope.projects = $scope.projects.slice(0,  PAGE_SIZE - 1);
            $scope.labels = [];
            $scope.data = [
                [],
                []
            ];
            angular.forEach($scope.projects, function(value, key) {
              var tasknumber = value.tasknumber.split("/");
              $scope.labels[key] = value.name;
              if (!tasknumber[0]) {
                  tasknumber[0] = 0;
              }
              $scope.data[0][key] = tasknumber[1];
              $scope.data[1][key] = tasknumber[0];
            })  
          }
        };

        $scope.filterUsers = function () {
          $scope.currentPage = 0;
          var usuario = [];
          usuario.users = angular.copy('{"idUser":"'+$scope.usersel.id+'"}');
          $scope.filter.users = usuario.users;
         console.log('filter',usuario);
        };
        $scope.lista = false;
        $scope.filtro = true;
        $scope.filterall = false;
        $scope.filteractive = function (index) {
          if (index == 'verdad') {
            $scope.filter.users = undefined;
            $scope.filterall = false;
             $scope.lista = false;
            $scope.filtro = true;
          } else if (index == 'falso') {
            $scope.lista = true;
            $scope.filtro = false;
            $scope.filterall = true;
          }

        }

        $scope.$watch('filter', function() {
          $timeout.cancel(timeout);
          timeout = $timeout(function() {
            $scope.filterProjects();
          }, 250);
        }, true);

        $scope.pager = function(page) {
         var offset = PAGE_SIZE * (page - 1);
          $scope.projects = $scope.allProjects.slice(offset, offset + PAGE_SIZE - 1);
          
            angular.forEach($scope.projects, function(value, key) {
              var tasknumber = value.tasknumber.split("/");
              $scope.labels[key] = value.name;
              if (!tasknumber[0]) {
                  tasknumber[0] = 0;
              }
              $scope.data[0][key] = tasknumber[1];
              $scope.data[1][key] = tasknumber[0];
            })  
        };


        $scope.editTaskManager = function (index,arrayindex) {
          var idProject = index.id;
          var idUser = angular.copy($rootScope.userId);
          ProjectsServices.findById(idProject, function(err, project) {
            if (!err) {
              console.log('project:', project);
              $scope.project = project;
              $scope.project.arrayindex = arrayindex;
              if (project.description == "") {
                $scope.project.description = 'Sin Descripción';
              }

              if (project.comments == "" || !project.comments) {
                $scope.project.comments = 'Sin Comentarios';
              }

              //Project tasks
              ProjectsServices.getProjectTasksbyUser(idProject,idUser, function(err, tasks) {
                if (!err) {
                  console.log('tasks:', tasks);
                  $scope.tasks = tasks;
                }
              })
            ngDialog.open({
              template: '/app/components/taskManager/views/TaskManagerView.modal.html',
              showClose: true,
              scope: $scope,
              disableAnimation: true,
              data: {
                close: function() {
                  $scope.tasks = {};
                  $scope.project = {};
                  ngDialog.close();
                }
              }
            });
            $scope.error = "";
          }
          });
        };

        $scope.checktask = function (index) {
          var task = angular.copy($scope.tasks[index]);
          console.log('Change status',task);
          var counter = 0;
          ProjectsServices.saveProjectTask(task, function (err, result) {
                if (!err) {
                  var changetasknumber = $scope.projects[$scope.project.arrayindex].tasknumber;
                  var changetasknumber = angular.copy(changetasknumber.split('/'));
                  angular.forEach($scope.tasks, function(value, key) {
                    if (value.status == 'Done') {
                      counter = counter + 1;
                    }
                  });
                  changetasknumber = counter + "/" + changetasknumber[1];
                  $scope.projects[$scope.project.arrayindex].tasknumber = changetasknumber;
                }
          });
        }
    }  
  }]);

}(angular));
