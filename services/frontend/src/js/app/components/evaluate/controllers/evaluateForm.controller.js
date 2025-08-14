(function(ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.controller('EvalFormCtrl', ['$scope', '$state', '$rootScope', 'UserServices', '$stateParams', 'TasksServices', 'EvaluateServices', 'ngDialog', function($scope, $state, $rootScope, UserServices, $stateParams, TasksServices, EvaluateServices, ngDialog) {

    var user        = $stateParams.id;
    $scope.userEval = {};
    $scope.userTask = {};
    $scope.evaluacion = {};

    UserServices.findById(user, function(err, result){
      $scope.userEval = result;
    })

    TasksServices.findByUserEval(user, function(err, result){
      console.log('Task user', err, result);
      $scope.userTask = result;
      $scope.selected = { value: $scope.userTask };
      console.log('Projects select::', $scope.userTask, $scope.selected);    
    });

    $scope.save = function(userEval){
      userEval.idAdmin = $rootScope.userId;
      if (userEval.fecha) {
        var month = Number(moment(userEval.fecha).month()) + 1;
        userEval.fecha = moment(userEval.fecha).year() + "/" + month + "/" + moment(userEval.fecha).date();
        console.log (userEval.fecha);
      }
      console.log('userEval',userEval);
      EvaluateServices.save(userEval, function(err, result){
        console.log("Evaluacion guardada", err, result);
      })
    }

    EvaluateServices.find(user, function(err, result){
      $scope.evaluacion = result;
      for(var i = 0; i < $scope.evaluacion.length; i++){
        if ($scope.evaluacion[i].mes < 10) {
          $scope.evaluacion[i].mes = "0" + $scope.evaluacion[i].mes;
        }
        if($scope.evaluacion[i].dia < 10) {
          $scope.evaluacion[i].dia = "0" + $scope.evaluacion[i].dia;
        }
      }
    })

    $scope.evalEdit = function (value){
      console.log('$scope.fecha1',value);
      $scope.eval = value;
      ngDialog.open({
        template: '/app/components/evaluate/views/evaluateEdit.modal.html',
        showClose: true,
        scope: $scope,
        disableAnimation: true,
        data: {
            confirm: function() {
              $scope.eval.dia = moment($scope.eval.fecha).date();
              if ($scope.eval.dia < 10) {
                $scope.eval.dia = "0"+$scope.eval.dia;
              }
              $scope.eval.mes = moment($scope.eval.fecha).month() + 1;
              if ($scope.eval.mes < 10) {
                $scope.eval.mes = "0"+$scope.eval.mes;
              }              
              $scope.eval.year = moment($scope.eval.fecha).year();             
              console.log('$scope.fecha1', $scope.eval);            
              EvaluateServices.save($scope.eval, function(err, result){
                console.log(err, result);
                ngDialog.close();
              })
            },
            cancel: function () {
                ngDialog.close();
                $scope.sendingData = false;
            }
        }
      });
  }

  }]);

}(angular));