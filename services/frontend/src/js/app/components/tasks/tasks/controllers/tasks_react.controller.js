'use strict';

angular.module('app')
    .controller('TasksReactCtrl', ['$scope', 'envService', function($scope, envService) {
        var reactUrl = envService.read('reactUrl');
        $scope.env_react_url = reactUrl + '/#/tasks';
    }]);
