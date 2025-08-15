(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('FinanceCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'FinanceServices','UserServices' , 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, FinanceServices,UserServices, ngDialog) {

    $scope.users  = [];
    $scope.user  ={};
    $scope.select={};
    $scope.statuses= [];
    $scope.concepts=[];
    $scope.types=[];


    $scope.finance={};

    $scope.query    = "";
    $scope.currentPage  = 0;




    FinanceServices.allTypes(function (err,types) {
      if (!err) {
        $scope.types=types;
        console.log(types);
      }

    });
    FinanceServices.allConcepts(function (err,concepts) {
      console.log("concepts  ",concepts);
      if (!err) {
        $scope.concepts=concepts;
        console.log("concepts",$scope.concepts);
      }

    });


    var idFinance          = $stateParams.id;

    if (idFinance) {
      console.log(idFinance);
      FinanceServices.findById(idFinance, function(err, response) {
        if (!err) {
          var finance= angular.copy(response);
          if (finance.date && finance.date!="") {
            finance.date=new Date(finance.date);
          }
          if (finance.amount && finance.amount!="") {
            finance.amount=parseFloat(finance.amount);
          }
          if (finance.idUser && finance.idUser!="") {
            UserServices.findById(finance.idUser, function(err, user) {
                if (!err) {
                    $scope.select.user = user;
                }
            });
          }
          if ( finance.type && finance.type!="") {
            $scope.types.forEach(function (type) {
              if (type.type==finance.type) {
                $scope.select.type=type;

              }

            })

          }
          $scope.finance = angular.copy(finance);
          console.log("finanza",finance);
        }
      });
    }



    UserServices.find($scope.currentPage, $scope.query, function(err, users, countItems) {
      if (!err) {
        $scope.users  = users;
        $scope.total    = countItems;
        $scope.select.user=$scope.users[2];
      }
    });

    FinanceServices.allStatus(function (err,status) {
      console.log("status  ",status);
      if (!err) {
        $scope.statuses=status;
        console.log($scope.statuses);
      }

    });







    $scope.save = function () {
      var finance=angular.copy($scope.finance);
      console.log("select",$scope.select);
      if ($scope.select.user) {
        finance.idUser=$scope.select.user.id;
      }
      if ($scope.select.type) {
        finance.type=$scope.select.type.type;
      }
      finance.active=1;

      finance.date=changeFormatDate($scope.finance.date);
      finance.concept = finance.concept.concept;
      console.log("finance to save ", finance);
      FinanceServices.save(finance,function (err,result) {
        if (!err) {
          console.log(result);
          $state.go('app.finances');

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
