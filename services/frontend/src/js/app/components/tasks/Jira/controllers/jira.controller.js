(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('JiraCtrl', ['$scope', '$rootScope', '$timeout', 'UserServices', 'ngDialog', 'JiraServices', '$stateParams', 'ProjectsServices', function($scope, $rootScope, $timeout, UserServices, ngDialog, JiraServices, $stateParams, ProjectsServices) {

        $scope.jiraTask        = {};
        $scope.jiraTask.user   = {};
        $scope.jiraTask.boards = {};
        $scope.jiraTask.boards.params = {};

        UserServices.findById($rootScope.userId, function(err, result){
        	$scope.jiraTask.user.idUser = result.id;
        	$scope.jiraTask.user.token  = result.jiraToken;
        	$scope.jiraTask.user.email  = result.email;

	        JiraServices.getAllDashboardsCloud($scope.jiraTask.user, function(err, result){
           		$scope.jiraTask.boards = result;
        	})
        })

        $scope.vinculate = function (project, $index){
            $scope.jiraTask.boards.params = $scope.jiraTask.boards[$index];

            if ($scope.jiraTask.boards.params.idProyecto != null) {

            } else {
              ngDialog.open({
                    template: '/app/components/tasks/jira/views/jiraProject.modal.html',
                    showClose: true,
                    scope: $scope,
                    disableAnimation: true,
                    data: {
                        msg: "Necesita vincular un proyecto a el tablero Jira",
                        prj: {
                              getProj: ProjectsServices.find($scope.currentPage, $scope.query, function(err, projects, countItems) {
                                          if (!err) {
                                            $scope.getProjects = projects;
                                            $scope.selected = { value: $scope.getProjects };
                                          }
                                        })
                            },
                        confirm: function() {
                            $scope.jiraTask.boards.params.idProyecto = $scope.selected.value.id;
                            $scope.jiraTask.boards.params.projectName = $scope.selected.value.name;
                            console.log($scope.jiraTask.boards);
                            JiraServices.saveDashboard($scope.jiraTask.boards.params, function(err, result){
                                $scope.jiraTask.boards.idProyecto = $scope.selected.value.id;
                                $scope.jiraTask.boards.projectName = $scope.selected.value.name;
                            })
                        },
                        cancel: function () {
                            ngDialog.close();
                            $scope.sendingData = false;
                        }
                    }
                });  
            }
        }

    }]);

}(angular));