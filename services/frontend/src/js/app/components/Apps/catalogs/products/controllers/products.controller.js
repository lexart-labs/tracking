(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('ProductsCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'ProductServices', 'ngDialog', function($scope,$interval, $rootScope, $filter, $timeout, ProductServices, ngDialog) {

    $scope.products  = [];
    $scope.query    = "";
    $scope.currentPage  = 0;


    ProductServices.find($scope.currentPage, $scope.query, function(err, product, countItems) {
        if (!err) {
            $scope.products  = product;
            $scope.total    = countItems;
        }
    });
  }]);

}(angular));
