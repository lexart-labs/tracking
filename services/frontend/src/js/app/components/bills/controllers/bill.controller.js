(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('BillCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'BillServices', 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, BillServices, ngDialog) {


    $scope.bill={};

    $scope.query    = "";
    $scope.currentPage  = 0;

    var idBill          = $stateParams.id;

    if (idBill) {
      BillServices.findById(idBill, function(err, response) {
        if (!err) {
          var bill= angular.copy(response);
          console.log(bill);
          if (bill.price &&  bill.price!="") {
            bill.price=parseFloat(bill.price);
          }
          if (bill.date && bill.date!="") {
            bill.date=new Date(bill.date);
          }
          $scope.bill = angular.copy(bill);
        }
      });
    }








    $scope.save = function () {
      var bill=angular.copy($scope.bill);
      bill.borrado=0;
      bill.date=changeFormatDate(bill.date);

      bill.expirationTime=changeFormatDate(bill.date);
      BillServices.save(bill,function (err,result) {
        if (!err) {
          $state.go('app.bills');

        }
      })
    };

    $scope.print =function (printpage) {

      // $("#"+printpage).find('div').each(function(){
      //   if( $(this).css("background-image") !=  "none"){
      //     $(this).css("overflow" ,"hidden").css("position", "relative");
      //     $(this).prepend('<img style="display: block;position: absolute;" src="'+$(this).css("background-image").replace(/"/g,"").replace(/url\(|\)$/ig, "")+'" width="110%" >');
      //
      //     $(this).css("background",'..');
      //
      //   }
      // });
      var printContents = document.getElementById(printpage).innerHTML;
      var popupWin = window.open();
      popupWin.document.open();
      var  styles='<style>#bill-form{height:auto!important;width:110%!important ;margin:0!important;display: block; width:100%!important}.box{display:block;  height: 1000px;margin-left: 9%; margin-right: 5%;padding-top: 5%!important}.bill-input{border:0!important; height:35px;margin-left:2%}.billNumber{padding-left:21.5%!important;padding-top:4%!important}.rut-print{padding-top:1%!important;}.rut-print{padding-top:1%!important;}.date-print{padding-top:3.5%!important;padding-left:20%!important;}.text-print{padding-top:2%!important;}.price-print{padding-left:26%!important;padding-top:6.5%!important;height:25px!important}.factura{position:absolute!important;}.parte-izquierda{padding-left:26%!important}.first{padding-top:19%!important}.second{padding-top:1%!important}.third{padding-top:2.2%!important}.third input{height:20px!important}.date-text-print{display:block!important; }.date-bill{display:none!important;}.rut-input{width:50%!important;}</style>';
      // var styles='<style>#bill-form{height:auto!important;width:110%!important ;margin:0!important;display: block; width:100%!important}.box{display:block;min-height: 600px;margin-left: 4.5%;padding-top: 4.5%;margin-right: 4.5%;}.parte-baja{margin-left: 80.2%;margin-top: 9%;}.bill-input{border:0;}</style>'

      var html ='<html><head>'+styles+'</head><body  onload="window.print()">' + printContents + '</body></html>';

      popupWin.focus(); //required for IE
      popupWin.document.write(html);

      popupWin.document.close();

    }


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
