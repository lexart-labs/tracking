(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('tasks_trelloCtrl', ['$scope','$rootScope', '$timeout', '$filter', 'tasks_trelloServices', 'ProjectsServices', 'UserServices', 'ngDialog', '$state', '$stateParams', function($scope,$rootScope, $timeout, $filter, tasks_trelloServices, ProjectsServices, UserServices, ngDialog, $state, $stateParams) {

    $scope.tasks_trello        = [];
    $scope.task_trello         = {};
    $scope.duration            = {};
    $scope.users               = [];
    $scope.usersAux            = {};
    $scope.allTasks_trello     = [];
    $scope.filter              = {}
    $scope.currentPage         = 0;
    $scope.comments            = [];
    $scope.comment             = {};
    $scope.allStatus           = ["To-do","Done","In-Progress","In-Review"];
    $scope.state               = "";
    $scope.boards              = []

    var key   = "2f132aeb2a02c90e0966cbcfd9f45329";
    var token = "c9e22df4e936322b7949cc9b98c0e972f8991099f8bbb5733e70956abcd06ff4";

      var timeout;
    $scope.$watch('filter', function() {
      $timeout.cancel(timeout);
      timeout = $timeout(function() {
        $scope.filterTasks_trello();
      }, 250);
    }, true);
    if ($rootScope.isAdmin=='true') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];

    tasks_trelloServices.find($scope.currentPage, $scope.query, function(err, tasks_trello, countItems) {
        if (!err) {
          $scope.allTasks_trello = tasks_trello;
          if (tasks_trello) {
            $scope.tasks_trello = tasks_trello.slice(0, PAGE_SIZE);
            $scope.total = tasks_trello.length;
          }
        }
      });

    }else if ($rootScope.isClient =="true") {
      $scope.allStatus    =["In-Progress","In-Review"];
      tasks_trelloServices.findByIdClient($rootScope.userIdClient,function (err,tasks_trello) {
        if (!err) {
          $scope.tasks_trello = tasks_trello;
          $scope.tasks_trello = tasks_trello.slice(0, PAGE_SIZE);
          $scope.total = tasks_trello.length;

        }

      })


    }else  {
      $scope.allStatus    =["Done","In-Progress","In-Review"];

    tasks_trelloServices.find($scope.currentPage, $scope.query, function(err, tasks_trello, countItems) {
        if (!err) {
          $scope.allTasks_trello = tasks_trello;
          if (tasks_trello) {
            $scope.tasks_trello = tasks_trello.slice(0, PAGE_SIZE);
            $scope.total = tasks_trello.length;
          }
        }
      });
    }


    UserServices.find(0, '', function(err, users) {
      if (!err) {
        $scope.users = users;
      }
    });



    $scope.addBoard = function () {

      ProjectsServices.find($scope.currentPage, $scope.query, function(err, projects, countItems) {
        if (!err) {
          $scope.getProjects = projects;
          $scope.selected = { value: $scope.getProjects };
        }
      });

      tasks_trelloServices.getBoards(function(resp){
        $scope.boards = resp;
        $scope.selected = { url: $scope.boards };
      })

      ngDialog.open({
        template: '/app/components/tasks/taskTrello/views/createTable.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          cancel: function() {
            ngDialog.close();
          },
          confirm: function(){
            var trelloObj = {
                idBoard    : $scope.selected.url.id,
                url        : $scope.selected.url.url,
                project    : $scope.selected.value.id
              }
              tasks_trelloServices.saveBoards(trelloObj, function(resp){
              });
              $state.reload();
          }
        }
      })
    };

    $scope.editBoard = function (board) {
      console.log(board);
      $scope.selected = {};
      ProjectsServices.find($scope.currentPage, $scope.query, function(err, projects, countItems) {
      if (!err) {
          $scope.getProjects    = projects;
          $scope.selected.value =  $scope.getProjects.find(function(element) {return element.id == board.proyecto_id} );
        }
      });
      tasks_trelloServices.getBoards(function(resp){
        $scope.boards       = resp;
        $scope.selected.url =  $scope.boards.find(function(element) {return element.id == board.tablero_id} )
      })

      ngDialog.open({
        template: '/app/components/tasks/taskTrello/views/createTable.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function(){
            var trelloObj = {
              id      : board.id,
              idBoard : $scope.selected.url.id,
              url     : $scope.selected.url.url,
              project : $scope.selected.value.id
            }
            tasks_trelloServices.updateBoard(trelloObj, function(res, err){
            });
            $state.reload();
          },
          cancel: function() {
            ngDialog.close();
          }
        }
      });
    }

    $scope.deleteBoardTrello = function (id) {
      console.log("Board trello", id);
      tasks_trelloServices.deleteBoardTrello(id, function(err, res){
        console.log('Tablero trello eliminada::', err, res)
      })
    }

    $scope.filterTasks_trello = function () {
      $scope.currentPage = 0;
      $scope.tasks_trello = ($filter('filter')($scope.allTasks_trello, $scope.filter));
      if ($scope.tasks_trello) {
        $scope.total = $scope.tasks_trello.length;
        $scope.tasks_trello = $scope.tasks_trello.slice(0,  PAGE_SIZE );
      }
    };

    $scope.pager = function(page) {
      var offset = PAGE_SIZE * (page - 1);
      $scope.tasks_trello = $scope.allTasks_trello.slice(offset, offset + PAGE_SIZE );
    };


    $scope.agregarComentario= function () {
      if ($scope.comment.comment) {
        $scope.comment.userName=$rootScope.userName;

        $scope.comments.push($scope.comment);
        $scope.comment={};

      }

    }

    $scope.editComments =function (index,comment) {
      $scope.oldComment =angular.copy(comment);
      $scope.comment.comment=angular.copy(comment.comment);
      $scope.comments.splice(index,1);
      ngDialog.open({
        template: '/app/components/projects/views/project.task-comment.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            var windowIDs = ngDialog.getOpenDialogs();
            $scope.agregarComentario();

            ngDialog.close(windowIDs[1]);
          },
          cancel: function() {
            $scope.comments.splice(index, 0, $scope.oldComment);
            var windowIDs = ngDialog.getOpenDialogs();

            ngDialog.close(windowIDs[1]);
          }
        }
      });



    }


    $scope.openModalComentario= function () {
      $scope.comment ={};

      ngDialog.open({
        template: '/app/components/projects/views/project.task-comment.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            var windowIDs = ngDialog.getOpenDialogs();
            $scope.agregarComentario();

            ngDialog.close(windowIDs[1]);
          },
          cancel: function() {
            var windowIDs = ngDialog.getOpenDialogs();

            ngDialog.close(windowIDs[1]);
          }
        }
      });

    }

    $scope.changeStatus=function () {
      if ($scope.state=="In-Progress" && $scope.task_trello.status=="In-Review") {

        ngDialog.open({
          template: '/app/components/projects/views/project.task-review.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function() {
              var windowIDs = ngDialog.getOpenDialogs();
              sendEmail($scope.task_trello,$scope.review.user);
              ngDialog.close(windowIDs[1]);
            },
            cancel: function() {
              var windowIDs = ngDialog.getOpenDialogs();

              ngDialog.close(windowIDs[1]);
            }
          }
        });

      }
      $scope.state=$scope.task_trello.status;
    }

    $scope.deleteBoard = function(board){
      tasks_trelloServices.deleteBoardTrello(board.id, function(res, err){
        tasks_trelloServices.find($scope.currentPage, $scope.query, function(err, tasks_trello, countItems) {
          if (!err) {
            $scope.allTasks_trello = tasks_trello;
            if (tasks_trello) {
              $scope.tasks_trello = tasks_trello.slice(0, PAGE_SIZE );
              $scope.total = tasks_trello.length;
            }
          }
        });
      })
    }

    // TUTORIAL WIZARD
        $scope.tutorialBot = function(){
          var vm = this;
          //Model
          vm.currentStep = 1;
          vm.steps = [
            {
              step: 1,
              name: "First step",
              template: "step1.html",
            },
            {
              step: 2,
              name: "Second step",
              template: "step2.html"
            },
            {
              step: 3,
              name: "Third step",
              template: "step3.html"
            },
            {
              step: 4,
              name: "Fourth step",
              template: "step4.html"
            } ,
          ];
          vm.user = {};

          //Functions
          vm.gotoStep = function(newStep) {
            vm.currentStep = newStep;
          }

          vm.getStepTemplate = function(){
            for (var i = 0; i < vm.steps.length; i++) {
                  if (vm.currentStep == vm.steps[i].step) {
                      return vm.steps[i].template;
                  }
              }
          }


        ngDialog.open({
          template: '/app/components/tasks/taskTrello/views/tutorialBot.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function() {
              ngDialog.close();
            },
            cancel: function() {
              ngDialog.close();
            }
          }
        });
        $scope.error = "";
      };

  }]);
}(angular));
