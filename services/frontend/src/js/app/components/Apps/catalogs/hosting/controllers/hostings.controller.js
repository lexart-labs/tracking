(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('HostingsCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'HostingServices', 'ngDialog', function($scope,$interval, $rootScope, $filter, $timeout, HostingServices, ngDialog) {

    $scope.hostings  = [];
    $scope.query    = "";
    $scope.currentPage  = 0;


    HostingServices.find($scope.currentPage, $scope.query, function(err, result, countItems) {
        if (!err) {
            $scope.hostings  = result;
            $scope.total    = countItems;
            console.log(result);
            angular.forEach(result,function(element, index){
              angular.forEach(element.products,function(e, i){
                e.hireDate = moment(e.hireDate,"DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY");
                if(e.contractType.name == 'ANUAL'){
                  e.nextExpiration = moment(e.hireDate,'DD/MM/YYYY').add('years', 1).format('DD/MM/YYYY');
                  var now = moment().format('DD/MM/YYYY');
                  var then = e.nextExpiration;
                  e.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
                }else if(e.contractType.name == 'MENSUAL'){
                  e.nextExpiration = moment(e.hireDate,'DD/MM/YYYY').add('month',1).format('DD/MM/YYYY');
                  var now = moment().format('DD/MM/YYYY');
                  var then = e.nextExpiration;
                  e.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
                }
              })
            });
        }
    });
  }]);

}(angular));
