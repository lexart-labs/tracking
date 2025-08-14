(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');
    
    Module.factory('myHttpInterceptor', ['$injector', '$window', '$rootScope', function ($injector, $window, $rootScope, $q) {
        return {
            response: function (response) {
                // do something on success
                var state = $injector.get('$state');
                if (state && state.current && state.current.name == "app.tasks_trelloEdit") {
                    response.isTrello = true;
                }
                    
                $rootScope.$watch('state', function(newState, oldState){
                    if($window.localStorage["userId"] != $rootScope.userId ||
                    $window.localStorage["userName"] != $rootScope.userName || 
                    $window.localStorage["userEmail"] != $rootScope.userEmail || 
                    $window.localStorage["userRole"] != $rootScope.userRole ||
                    $window.localStorage["isAdmin"] != $rootScope.isAdmin ||
                    $window.localStorage["isClient"] != $rootScope.isClient ||
                    $window.localStorage["isDeveloper"] != $rootScope.isDeveloper){
                      //  $window.localStorage.clear();
                      //  state.go("login")
                    }
                }, true);
                if(response.headers()['content-type'] == "application/json"){
                    if(response.status == 200){
                        if (response && typeof response.data !== 'undefined') {
                            if (response && response.data && response.data.response &&  !response.data.response.token && !response.data.response.email) {
                                if (response.isTrello) {
                                    return response;
                                }else {
                                    var rest = $injector.get('UserServices');
                                    
                                    if(!$window.localStorage[TOKEN_KEY]){
                                        rest.persistence( function(error, response){
                                            var user = angular.copy(response);
                                            $window.localStorage[TOKEN_KEY]   = user.token;
                                            $window.localStorage["userId"]    = user.id;
                                            $window.localStorage["userName"]  = user.name;
                                            $window.localStorage["userEmail"] = user.email;
                                            $window.localStorage["userRole"]  = user.role;
                                            $window.localStorage["isAdmin"]   = user.role == 'admin';
                                            $window.localStorage["isClient"]  = user.role == 'client';
                                            $window.localStorage["isDeveloper"]  = user.role == 'developer';
                                            $window.localStorage["idUserClient"]  =user.idClient;
                                            return;
                                        });
                                    }
                                }
                            } else if(response && response.data && response.data.code === 401 ||response && response.data && response.data.code === 403 ){
                                $window.localStorage.clear();
                                state.go("login")                            
                            }
                        }
                    }                   
                }
                return response;
                
            },
            responseError: function (response) {
                // do something on error
                if (typeof $q !== 'undefined') {
                    return $q.reject(response);
                }

                return response;
            }
        };
    }]);

}(angular));