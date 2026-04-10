(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('TracksCtrl', ['$scope', '$rootScope', '$sce',
        function ($scope, $rootScope, $sce) {

            $scope.env_react_url = $sce.trustAsResourceUrl($rootScope.trackingReactUrl + '/#/tracks');

        }
    ]);

}(angular));
