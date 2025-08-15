(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('JiraTaskCtrl', ['$scope', '$rootScope', '$timeout', 'UserServices', 'ngDialog', 'JiraServices', '$stateParams', function($scope, $rootScope, $timeout, UserServices, ngDialog, JiraServices, $stateParams) {

        $scope.jiraTask = {};
        $scope.jiraTask.tasks = [];
        $scope.jiraTask.user = {};
        $scope.jiraTask.user.idBoard = $stateParams.id; 

        UserServices.findById($rootScope.userId, function(err, result){
            $scope.jiraTask.user.email = result.email;
            $scope.jiraTask.user.token = result.jiraToken;

            JiraServices.getIssuesByBoardCloud($scope.jiraTask.user, function(err, result){
                $scope.jiraTask.tasks = result;
                console.log($scope.jiraTask);
            })
        })

        $scope.delete = function(id){
            $scope.jiraTask.user.idTask = id;
            ngDialog.open({
                template: '/app/shared/views/delete.modal.html',
                showClose: true,
                scope: $scope,
                disableAnimation: true,
                data: {
                  msg: "Esta seguro que desea eliminar la tarea?",
                  confirm: function() {
                    JiraServices.delete($scope.jiraTask.user, function (err, result){
                        JiraServices.getIssuesByBoardCloud($scope.jiraTask.user, function(err, result){
                            $scope.jiraTask.tasks = result;
                            console.log($scope.jiraTask);
                        })
                    })
                  },
                  cancel: function() {
                    ngDialog.close(windowIDs[1]);
                  }
                }
            });
        }

    }]);

}(angular));