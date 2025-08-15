(function(ng, _) {

    'use strict';

    var Module = ng.module('LexTracking');


    Module.directive('lexartProjectChart', function() {
        var directive;

        directive = {
            restrict: 'E',
            scope: {
                items: '='
            },
            templateUrl: '/app/shared/directives/projectChart.view.html',
            link: function(scope, element, attrs) {}
        };

        return directive;
    });

    Module.directive("mwConfirmClick", [
        function() {
            return {
                priority: -1,
                restrict: 'A',
                scope: { confirmFunction: "&mwConfirmClick" },
                link: function(scope, element, attrs) {
                    element.bind('click', function(e) {
                        // message defaults to "Are you sure?"
                        var message = attrs.mwConfirmClickMessage ? attrs.mwConfirmClickMessage : "Are you sure?";
                        // confirm() requires jQuery
                        if (confirm(message)) {
                            scope.confirmFunction();
                        }
                    });
                }
            }
        }
    ]);

}(angular, _));
