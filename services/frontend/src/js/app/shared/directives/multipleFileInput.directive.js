(function (ng, _) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.directive('fileInput', function () {
        var directive;

        directive = {
            restrict: 'E',
            scope: {
                multiple: '@',
                for: '@',
                title: '@',
                fileread: '=',
                filesprovided: '='
            },
            templateUrl: '/app/shared/directives/multipleFileInput.view.html',
            link: function (scope, element, attrs) {

                var input = element.find('input');

                scope.removeFile = function (index) {

                    console.log("Llama a la directiva remove!");

                    scope.files.splice(index, 1);
                    scope.fileread = scope.files;

                };

                scope.downloadFile = function (file) {

                    console.log("Llama a la directiva!");
                    scope.$root.download(file);

                };

                input.on('change', function (e) {

                    if (!scope.files) {
                        scope.files = [];
                    }

                    if (scope.multiple) {
                        _.each(e.target.files, function (item) {
                            scope.files.push(item);
                        });
                    } else {
                        _.each(e.target.files, function (item) {
                            scope.files[0] = item;
                        });
                    }

                    scope.$apply();
                });

                scope.$watch("filesprovided", function () {

                    console.log("DIRECTIVE scope.filesprovided ", scope.filesprovided)
                    if(scope.filesprovided) {

                        scope.files = [];

                        if(_.isArray(scope.filesprovided)) {
                            _.each(scope.filesprovided, function (item) {
                                scope.files.push(item);
                            });
                        } else {
                            scope.files.push(scope.filesprovided);
                        }
                    }
                });

                if (scope.multiple) {
                    element.find('input').attr('multiple', 'multiple');
                } else {
                    scope.multiple = false;
                }

                input.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.fileread = scope.files;
                    });
                });

            }
        };

        return directive;
    });

}(angular, _));