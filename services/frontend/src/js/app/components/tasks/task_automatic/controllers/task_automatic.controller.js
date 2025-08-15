(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('task_automaticCtrl', ['$scope', '$state', '$stateParams', '$filter', 'tasks_automaticServices', 'ngDialog', function($scope, $state, $stateParams, $filter, tasks_automaticServices, ngDialog) {

        $scope.task_automatic         = {};
        $scope.sendingData  = false;
        var idTask_automatic          = $stateParams.id;

    }]);

}(angular));