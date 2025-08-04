(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('ProductCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'ProductServices', 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, ProductServices, ngDialog) {

    $scope.data ={};
    $scope.access=[];
    $scope.product={};
    $scope.selectStatus = ['ACTIVO','INACTIVO'];
    $scope.query    = "";
    $scope.currentPage  = 0;

    var idProduct          = $stateParams.id;

    if (idProduct) {
      ProductServices.findById(idProduct, function(err, response) {
        if (!err) {
          var product= angular.copy(response);
          console.log(product);
          $scope.access=angular.copy(product.accessData);

          $scope.product = angular.copy(product);
        }
      });
    }




    $scope.agregarAcceso =function () {
      $scope.access.push($scope.data);
      $scope.data ={};

    }


    $scope.deleteModal = function(){
      ngDialog.open({
          template: '/app/components/Apps/catalogs/products/views/delete.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
              confirm: function() {   
                  var product=angular.copy($scope.product);
                    if(!product.amountEmails){
                      product.amountEmails = 0;
                    }
                    if(!product.amountDataBase){
                      product.amountDataBase   = 0;
                    }
                    if(!product.expiration){
                      product.expiration = "2019-01-10 03:00:00";
                    }
                    if (product.type=="Administracion productos externos") {
                      product.accessData  =angular.copy($scope.access);

                    }
                    product.borrado=1;
                    ProductServices.save(product,function (err,result) {
                      if (!err) {
                        $state.go('app.products');
                      }
                    })
              },
              cancel: function() {
                  ngDialog.close();
              }
          }
      });
    }


    $scope.save = function () {
      var product=angular.copy($scope.product);

      if(!product.amountEmails){
        product.amountEmails = 0;
      }
      if(!product.amountDataBase){
        product.amountDataBase   = 0;
      }
      if(!product.expiration){
        product.expiration = "2019-01-10 03:00:00";
      }


      if (product.type=="Administracion productos externos") {
        product.accessData  =angular.copy($scope.access);

      }
      product.borrado=0;
      ProductServices.save(product,function (err,result) {
        if (!err) {
          $state.go('app.products');
        }
      })
    };

    function changeFormatDate(date) {
      if (date != null && typeof date =="object") {
        date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' +
        ('00' + date.getUTCHours()).slice(-2) + ':' +
        ('00' + date.getUTCMinutes()).slice(-2) + ':' +
        ('00' + date.getUTCSeconds()).slice(-2);
        return date;
      }

    }

  }]);

}(angular));
