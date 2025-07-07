(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('EasyWebCtrl', ['$scope','$state','$stateParams', '$rootScope', '$filter', '$timeout', 'EasywebsServices', 'ngDialog', '$window', "$http", function($scope,$state,$stateParams, $rootScope, $filter, $timeout, EasywebsServices, ngDialog, $window, $http) {

  	$scope.web = {};

  	$scope.menuTable = [];
    $scope.menu = [];
  	$scope.section = [];
  	$scope.sectionTable = [];
  	$scope.sliderTable = [];
  	$scope.slider = [];
    $scope.contact = [];
    $scope.contactEmail = {};
    $scope.contactTable = [];
    $scope.footer = [];
    $scope.footerTable = [];
    $scope.web.idUser = $window.localStorage["userId"];
    var API_POOL  = "https://pool.lexartlabs.uy/alltypes.php";
    $scope.imagen = [];
    $scope.imagenBase64_slider = undefined;
    $scope.img_slider = {};
    $scope.img_section = {};
    $scope.img_footer = {};
    $scope.img_slider_show = false;
    $scope.img_section_show = false;
    $scope.img_footer_show = false;
    $scope.slider_img_loading = false;
    $scope.section_img_loading = false;
    $scope.footer_img_loading = false;
    $scope.isEdit  = false;

  	$scope.addMenu = function(menu){
  		var link = "";
      var attr = "";
      if(!menu.name){
        return;
      }
      if(menu.link){
        link = menu.link;
      }
      if(menu.attr){
        attr = menu.attr;
      }
      var newMenu = {"name":menu.name,"link":link,"attr":attr}
      $scope.menuTable.push(newMenu);
      this.menu = [];
  	}

  	$scope.addSection = function(section){
      var img = "";
      var html = "";
      if(!section.name){
        return;
      }
      if($scope.img_section){
        img = $scope.img_section;
      }
      if(section.html){
        html = section.html;
      }
  		var newSection = {"name":section.name,"img":img,"html":html}
  		$scope.sectionTable.push(newSection);
  		this.section = [];
  	}

  	$scope.addSlider = function(slider){
  		var img = "";
      var html = "";
      if(!slider.name){
        return;
      }
      if($scope.img_slider){
        img = $scope.img_slider;
      }
      if(slider.html){
        html = slider.html;
      }
      var newSlider = {"name":slider.name,"img":img,"html":html}
      $scope.sliderTable.push(newSlider);
      this.slider = [];
  	}

    $scope.addFooter = function(footer){
      var img = "";
      var html = "";

      if($scope.footerTable == null){
        $scope.footerTable = [];
      }
      if(!footer.name){
        return;
      }
      if($scope.img_footer){
        img = $scope.img_footer;
      }
      if(footer.html){
        html = footer.html;
      }
      var newFooter = {"name":footer.name,"img":img,"html":html};
      $scope.footerTable.push(newFooter);
      this.footer = [];
    }

    $scope.agregarImgSlider= function (imagen) {
          if (imagen) {
            $scope.slider_img_loading = true;
            $scope.img_slider = {};
            var aux=imagen.filename.split(".");
            $scope.img_slider.img_type=aux[aux.length-1];
            $scope.img_slider.img_encoded = "data:"+imagen.filetype+";base64,"+imagen.base64;
            $http.post(API_POOL, $scope.img_slider).then( function (res){
              $scope.img_slider = res.data.url;
              $scope.img_slider_show = true;
              $scope.slider_img_loading = false;
              console.log(res.data.url);
            });

        };
    }

    $scope.agregarImgSection= function (imagen) {
          if (imagen) {
            $scope.section_img_loading = true;
            $scope.img_section = {};
            var aux=imagen.filename.split(".");
            $scope.img_section.img_type=aux[aux.length-1];
            $scope.img_section.img_encoded = "data:"+imagen.filetype+";base64,"+imagen.base64;
            $http.post(API_POOL, $scope.img_section).then( function (res){
              $scope.img_section = res.data.url;
              $scope.img_section_show = true;
              $scope.section_img_loading = false;
              console.log(res.data.url);
            });

        };
    }

    $scope.agregarImgFooter= function (imagen) {
          if (imagen) {
            $scope.footer_img_loading = true;
            $scope.img_footer = {};
            var aux=imagen.filename.split(".");
            $scope.img_footer.img_type=aux[aux.length-1];
            $scope.img_footer.img_encoded = "data:"+imagen.filetype+";base64,"+imagen.base64;
            $http.post(API_POOL, $scope.img_footer).then( function (res){
              $scope.img_footer = res.data.url;
              $scope.img_footer_show = true;
              $scope.footer_img_loading = false;
              console.log(res.data.url);
            });
        };
    }

    var newContactEmail = {"formFields": []};
    $scope.contactEmail = newContactEmail;

    $scope.addContact = function(contact){
      $scope.contactEmail = {};
      var email_to = "";
      var email_from = "";
      var email_bbc = "";
      if(contact.email_to){
        email_to = contact.email_to;
      }
      if(contact.email_from){
        email_from = contact.email_from;
      }
      if(contact.email_bbc){
        email_bbc = contact.email_bbc;
      }

      var name = "";
      var type = "";
      var validation = "";
      var id = contact.name.toLowerCase().split(" ").join("_") + "_form";
      if(contact.validation == "SI"){
        validation = true;
      }else{
        validation = false;
      }
      if(contact.name){
        name = contact.name;
      }
      if(contact.type){
        type = contact.type;
      }
      console.log(validation);
      var newContact = {"name":name,"type":type,"validate":validation, "id":id};
      $scope.contactTable.push(newContact);
      this.contact = [];
    }

  	$scope.save = function () {
        $scope.error = '';
        $scope.contactEmail.formFields = $scope.contactTable;
        $scope.web.jsonForm     = $scope.contactEmail;
        $scope.web.jsonMenu     = $scope.menuTable;
        $scope.web.jsonSections = $scope.sectionTable;
        $scope.web.jsonSliders  = $scope.sliderTable;
        $scope.web.jsonFooter   = $scope.footerTable;
        console.log('web to save', JSON.stringify($scope.web) );

        EasywebsServices.save($scope.web, function (err, result) {
            if (err) {
                console.log("error", err);
                $scope.error = err.message || err.error.message || err.error || err;
                $sendingData = false;
            } else {
                $state.go('app.easyWebs');
            }
        });
    }

    if($stateParams.id){
      EasywebsServices.findById($stateParams.id, function(err, easywebs) {
          if (!err) {
              console.log("easyweb: ", easywebs)
              $scope.isEdit           = true;
              $scope.web              = easywebs;

              $scope.contactTable     = $scope.web.jsonForm.formFields;
              $scope.contactEmail     = $scope.web.jsonForm;
              $scope.menuTable        = $scope.web.jsonMenu;
              $scope.sectionTable     = $scope.web.jsonSections;
              $scope.sliderTable      = $scope.web.jsonSliders;
              $scope.footerTable      = $scope.web.jsonFooter;
          }
      });
    }

  }]);

}(angular));
