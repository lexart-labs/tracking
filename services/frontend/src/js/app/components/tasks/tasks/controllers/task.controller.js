(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('TaskCtrl', ['$scope', '$state', '$stateParams', '$filter', 'TaskServices', 'ngDialog', function($scope, $state, $stateParams, $filter, TaskServices, ngDialog) {

        $scope.task         = {};
        $scope.sendingData  = false;
        var idTask          = $stateParams.id;

    }]);

}(angular));