(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('JiraTaskFormCtrl', ['$scope', '$rootScope', '$timeout', 'UserServices', 'ngDialog', 'JiraServices', '$stateParams', '$state', function($scope, $rootScope, $timeout, UserServices, ngDialog, JiraServices, $stateParams, $state) {
        
        var jiraTask    = $stateParams.id;
        var jiraBoard   = $stateParams.idboard;
        $scope.jiraTask = {};
        $scope.jiraTask.params = {};
        $scope.jiraTask.task   = {};
        $scope.jiraTask.task.comments = [];
        $scope.labels = [{'id': 31, 'status': 'Done'},{'id': 11, 'status': 'To Do'},{'id': 21, 'status': 'In Progress'}]
        $scope.priority = ['Highest','High','Medium','Low','Lowest'];
        $scope.comment = {};
        $scope.users = [];
        $scope.usersAux={};

        UserServices.findById($rootScope.userId, function(err, result){
            $scope.jiraTask.params.email   = result.email;
            $scope.jiraTask.params.token   = result.jiraToken;
            if(jiraTask){
            $scope.jiraTask.params.keyTask = jiraTask;
              JiraServices.getIssueById($scope.jiraTask.params, function(err, result){
                console.log(result);
                  $scope.jiraTask.task = result[0];
                  $scope.jiraTask.task.comments = result[1];
                  $scope.jiraTask.task.status = $scope.labels.find(function(element){ return element.status == $scope.jiraTask.task.status});
                  console.log($scope.jiraTask);           
              })
            } else {
              $scope.jiraTask.task.idBoard = jiraBoard;
              $scope.jiraTask.task.status = {'id': 11, 'status': 'To Do'};
            }
        })

        $scope.openModalComentario = function(){
          ngDialog.open({
              template: '/app/components/projects/views/project.task-comment.modal.html',
              showClose: true,
              scope: $scope,
              disableAnimation: true,
              data: {
                confirm: function() {
                  $scope.jiraTask.params.comment = $scope.comment.comment;
                  console.log($scope.jiraTask.params);
                  JiraServices.addComment($scope.jiraTask.params, function (err, result) {
                    var windowIDs = ngDialog.getOpenDialogs();
                    ngDialog.close(windowIDs[1]);                    
                    $scope.jiraTask.task.comments.push({'author': $scope.jiraTask.params.email, 'text': $scope.comment.comment});
                  })
                },
                cancel: function() {
                  var windowIDs = ngDialog.getOpenDialogs();
                  ngDialog.close(windowIDs[1]);
                }
              }
          });            
        }

        $scope.editComments = function(idComm,comment){
          $scope.comment.comment = comment;
          ngDialog.open({
            template: '/app/components/projects/views/project.task-comment.modal.html',
            showClose: true,
            scope: $scope,
            disableAnimation: true,
            data: {
              confirm: function() {
                $scope.jiraTask.params.comment = $scope.comment.comment;
                $scope.jiraTask.params.idComm   = idComm;
                console.log($scope.jiraTask.params);
                JiraServices.addComment($scope.jiraTask.params, function (err, result) {
                  var windowIDs = ngDialog.getOpenDialogs();
                  ngDialog.close(windowIDs[1]);                    
                  $scope.jiraTask.task.comments.push({'author': $scope.jiraTask.params.email, 'text': $scope.comment.comment});
                })
              },
              cancel: function() {
                var windowIDs = ngDialog.getOpenDialogs();
                ngDialog.close(windowIDs[1]);
              }
            }
        });  
        }

        $scope.openModalUsers = function (){
          UserServices.find('', '', function(err, result){
            $scope.users = result;
            console.log($scope.users)
          })
          ngDialog.open({
            template: '/app/components/tasks/jira/views/jiraTaskUser.modal.html',
            showClose: true,
            scope: $scope,
            disableAnimation: true,
            data: {
              confirm: function(user) {                
                console.log($scope.usersAux);
                if($scope.usersAux){
                  $scope.jiraTask.users = Object.keys($scope.usersAux);
                }
              },
              cancel: function() {
                var windowIDs = ngDialog.getOpenDialogs();
                ngDialog.close(windowIDs[1]);
              }
            }
        }); 
        }

        $scope.save = function(){
          console.log($scope.jiraTask);
          console.log(Object.keys($scope.jiraTask.task.status).length);
          if(Object.keys($scope.jiraTask.task.status).length > 1){
            $scope.jiraTask.task.status = $scope.jiraTask.task.status.id;
          }
          JiraServices.save($scope.jiraTask, function(err, result){
              $state.go('app.jiraTasks', {'id': $scope.jiraTask.task.idBoard});
          })
        }

    }]);

}(angular));