(function (ng) {

    "use strict";

    var Module = ng.module('LexTracking');

    Module.directive('status', function () {

        var directive = {
            restrict: 'E',
            scope: {
                value: '=',
                showLabels: '=',
                showIcon: '='
            },
            templateUrl: '/app/shared/directives/status.view.html'
        };

        return directive;

    });

}(angular));

(function(ng, _) {

    'use strict';

    var Module = ng.module('LexTracking');

    console.log('budgetStatus');
    
    Module.directive('budgetStatus', [function() {
        return {
            restrict: 'E',
            scope: {
                pass: "=",
                some: "@",
                budget: "="
            },
            templateUrl: 'app/components/budget/components/versions/views/versionStatusView.html',
            controller: ["$scope", function($scope) {
                // Isolated $scope here
                console.log('budget directive', $scope);
            }]
        };
    }]);

}(angular, _));
