(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');  

  Module.controller('TasksCtrl', ['$scope','$rootScope', '$timeout', '$filter', 'TasksServices', 'ProjectsServices', 'UserServices', 'ngDialog', 'PreviousState', '$stateParams', function($scope,$rootScope, $timeout, $filter, TasksServices, ProjectsServices, UserServices, ngDialog, PreviousState, $stateParams) {

    $scope.tasks        = [];
    $scope.task         = {};
    $scope.duration     = {};
    $scope.users        = [];
    $scope.usersAux     = {};
    $scope.allTasks     = [];
    $scope.filter       = {}
    $scope.currentPage  = 0;
    $scope.comments     = [];
    $scope.comment      = {};
    $scope.allStatus    = ["To-do","Done","In-Progress","In-Review"];
    $scope.state        = "";
    $scope.filterTask   = {};
    $scope.filterTask.limit   = 15;
    $scope.filterTask.offset  = 0;
    $scope.filterTask.filter  = [];
    var idUser          = $stateParams.id;

    var timeout;
    $scope.$watch('filter', function() {
      $timeout.cancel(timeout);
      timeout = $timeout(function() {
        $scope.filterTasks();
      }, 250);
    }, true);
    if ($rootScope.isAdmin=='true'&& PreviousState.Name!='app.users') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];
            
      TasksServices.findByFilter($scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasks', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });

    }else if ($rootScope.isAdmin=='true'&& PreviousState.Name=='app.users') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];
      
      TasksServices.findByIdUser(idUser, $scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasks', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });

    }else if ($rootScope.isClient =="true") {
      $scope.allStatus    =["In-Progress","In-Review"];
      TasksServices.findByIdClient($rootScope.userIdClient,function (err,tasks) {
        if (!err) {
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = tasks.length;
          console.log($scope.allTasks);
        }
      });

    }else  {
      $scope.allStatus    =["In-Progress","In-Review"];
      console.log($rootScope.userId);
      TasksServices.findByIdUser($rootScope.userId, $scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasksFilter', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });
    }


    UserServices.find(0, '', function(err, users) {
      if (!err) {
        $scope.users = users;
      }
    });


    $scope.editTask = function (index,task) {
      $scope.task = angular.copy(task);
      // if ($scope.task.duration) {
      //   $scope.task.hour = moment.duration($scope.task.duration).hours();
      //   $scope.task.mins = moment.duration($scope.task.duration).minutes();
      //   $scope.task.secs = moment.duration($scope.task.duration).seconds();
      // }
      if ($scope.task.duration) {
        var duration = $scope.task.duration.split(':');
        $scope.task.hour = parseInt(duration[0]);
        $scope.task.mins = parseInt(duration[1]);
        $scope.task.secs = parseInt(duration[2]);
      }
      if ($scope.task.startDate) {
        $scope.task.startDate=moment($scope.task.startDate).format("DD/MM/YYYY");
      }
      if ($scope.task.endDate) {
        $scope.task.endDate= moment($scope.task.endDate).format("DD/MM/YYYY");
      }
      $scope.state = $scope.task.status;

      try{
        var arr =$scope.task.comments.split('"comment":');
        var arr =($scope.task.comments) ? $scope.task.comments.split('"comment":') : Array();
      if (arr[0]=="[{") {
        $scope.comments=JSON.parse($scope.task.comments);


      }else {
      $scope.comments=[];
      }
      }catch(e){
        console.log('No tiene comentarios.');
      }
      console.log('$scope.task', $scope.task);
      if ($scope.task.users) {
          $scope.task.users = JSON.parse($scope.task.users);

        _.each($scope.task.users, function (user){
          $scope.usersAux[user.idUser] = true;
        });
      } else {
        $scope.task.users = [];
      }
      ngDialog.open({
        template: '/app/components/projects/views/project.task.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
          confirm: function() {
            console.log('push task');
            //Parse users
            $scope.task.users = [];
            console.log( $scope.usersAux);
            for (var user in $scope.usersAux) {
              console.log(user);
              if ($scope.usersAux[user]) {
                $scope.task.users.push({idUser: user});
              }
            }
            $scope.emailUsers = angular.copy(  $scope.task.users );
            $scope.task.users = JSON.stringify($scope.task.users);
            $scope.task.comments =JSON.stringify($scope.comments);
            if ($scope.task.id) {
              if ($scope.task.startDate) {
              var arrStart= $scope.task.startDate.split("/");
              $scope.task.startDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
              }
              if ($scope.task.endDate) {
                var arrStart= $scope.task.endDate.split("/");
                $scope.task.endDate=new Date(arrStart[2],arrStart[1]-1,arrStart[0]);
              }
              console.log(  $scope.emailUsers);
              $scope.task.duration = $scope.task.hour + ":" + $scope.task.mins + ":" + $scope.task.secs;


              console.log("TASK TO UPDATE",$scope.task);

              ProjectsServices.saveProjectTask($scope.task, function (err, result) {
                console.log("result::: ", result);
                if (!err) {
                  $scope.tasks[index]=angular.copy($scope.task);
                  $scope.task = {};
                }
              });
            }
            ngDialog.close();
          },
          cancel: function() {
            $scope.task = {};

            ngDialog.close();
          }
        }
      });
      $scope.error = "";
    };

    $scope.filterTasks = function () {
      $scope.filterTask.offset = 0;
      $scope.filterTask.filter = [];
      if($scope.filter){
        if($scope.filter.projectName){
          $scope.filterTask.filter.push({"projectName":$scope.filter.projectName});
        }
        if($scope.filter.name){
          $scope.filterTask.filter.push({"name":$scope.filter.name});
        }
        if($scope.filter.description){
          $scope.filterTask.filter.push({"description":$scope.filter.description});
        }
      }
      if ($rootScope.isAdmin=='true'&& PreviousState.Name!='app.users') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];
      
      TasksServices.findByFilter($scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasks', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });

    }else if ($rootScope.isAdmin=='true'&& PreviousState.Name=='app.users') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];
      console.log("PREVIUS STATE app.users :: ", PreviousState.Name);
      
      TasksServices.findByIdUser(idUser, $scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasks', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });

    }else if ($rootScope.isClient =="true") {
      $scope.allStatus    =["In-Progress","In-Review"];
      TasksServices.findByIdClient($rootScope.userIdClient,function (err,tasks) {
        if (!err) {
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = tasks.length;
          console.log($scope.allTasks);
        }
      });

    }else  {
      $scope.allStatus    =["In-Progress","In-Review"];
      console.log($rootScope.userId);
      TasksServices.findByIdUser($rootScope.userId, $scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasksFilter', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });
    }

    };

    $scope.pager = function(page) {
      console.log("page",page-1);
      var offset = PAGE_SIZE * (page - 1);
      $scope.filterTask.offset = offset;
      if ($rootScope.isAdmin=='true'&& PreviousState.Name!='app.users') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];
      
      TasksServices.findByFilter($scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasks', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });

    }else if ($rootScope.isAdmin=='true'&& PreviousState.Name=='app.users') {
      $scope.allStatus    =["Done","In-Progress","In-Review"];
      console.log("PREVIUS STATE app.users :: ", PreviousState.Name);
      
      TasksServices.findByIdUser(idUser, $scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasks', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });

    }else if ($rootScope.isClient =="true") {
      $scope.allStatus    =["In-Progress","In-Review"];
      TasksServices.findByIdClient($rootScope.userIdClient,function (err,tasks) {
        if (!err) {
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = tasks.length;
          console.log($scope.allTasks);
        }
      });

    }else  {
      $scope.allStatus    =["In-Progress","In-Review"];
      console.log($rootScope.userId);
      TasksServices.findByIdUser($rootScope.userId, $scope.filterTask, function(err, tasks, countItems) {
        if (!err) {
          console.log('tasksFilter', tasks, countItems);
          $scope.allTasks = tasks;
          $scope.tasks = tasks.slice(0, PAGE_SIZE - 1);
          $scope.total = countItems;
        }
      });
    }
    
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
      console.log($scope.comment);
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
      console.log("TASK",$scope.task.status,"STATE",$scope.state);
      if ($scope.state=="In-Progress" && $scope.task.status=="In-Review") {
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

              sendEmail($scope.task,$scope.review.user)





              ngDialog.close(windowIDs[1]);
            },
            cancel: function() {
              var windowIDs = ngDialog.getOpenDialogs();

              ngDialog.close(windowIDs[1]);
            }
          }
        });

      }
      $scope.state=$scope.task.status;

    }

    $scope.taskForm = function (task){
      console.log("task form::", task);
      $scope.taskForm = task;
    }

  }]);

}(angular));
