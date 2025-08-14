(function (ng) {

    "use strict";

    var Module = ng.module('LexTracking');

    Module.directive('statusSelect', function () {

        var directive = {
            restrict: 'E',
            scope: {
                model: '=',
            },
            templateUrl: '/app/shared/directives/statusSelect.view.html',
            link: function (scope, elem) {

                scope.active = false;

                elem.attr("tabindex", "0");

                elem.on('focus', function () {
                    elem.addClass('focus');
                });

                elem.on('blur', function () {
                    elem.removeClass('focus');
                });

                scope.setValue = function (val) {
                    console.log(val);
                    scope.model = val;
                };

                scope.setActive = function () {
                    scope.active = !scope.active;
                }
            }
        };

        return directive;

    });

}(angular));