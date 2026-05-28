(function(ng) {
    'use strict';
    var Module = ng.module('LexTracking');
    Module.controller('TasksReactCtrl', ['$scope', '$rootScope', '$sce', function($scope, $rootScope, $sce) {
        var reactUrl = $rootScope.trackingReactUrl || TRACKING_REACT_URL;
        $scope.env_react_url = $sce.trustAsResourceUrl(reactUrl + '/#/tasks');
    }]);
}(angular));
