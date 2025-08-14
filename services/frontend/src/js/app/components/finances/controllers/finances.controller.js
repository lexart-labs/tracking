(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('FinancesCtrl', ['$scope','$interval', '$rootScope', '$filter', '$timeout', 'FinanceServices', 'ngDialog', function($scope,$interval, $rootScope, $filter, $timeout, FinanceServices, ngDialog) {

    $scope.finances     = [];
    $scope.query        = "";
    $scope.currentPage  = 0;
    $scope.filter       = {};
    $scope.fill         = {};

    $scope.convToDate   = function (date){
      return new Date(date);
    }

    $scope.months   = [
      {
        id:0,
        month:"ENE",
        dateIni:"01-01",
        dateEnd:"01-31"
      },
      {
        id:1,
        month:"FEB",
        dateIni:"02-01",
        dateEnd:"02-28"
      },
      {
        id:2,
        month:"MAR",
        dateIni:"03-01",
        dateEnd:"03-31"
      },
      {
        id:3,
        month:"APR",
        dateIni:"04-01",
        dateEnd:"04-30"
      },
      {
        id:4,
        month:"MAY",
        dateIni:"05-01",
        dateEnd:"05-31"
      },
      {
        id:5,
        month:"JUN",
        dateIni:"06-01",
        dateEnd:"06-30"
      },
      {
        id:6,
        month:"JUL",
        dateIni:"07-01",
        dateEnd:"07-31"
      },
      {
        id:7,
        month:"AGO",
        dateIni:"08-01",
        dateEnd:"08-31"
      },
      {
        id:8,
        month:"SEP",
        dateIni:"09-01",
        dateEnd:"09-30"
      },
      {
        id:9,
        month:"OCT",
        dateIni:"10-01",
        dateEnd:"10-31"
      },
      {
        id:10,
        month:"NOV",
        dateIni:"11-01",
        dateEnd:"11-30"
      },
      {
        id:11,
        month:"DEC",
        dateIni:"12-01",
        dateEnd:"12-31"
      }
    ];


    $scope.years=[
      {id:0,

      }



    ]

    var date = new Date();
    $scope.years=[
      {id:0,
        year:date.getFullYear()

      },
      {id:1,
        year:date.getFullYear()-1

      },{id:2,
        year:date.getFullYear()-2

      },



    ];

    $scope.fill.month = $scope.months.find( function (month){
      if(month.id == date.getMonth()){
        return month;
      }
    });

    $scope.fill.year = $scope.years.find( function (year){
      if(year.year == date.getFullYear()){
        return year;
      }
    });
    $scope.query =$scope.fill.year.year+"-"+$scope.fill.month.dateIni+"/"+$scope.fill.year.year+"-"+$scope.fill.month.dateEnd;
    console.log($scope.query);

    $scope.changeMonth  = function (){
      $scope.query = $scope.fill.year.year+"-"+$scope.fill.month.dateIni+"/"+$scope.fill.year.year+"-"+$scope.fill.month.dateEnd;
      console.log("fill: ", $scope.fill);
      search();
    };

    $scope.changeYear  = function (){
      $scope.query = $scope.fill.year.year+"-"+$scope.fill.month.dateIni+"/"+$scope.fill.year.year+"-"+$scope.fill.month.dateEnd;
      console.log("fill: ", $scope.fill);
      search();
    };

    var search  = function (){
      console.log("query",$scope.query);
      FinanceServices.findByMonth($scope.currentPage, $scope.query, function(err, finances, countItems) {
        if (!err) {
          console.log('finances', finances, countItems);
          $scope.finances  = finances;
          $scope.total    = countItems;
        }
      });
    };
    search();

  }]);

}(angular));
