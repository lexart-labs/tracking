(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('HostingCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'HostingServices', 'ProductServices', 'ngDialog', function($scope,$state,$stateParams, $rootScope, $filter, $timeout, HostingServices, ProductServices, ngDialog) {

    $scope.clients  = [];
    $scope.client  ={};
    $scope.users  = [];
    $scope.user  ={};
    $scope.select={};
    $scope.accountStatus = [{"name":"ACTIVO"},{"name":"INACTIVO"},{"name":"SUSPENDIDO"}];
    $scope.productState = [{"name":"ACTIVO"},{"name":"INACTIVO"},{"name":"SUSPENDIDO"}];
    $scope.clientType = [{"name":"Cliente fijo"},{"name":"Empresa"}];
    $scope.contractType = [{"name":"ANUAL"},{"name":"MENSUAL"}];
    $scope.contactType = [{"name":"FINANZAS"},{"name":"ADMINISTRATIVO"},{"name":"TÉCNICO"}];
    $scope.productsType = [];
    $scope.products = [];
    $scope.modelProduct = {};
    $scope.allProducts = [];
    $scope.productDescription = '';
    $scope.hosting={};
    $scope.hosting.contact = [];
    $scope.hosting.products = [];
    $scope.tableProducts = [];
    $scope.contact = {};
    $scope.error = '';
    $scope.timeRemaining = '';
    $scope.query    = "";
    $scope.currentPage  = 0;
    var aux_price = 0;

    $scope.modelProduct.state = {'name':'ACTIVO'}
    var idHosting  = $stateParams.id;

    ProductServices.find($scope.currentPage, $scope.query, function(err, product, countItems) {
        if (!err) {
            $scope.allProducts  = product;
            $scope.total    = countItems;
            angular.forEach(product,function(element,index){
              var exist = false;
              angular.forEach($scope.productsType,function(e,index){
                if(element.type == e.name){
                  exist = true;
                }
              });
              if(exist == false){
                $scope.productsType.push({'name':element.type});
              }
            });
        }
    });

    if (idHosting) {
      HostingServices.findById(idHosting, function(err, response) {
        if (!err) {
          var hosting= angular.copy(response);
          console.log(hosting);
          hosting.accountStatus = {"name":hosting.accountStatus};
          // hosting.contractType = {"name":hosting.contractType};
          // hosting.hireDate = moment(hosting.hireDate,"YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY");
          // if(hosting.contractType == 'ANUAL'){
          //   hosting.nextExpiration = moment(hosting.hireDate,'DD/MM/YYYY').add('years', 1).format('DD/MM/YYYY');
          //   var now = moment().format('DD/MM/YYYY');
          //   var then = $scope.hosting.nextExpiration;
          //   $scope.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
          // }else if(hosting.contractType == 'MENSUAL'){
          //   hosting.nextExpiration = moment(hosting.hireDate,'DD/MM/YYYY').add('month',1).format('DD/MM/YYYY');
          //   var now = moment().format('DD/MM/YYYY');
          //   var then = $scope.hosting.nextExpiration;
          //   $scope.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
          // }
          if(hosting.company == "1"){
            $scope.client = {"name":"Empresa"};
            hosting.finalClient =0;
            hosting.company = 1;
          }else if(hosting.company === "0"){
            console.log('test');
            $scope.client = {"name":"Cliente fijo"};
            hosting.finalClient = 1;
            hosting.company = 0;
          }
          $scope.hosting = angular.copy(hosting);
        }
      });
    }else{
      $scope.hosting.startDate = moment().format("YYYY-MM-DD");
    }

    $scope.clientSelect = function(select){
      if(select.name == 'Empresa'){
        $scope.hosting.company = 1;
        $scope.hosting.finalClient = 0;
      }else if(select.name == "Cliente fijo"){
        $scope.hosting.company = 0;
        $scope.hosting.finalClient = 1;
      }
    }
    $scope.changeSelect = function(){
      if(!$scope.edit_product){
        if($scope.modelProduct.contractType.name == 'ANUAL'){
          $scope.modelProduct.nextExpiration = moment($scope.modelProduct.hireDate,'DD/MM/YYYY').add(1, 'years').format('DD/MM/YYYY');
          console.log($scope.modelProduct);
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.modelProduct.nextExpiration;
          $scope.modelProduct.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }else if($scope.modelProduct.contractType.name == 'MENSUAL'){
          $scope.modelProduct.nextExpiration = moment($scope.modelProduct.hireDate,'DD/MM/YYYY').add(1, 'month').format('DD/MM/YYYY');
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.modelProduct.nextExpiration;
          $scope.modelProduct.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }
      $scope.error = '';
      }else{
        if($scope.edit_product.contractType.name == 'ANUAL'){
          $scope.edit_product.nextExpiration = moment($scope.edit_product.hireDate,'DD/MM/YYYY').add(1, 'years').format('DD/MM/YYYY');
          console.log($scope.edit_product);
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.edit_product.nextExpiration;
          $scope.edit_product.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }else if($scope.edit_product.contractType.name == 'MENSUAL'){
          $scope.edit_product.nextExpiration = moment($scope.edit_product.hireDate,'DD/MM/YYYY').add(1, 'month').format('DD/MM/YYYY');
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.edit_product.nextExpiration;
          $scope.edit_product.timeRemaining = moment(then, 'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }
      }
    }
    $scope.contractSelect = function(select){
      if($scope.modelProduct.contractType.name == 'ANUAL'){
          $scope.modelProduct.price = aux_price * 12;
        }else if($scope.modelProduct.contractType.name == 'MENSUAL'){
           $scope.modelProduct.price = aux_price;
        }
      if($scope.edit_product){
        if($scope.edit_product.contractType){
          if($scope.edit_product.contractType.name == 'ANUAL'){
              $scope.edit_product.price = aux_price * 12;
          }else if($scope.edit_product.contractType.name == 'MENSUAL'){
           $scope.edit_product.price = aux_price;
          }
        }
        }
        
      if($scope.modelProduct.hireDate){
        if($scope.modelProduct.contractType.name == 'ANUAL'){
          $scope.modelProduct.nextExpiration = moment($scope.modelProduct.hireDate,'DD/MM/YYYY').add('years', 1).format('DD/MM/YYYY');
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.modelProduct.nextExpiration;
          $scope.modelProduct.timeRemaining = moment(then,'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }else if($scope.modelProduct.contractType.name == 'MENSUAL'){
          $scope.modelProduct.nextExpiration = moment($scope.modelProduct.hireDate,'DD/MM/YYYY').add('month',1).format('DD/MM/YYYY');
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.modelProduct.nextExpiration;
          $scope.modelProduct.timeRemaining = moment(then,'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }
      }
      if($scope.edit_product && $scope.edit_product.hireDate){
        if($scope.edit_product.contractType.name == 'ANUAL'){
          $scope.edit_product.nextExpiration = moment($scope.edit_product.hireDate,'DD/MM/YYYY').add('years', 1).format('DD/MM/YYYY');
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.edit_product.nextExpiration;
          $scope.edit_product.timeRemaining = moment(then,'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }else if($scope.edit_product.contractType.name == 'MENSUAL'){
          $scope.edit_product.nextExpiration = moment($scope.edit_product.hireDate,'DD/MM/YYYY').add('month',1).format('DD/MM/YYYY');
          var now = moment().format('DD/MM/YYYY');
          var then = $scope.edit_product.nextExpiration;
          $scope.edit_product.timeRemaining = moment(then,'DD/MM/YYYY').diff(moment(now,'DD/MM/YYYY'),'days')+1;
        }
      }
      $scope.error = '';
    }
    $scope.typeProductSelect = function(select){
      console.log('productSelect',select);
      $scope.tableProducts = [];
      $scope.products = [];
      $scope.productDescription = '';
      angular.forEach($scope.allProducts,function(element,index){
        if(select.name == element.type){
          $scope.products.push(element);
        }
      });
    }
    $scope.ProductDescription = function(select){
      console.log(select);
      $scope.productDescription = '';
      if(select.name){
        $scope.productDescription += ' Nombre: '+select.name+'\n';
      }
      if(select.status){
        $scope.productDescription += ' Estado: '+select.status+'\n';
      }
      if(select.accessData){
        $scope.productDescription += ' Datos de acceso: '+select.accessData+'\n';
      }
      if(select.amountDataBase){
        $scope.productDescription += ' Cantidad de bases de datos: '+select.amountDataBase+'\n';
      }
      if(select.amountEmails){
        $scope.productDescription += ' Cantidad de correos: '+select.amountEmails+'\n';
      }
      if(select.cpu){
        $scope.productDescription += ' CPU: '+select.cpu+'\n';
      }
      if(select.databaseAccess){
        $scope.productDescription += ' Acceso a base de dato: '+select.databaseAccess+'\n';
      }
      if(select.diskSpace){
        $scope.productDescription += ' Espacio de disco: '+select.diskSpace+'\n';
      }
      if(select.domain){
        $scope.productDescription += ' Dominio: '+select.domain+'\n';
      }
      if(select.expiration){
        $scope.productDescription += ' Vencimiento: '+select.expiration+'\n';
      }
      if(select.hdd){
        $scope.productDescription += ' HDD: '+select.hdd+'\n';
      }
      if(select.ip){
        $scope.productDescription += ' IP: '+select.ip+'\n';
      }
      if(select.link){
        $scope.productDescription += ' LINK: '+select.link+'\n';
      }
      if(select.memory){
        $scope.productDescription += ' Memoria: '+select.memory+'\n';
      }
      if(select.placeAccommodation){
        $scope.productDescription += ' Lugar acomodado:'+select.placeAccommodation+'\n';
      }
      if(select.provider){
        $scope.productDescription += ' Proveedor: '+select.provider+'\n';
      }
      if(select.transfer){
        $scope.productDescription += ' Transeferncia: '+select.transfer+'\n';
      }
      if(select.type){ 
        $scope.productDescription += ' Tipo: '+select.type;
      }
      aux_price = parseFloat(select.price);
      $scope.modelProduct.price = parseFloat(select.price);
    }
    $scope.addProduct = function(){
      if(!$scope.modelProduct.type){
        $scope.error = 'Seleccione el tipo de producto';
        return;
      }
      if(!$scope.modelProduct.description){
        $scope.error = 'Seleccione un producto';
        return;
      }
      if(!$scope.modelProduct.contractType){
          $scope.error = 'Seleccione el tipo de contrato';
          return;
      }
      if(!$scope.modelProduct.price){
        $scope.error = 'Ingrese un monto';
        return;
      }
      if(!$scope.modelProduct.hireDate){
          $scope.error = 'Seleccione fecha de contratación';
          return;
      }
      $scope.error = '';
      $scope.hosting.products.push($scope.modelProduct);
      var price = 0;
      angular.forEach($scope.hosting.products,function(element,index){
        price += element.price;
      });
      $scope.hosting.serviceCost = price;
      $scope.modelProduct = {};
      $scope.modelProduct.state = {"name":"ACTIVO"};
      $scope.productDescription = '';
    }
    $scope.discountPrice = function(){
      var price = 0;
      angular.forEach($scope.hosting.products,function(element,index){
        price += element.price;
      });
      $scope.hosting.serviceCost = price;
    }
    $scope.addContact = function(){
      if(!$scope.contact.name){
        $scope.error = 'Ingrese nombre del contacto';
        return;
      }  
      if(!$scope.contact.email){
        $scope.error = 'Ingrese email del contacto';
        return;
      }
      if(!$scope.contact.phone){
        $scope.error = 'Ingrese numero del contacto';
        return;
      }    
      $scope.hosting.contact.push($scope.contact);
      $scope.contact = {};
      $scope.error = '';
    }

    $scope.save = function () {

      //FIRST TAB
      if(!$scope.hosting.fullName){
        $scope.error = 'Ingrese nombre completo';
        return;
      }
      if(!$scope.hosting.accountStatus){
        $scope.error = 'Ingrese estado de la cuenta';
        return;
      }
      //SECOND TAB
      if($scope.hosting.company === undefined){
        $scope.error = 'Seleccionar tipo de facturacion.';
        return;
      }
      if($scope.hosting.company === 1){
        if(!$scope.hosting.businessName){
          $scope.error = 'Seleccionar nombre de empresa.';
          return;
        }
        if($scope.hosting.contact.length == 0){
          $scope.error = 'Agregue uno o mas contactos.';
          return;
        }
      }else if($scope.hosting.company === 0){
        if(!$scope.hosting.document){
          $scope.error = 'Ingrese documento.';
          return;
        }
        if(!$scope.hosting.phone){
          $scope.error = 'Ingrese numero de contacto.';
          return;
        }
        if(!$scope.hosting.email){
          $scope.error = 'Ingrese email de contacto.';
          return;
        }
      }
      if(!$scope.hosting.serviceDescription){
        $scope.error = 'Ingrese descripción del servicio.';
        return;
      }
      if(!$scope.hosting.billingAddress){
        $scope.error = 'Ingrese dirección de facturación.';
        return;
      }
      //THIRD TAB
      if($scope.hosting.products.length < 1){
        $scope.error = 'Ingrese uno o mas productos.';
        return;
      }

      $scope.hosting.accountStatus = $scope.hosting.accountStatus.name;
      $scope.hosting.borrado=0;
      console.log('save',$scope.hosting); 
      HostingServices.save($scope.hosting,function (err,result) {
        if (!err) {
          $state.go('app.hosting');
        }
      })
    };

    $scope.openModal = function(product, index){
      $scope.edit_product = product;
      ngDialog.open({
          template: '/app/components/Apps/catalogs/hosting/views/product.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
              confirm: function() {   
                  $scope.hosting.serviceCost = 0;
                  angular.forEach($scope.hosting.products,function(element,index){
                    $scope.hosting.serviceCost += parseFloat(element.price);
                  });
              },
              cancel: function() {
                  ngDialog.close();
                  $scope.edit_product = undefined;
              }
          }
      });
    }

    $scope.deleteModal = function(){
      ngDialog.open({
          template: '/app/components/Apps/catalogs/hosting/views/delete.modal.html',
          showClose: true,
          scope: $scope,
          disableAnimation: true,
          data: {
              confirm: function() {   

                  HostingServices.remove({"id":idHosting}, function(err, result){
                      if (!err) {
                          $state.go('app.hosting');
                      } else {
                          $scope.error = err;
                      }
                  });
              },
              cancel: function() {
                  ngDialog.close();
              }
          }
      });
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
