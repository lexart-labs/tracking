(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('SaleCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'SaleServices','UserServices' ,'ClientServices', 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, SaleServices,UserServices, ClientServices,ngDialog) {

    $scope.users  = [];
    $scope.clients  = [];

    $scope.user  ={};
    $scope.select={};
    $scope.statuses= [];
    $scope.concepts=[];
    $scope.types=[];


    $scope.sale={};

    $scope.query    = "";
    $scope.currentPage  = 0;




    SaleServices.allTypes(function (err,types) {
      if (!err) {
        $scope.types=types;
      }

    });


    SaleServices.allConcepts(function (err,concepts) {
      console.log("concepts  ",concepts);
      if (!err) {
        $scope.concepts=concepts;
      }

    });




    var idFinance          = $stateParams.id;

    if (idFinance) {
      console.log(idFinance);
      SaleServices.findById(idFinance, function(err, response) {
        if (!err) {
          var sale= angular.copy(response);
          if (sale.date && sale.date!="") {
            sale.date=new Date(sale.date);
          }
          if (sale.amount && sale.amount!="") {
            sale.amount=parseFloat(sale.amount);
          }
          if (sale.idUser && sale.idUser!="") {
            UserServices.findById(sale.idUser, function(err, user) {
              if (!err) {
                $scope.select.user = user;
              }
            });
          }
          if (sale.idClient && sale.idClient!="") {
            ClientServices.findById(sale.idClient, function(err, client) {
              if (!err) {
                $scope.select.client = client;
              }
            });
          }
          if ( sale.type && sale.type!="") {
            $scope.types.forEach(function (type) {
              if (type.type==sale.type) {
                $scope.select.type=type;
                return false;


              }

            })

          }

          if ( sale.concept && sale.concept!="") {
            $scope.concepts.forEach(function (concept) {

              if (concept.concept==sale.concept) {
                $scope.select.concept=concept;
                return false;


              }

            })

          }
          $scope.sale = angular.copy(sale);
          console.log("venta",sale);
        }
      });
    }



    UserServices.find($scope.currentPage, $scope.query, function(err, users, countItems) {
      if (!err) {
        $scope.users  = users;
        $scope.total    = countItems;
      }
    });

    ClientServices.find($scope.currentPage, $scope.query, function(err, clients, countItems) {
      if (!err) {
        $scope.clients  = clients;
        $scope.total    = countItems;
      }
    });


    $scope.save = function () {
      var sale=angular.copy($scope.sale);
      if ($scope.select.user) {
        sale.idUser=$scope.select.user.id;
        sale.seller=$scope.select.user.name;
      }
      if ($scope.select.type) {
        sale.type=$scope.select.type.type;
      }
      if ($scope.select.concept) {
        sale.concept=$scope.select.concept.concept;
      }
      if ($scope.select.client) {
        sale.idClient=$scope.select.client.id;
        sale.client=$scope.select.client.name
      }
      if (sale.status == "PGO") {
        // Le salvo en el campo 'patType' la fecha de pagamiento
        sale.payType=new Date().toISOString().slice(0, 19).replace('T', ' ');
      }
      sale.active=1;

      sale.date=changeFormatDate($scope.sale.date);

      SaleServices.save(sale,function (err,result) {
        if (!err) {
          $state.go('app.sales');
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
