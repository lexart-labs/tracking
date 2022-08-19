(function(ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.controller('UserCtrl', ['$scope', '$state', '$stateParams', '$filter', 'UserServices','ClientServices', 'ngDialog', 'EvaluateServices','TracksServices', 'WeeklyHourServices', '$rootScope', '$http', function($scope, $state, $stateParams, $filter, UserServices, ClientServices,ngDialog, EvaluateServices, TracksServices, WeeklyHourServices, $rootScope, $http) {

        $scope.user         = {};
        $scope.sendingData  = false;
        var idUser          = $stateParams.id;
        $scope.clients      = [];
        $scope.performance  = {};
        $scope.date         = {};
        $rootScope.jiraUser = {};
        $scope.vinculate    = false;
        $scope.tabUser      = 1;
        
        

        if(idUser) {
            if(window.localStorage.isDeveloper == "true") {
                UserServices.currentUser(function(err, result) {
                    $scope.user = result;
                });
                
                
            }  else {
                UserServices.findById(idUser, function (err, result) {
                    $scope.user = result;
                });
            }
        }

        ClientServices.find($scope.currentPage, $scope.query, function(err, clients, countItems) {
            if (!err) {
                console.log('clients', clients, countItems);
                $scope.clients = angular.copy(clients);
            }
        });

        $scope.save = function () {
            $scope.error = '';
            console.log('user to save', $scope.user);

            if (!$scope.user.name || !$scope.user.email || !$scope.user.role) {
                $rootScope.showToaster('Please fill all fields', 'error');
                return;
            }

            if($scope.user.password.length < 8){
                $rootScope.showToaster('The password must be at least 8 characters', 'error');
                return;
            }


            $scope.sendingData = true;
            console.log("RES: ", $scope.user);

            UserServices.save($scope.user, function (err, result) {
                if (err) {
                    console.log("error", err);
                    $scope.error = err.message || err.error.message || err.error || err;
                    $sendingData = false;
                    console.log('dale');
                } else {
                    try{
                        if (result.status != 'Successfully registered') {
                            $state.go('app.users');
                        }else{
                            $state.go('app.users');
                        }
                    }catch(error) {
                        $state.go('app.users');
                    }
                }
            });
        }

        $scope.delete = function () {
            $scope.sendingData = true;
            ngDialog.open({
                template: '/app/components/users/views/userModalView.html',
                showClose: true,
                scope: $scope,
                disableAnimation: true,
                data: {
                    title: $filter('translate')('users.delete_user'),
                    content: $filter('translate')('users.confirm_delete'),
                    confirm: function() {
                         UserServices.remove($scope.user.id, function(err, result) {
                            if (err) {
                                $scope.error = err.message || err.error.message || err.error || err;
                                $sendingData = false;
                            } else {
                                $state.go('app.users');
                            }
                        });
                    },
                    cancel: function () {
                        ngDialog.close();
                        $scope.sendingData = false;
                    }
                }
            });
        }

        $scope.tab1 = function (){

            var actualMonth = moment().month();
            var pastMonth   = moment().month()-1;
            var allMonths   = ['Enero','Febrero','Mayo','Abril','Marzo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            
            $scope.date.minDate   = moment().subtract(6, 'year'); 
            $scope.date.maxDate   = moment().add(0, 'year'); 
            $scope.date.startDate = moment().subtract(1, 'year');
            $scope.date.year      = moment().year();
            $scope.performance.actual    = {};
            $scope.performance.past      = {};
            $scope.performance.allMonths = {};
            $scope.identify = true;
            $scope.tabUser = 1;

            $scope.performance.actual.month = {
                'idMonth': actualMonth+1,
                'month'  : allMonths[actualMonth],                
                //'idUser' : idUser,
                'year'   : moment().year()
            }

            $scope.performance.past.month = {
                'idMonth': pastMonth+1,
                'month'  : allMonths[pastMonth],
                //'idUser' : idUser,
                'year'   : moment().year()
            };

            $scope.performance.actual.month.year = moment().year();
            $scope.performance.past.month.year = moment().year();

            if(window.localStorage.isDeveloper == "true") {
                TracksServices.findCurrentByMonth($scope.performance.actual.month, function(err, result){
                    $scope.performance.actual.month.salary = Object.values(result[0])[0];
                    WeeklyHourServices.currentUser(idUser, function(err, result){
                        $scope.performance.actual.month.costHour = result[0].costHour;
    
                        console.log(result[0])
                        UserServices.saveCurrentPerformance($scope.performance.actual.month, function(err, result){
                            console.log('save performance', err, result);
                        })
                    })
                })
    
                UserServices.getPerformanceCurrent($scope.performance.past.month, function(err,result){
                    console.log('Result past month', result, err);
                    $scope.performance.past.month = result[0];
                })
            } else if (idUser) {
                TracksServices.findByMonth($scope.performance.actual.month, idUser, function(err, result){
                    $scope.performance.actual.month.salary = Object.values(result[0])[0];
                    WeeklyHourServices.findByIdUser(idUser, function(err, result){
                        $scope.performance.actual.month.costHour = result[0].costHour;
    
                        console.log(result[0])
                        UserServices.savePerformance($scope.performance.actual.month, idUser, function(err, result){
                            console.log('save performance', err, result);
                        })
                    })
                })
                
                UserServices.getPerformanceById($scope.performance.past.month, idUser, function(err,result){
                    console.log('Result past month', result, err);
                    $scope.performance.past.month = result[0];
                })
            } else {

            }

            $scope.moreMonths = function(){
                $scope.performance.allMonths = {
                    'idUser'   : idUser,
                    'actMonth' : $scope.performance.actual.month.idMonth,
                    'pastMonth': $scope.performance.past.month.idMonth,
                    'year'     : $scope.date.year
                }
                UserServices.allPerformances($scope.performance.allMonths, function(err, result){
                    if (!err) {
                        $scope.performance.moreMonths = result;
                    }
                })      
            }

            $scope.filterYear = function(year){
                $scope.performance.allMonths = {};
                $scope.performance.allMonths.idUser = idUser;
                $scope.identify = false;
                $scope.performance.allMonths.year = moment(year).year(); 
                console.log('$scope.performance::', $scope.performance);
                $scope.performance.allMonths.actMonth = '';
                $scope.performance.allMonths.pastMonth = '';
                UserServices.allPerformances($scope.performance.allMonths, function(err, result){
                    $scope.performance.allMonths = result;
                    if ($scope.performance.allMonths[0].year == $scope.performance.actual.month.year) {
                        $scope.identify = true;
                    }
                })
            }

            console.log('$scope.performance::', $scope.performance);

        }

        $scope.tab2 = function(){

            $scope.tabUser = 2;

            if ($scope.user.jiraToken != null) {
                $scope.vinculate = true;
            } else {
                $scope.jiraInt = function(){
                    if ($scope.user.jiraToken == null) {
                        ngDialog.open({
                          template: '/app/shared/views/alert.modal.html',
                          showClose: true,
                          scope: $scope,
                          disableAnimation: true,
                          data: {
                            titleRequired: "Integración usuario con Jira.",
                            jiraIntegrate: "Para integrar su usuario con Jira es necesario ingresar al link: ",
                            linkJira: "https://id.atlassian.com/manage-profile/security/api-tokens",
                            jiraSecondP: " y 'Crear TOKEN API'. Luego de obtener el token ingresarlo aquí:",
                            confirm: function() {
                                console.log($rootScope.jiraUser);
                                UserServices.save($rootScope.jiraUser, function(err, result){
                                    console.log("Jira token guardado correctamente");
                                })
                            },
                            cancel: function() {

                            }
                          }
                        }); 
                    }
                }
            }
        }

        // $scope.tab3 = function(){

        //     EvaluateServices.find(idUser, function(err, result){
        //         $scope.evaluacion = result;
        //     })
            
        //     $scope.showEval = function(value){
        //        ngDialog.open({
        //           template: '/app/shared/views/alert.modal.html',
        //           showClose: true,
        //           scope: $scope,
        //           disableAnimation: true,
        //           data: {
        //             titleRequired: "Evaluación",
        //             evaluate: value,
        //             confirm: function() {
        //               ngDialog.close(windowIDs[1]);
        //             },
        //             cancel: function() {
        //               var windowIDs = ngDialog.getOpenDialogs();

        //               ngDialog.close(windowIDs[1]);
        //             }
        //           }
        //         });     
        //     }
        // }

    }]);

}(angular));
