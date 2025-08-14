(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('tasks_automaticCtrl', ['$scope','$rootScope', '$timeout', '$filter', 'tasks_automaticServices', 'ProjectsServices', 'UserServices', 'ngDialog', function($scope,$rootScope, $timeout, $filter, tasks_automaticServices, ProjectsServices, UserServices, ngDialog) {

    $scope.tasks_automatic        = [];
    $scope.task_automatic         = {};
    $scope.duration               = {};
    $scope.users                  = [];
    $scope.usersAux               = {};
    $scope.allTasks_automatic     = [];
    $scope.filter                 = {}
    $scope.currentPage            = 0;
    $scope.comments               = [];
    $scope.comment                = {};
    $scope.allStatus              = ["To-do","Done","In-Progress","In-Review"];
    $scope.state                  = "";


      var timeout;
    $scope.$watch('filter', function() {
      $timeout.cancel(timeout);
      timeout = $timeout(function() {
        $scope.filterTasks_automatic();
      }, 250);
    }, true);
    if ($rootScope.isAdmin=='true') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];

      tasks_automaticServices.find($scope.currentPage, $scope.query, function(err, tasks_automatic, countItems) {
        if (!err) {
          $scope.allTasks_automatic = tasks_automatic;
          if (tasks_automatic) {
            $scope.tasks_automatic = tasks_automatic.slice(0, PAGE_SIZE - 1);
            $scope.total = tasks_automatic.length;
          }

        }
      });

    }else if ($rootScope.isClient =="true") {
      $scope.allStatus    =["In-Progress","In-Review"];
      tasks_automaticServices.findByIdClient($rootScope.userIdClient,function (err,tasks_automatic) {
        if (!err) {
          $scope.allTasks_automatic = tasks_automatic;
          $scope.tasks_automatic = tasks_automatic.slice(0, PAGE_SIZE - 1);
          $scope.total = tasks_automatic.length;

        }

      })


    }else  {
      $scope.allStatus    =["Done","In-Progress","In-Review"];

      tasks_automaticServices.find($scope.currentPage, $scope.query, function(err, tasks_automatic, countItems) {
        if (!err) {
          $scope.allTasks_automatic = tasks_automatic;
          if (tasks_automatic) {
            $scope.tasks_automatic = tasks_automatic.slice(0, PAGE_SIZE - 1);
            $scope.total = tasks_automatic.length;
          }

        }
      });
    }


    UserServices.find(0, '', function(err, users) {
      if (!err) {
        $scope.users = users;
      }
    });


    $scope.editTask_automatic = function (index,task_automatic) {
      $scope.task_automatic = angular.copy(task_automatic);

      if ($scope.task_automatic.startDate) {
        $scope.task_automatic.startDate=moment($scope.task_automatic.startDate).format("DD/MM/YYYY");
      }
      if ($scope.task_automatic.endDate) {
        $scope.task_automatic.endDate= moment($scope.task_automatic.endDate).format("DD/MM/YYYY");
      }
      $scope.error = $scope.task_automatic.error;

      if ($scope.task_automatic.users) {
          $scope.task_automatic.users = JSON.parse($scope.task_automatic.users);

        _.each($scope.task_automatic.users, function (user){
          $scope.usersAux[user.idUser] = true;
        });
      } else {
        $scope.task_automatic.users = [];
      }
      ngDialog.open({
        template: '/app/components/task_automatic/views/task_automatic.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            console.log('push task_automatic');
            //Parse users
            $scope.task_automatic.users = [];
            for (var user in $scope.usersAux) {
              if ($scope.usersAux[user]) {
                $scope.task_automatic.users.push({idUser: user});
              }
            }
            $scope.emailUsers = angular.copy(  $scope.task_automatic.users );
            $scope.task_automatic.users = JSON.stringify($scope.task_automatic.users);

            $scope.task_automatic.comments =JSON.stringify($scope.comments);
            if ($scope.task_automatic.id) {
              if ($scope.task_automatic.startDate) {
              var arrStart= $scope.task_automatic.startDate.split("/");
              $scope.task_automatic.startDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
              }
              if ($scope.task_automatic.endDate) {
                var arrStart= $scope.task_automatic.endDate.split("/");
                $scope.task_automatic.endDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
              }

              tasks_automaticServices.saveTask_Automatic($scope.task_automatic, function (err, result) {
                if (!err) {
                  $scope.tasks_automatic[index]=angular.copy($scope.task_automatic);
                  $scope.task_automatic = {};
                }
              });
            }
            ngDialog.close();
          },
          cancel: function() {
            $scope.task_automatic = {};

            ngDialog.close();
          }
        }
      });
      $scope.error = "";
    };

    $scope.showCode = function () {

      ngDialog.open({
        template: '/app/components/task_automatic/views/showCode.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          cancel: function() {
            ngDialog.close();
          }
        }
      });
      $scope.code = 'var lextrackingDebug = function() { window.onerror = function (msg, url, lineNo, columnNo, error) { var captureOrigin = document.title + " - " + window.location.origin; console.log("msg:: ", msg); console.log("url:: ", url); console.log("lineNo:: ", lineNo); console.log("columnNo:: ", columnNo); console.log("error:: ", error); console.log("Origin:: ", captureOrigin); var cfile = url.split("/"); var file = cfile[7]; console.log("file:: ", file); var obj = { error: msg, url: url, origin: captureOrigin, line: lineNo, column: columnNo, file: file }; Jobj = JSON.stringify(obj); console.log("xhr:: ", Jobj); var xhr = new XMLHttpRequest(); xhr.open("POST", "'+BASE_URL+'taskAutomatic/new", true); xhr.setRequestHeader("Content-Type", "application/json"); xhr.send(Jobj); return false; } }; lextrackingDebug();';

    $scope.ecode = "Copiar codigo";

    $scope.copyCode = function(){
      var codes = document.getElementById("codes");
      codes.focus();
      codes.select();
      document.execCommand("copy");
      $scope.ecode = "Codigo copiado!";
      }
    };

    $scope.deleteTask = function (id) {
      tasks_automaticServices.remove(id, function(err, result){
        console.log('Tarea automatica eliminada::', err, result);
      })
    }

    $scope.filterTasks_automatic = function () {
      $scope.currentPage = 0;
      $scope.tasks_automatic = ($filter('filter')($scope.allTasks_automatic, $scope.filter));
      if ($scope.tasks_automatic) {
        $scope.total = $scope.tasks_automatic.length;
        $scope.tasks_automatic = $scope.tasks_automatic.slice(0,  PAGE_SIZE - 1);
      }
    };

    $scope.pager = function(page) {
      var offset = PAGE_SIZE * (page - 1);
      $scope.tasks_automatic = $scope.allTasks_automatic.slice(offset, offset + PAGE_SIZE - 1);
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
            console.log($scope.review);
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
            console.log($scope.review);
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
      if ($scope.state=="In-Progress" && $scope.task_automatic.status=="In-Review") {
        console.log("OPEN MODAL");

        ngDialog.open({
          template: '/app/components/projects/views/project.task-review.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
            confirm: function() {
              console.log($scope.review);
              var windowIDs = ngDialog.getOpenDialogs();

              sendEmail($scope.task_automatic,$scope.review.user)

              ngDialog.close(windowIDs[1]);
            },
            cancel: function() {
              var windowIDs = ngDialog.getOpenDialogs();

              ngDialog.close(windowIDs[1]);
            }
          }
        });

      }
      $scope.state=$scope.task_automatic.status;

    }


  }]);
}(angular));
