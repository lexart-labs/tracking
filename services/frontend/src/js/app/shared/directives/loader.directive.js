(function(ng, _) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.directive('lexartLoader', function() {
        var directive;

        directive = {
            restrict: 'E',
            scope: {
                visible: '='
            },
            templateUrl: '/app/shared/directives/loader.view.html',
            link: function(scope, element, attrs) {

            }
        };

        return directive;
    });

    Module.directive('dhxGantt', function() {
        return {
            restrict: 'A',
            scope: false,
            transclude: true,
            template: '<div ng-transclude></div>',

            link: function($scope, $element, $attrs, $controller) {
                //watch data collection, reload on changes
                $scope.$watch($attrs.data, function(collection) {
                    gantt.clearAll();
                    gantt.parse(collection, "json");
                }, true);

                //size of gantt
                $scope.$watch(function() {
                    return $element[0].offsetWidth + "." + $element[0].offsetHeight;
                }, function() {
                    gantt.setSizes();
                });

                gantt.templates.task_class = function(start, end, task) {
                    console.log(task);
                    if (task.styleclass) {
                        return task.styleclass;
                    }
                };


                if ($attrs.dxhStartDate && $attrs.dxhEndDate) {
                    console.log('Init with dates', new Date($attrs.dxhStartDate), new Date($attrs.dxhEndDate));
                    gantt.init($element[0], new Date($attrs.dxhStartDate), new Date($attrs.dxhEndDate));
                } else
                    gantt.init($element[0]);

            }
        };
    });


    function templateHelper($element) {
        var template = $element[0].innerHTML;
        return template.replace(/[\r\n]/g, "").replace(/"/g, "\\\"").replace(/\{\{task\.([^\}]+)\}\}/g, function(match, prop) {
            if (prop.indexOf("|") != -1) {
                var parts = prop.split("|");
                return "\"+gantt.aFilter('" + (parts[1]).trim() + "')(task." + (parts[0]).trim() + ")+\"";
            }
            return '"+task.' + prop + '+"';
        });
    }

    Module.directive('ganttColumnAdd', ['$filter', function($filter) {
        return {
            restrict: 'AE',
            terminal: true,
            link: function() {
                gantt.config.columns.push({ width: 45, name: "add" });
            }
        }
    }]);

}(angular, _));
