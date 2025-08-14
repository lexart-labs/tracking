console.log('Reading BASE URL', BASE_URL);

(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('RestClient', ['$http', '$state', 'ngProgressFactory', '$window', '$rootScope', function ($http, $state, ngProgressFactory, $window, $rootScope) {

        var K = {},
            progressbar = ngProgressFactory.createInstance(),
            progressFlag = true,
            PRIMARY_COLOR = "#66f",
            factory;

        function getConfig() {
            var config = {
                headers: {
                    Authorization: 'Bearer ' + $window.localStorage[TOKEN_KEY]
                }
            };
            return config;
        }

        K.URL = BASE_URL;

        progressbar.setHeight('2px');
        progressbar.setColor(PRIMARY_COLOR);

        factory = {
            get: function (url, callback, options) {
                var progressFlag = (options && options.disableProgressFlag);

                if (!progressFlag)
                    progressbar.start();

                $http.get(K.URL + url, getConfig()).then(function (response) {
                        if (!progressFlag)
                            progressbar.complete();

                        var countItems = response.headers()['x-count-items'];

                        if(!response.data.response) {
                            return callback(response.data.Error)
                        }

                        callback(null, response.data.response, countItems);
                    }).catch(function (response) {
                        if (!progressFlag)
                            progressbar.complete();

                        if (response.status == 401 && $state.current.name != "login" && $state.current.name != "recovery") { //Go to login
                            $state.go('login', { reload: true });
                            console.log($state.go('login'), response.status, $state.current.name);
                        } else {
                            callback(response.data);
                        }
                    });
            },
            post: function(url, data, callback) {
                progressbar.start();                  
                    $http.post(K.URL + url, data, getConfig()).then(function (response) {
                        progressbar.complete();
                        if(response && response.data){
                            callback(null,response.data.response)
                        }else{
                            callback(null,response)

                        }                     
                    })
                    // .
                    // success(function(data, status, headers, config) {
                    //     progressbar.complete();
                    //     console.log(data);
                    //     callback(null, data.response);
                    // }).
                    // error(function(data, status, headers, config) {
                    //     progressbar.complete();
                    //     console.log(data);
                    //     if (status == 401 && $state.current.name != "login" && $state.current.name != "recovery") { //Go to login
                    //         $state.go('login');
                    //     } else {
                    //         callback(data);
                    //     }
                    // });

            },
            customPost: function (url, data, callback) {
                progressbar.start();                  
                $http.post(K.URL + url, data, getConfig()).then(function(response) {
                    progressbar.complete();     

                    if(response.status >= 400) {
                        return callback(response.data)
                    }

                    callback(null, response.data);
                }).catch(function(response) {
                    progressbar.complete();
                    console.log(data);
                    if (response.status == 401 && $state.current.name != "login" && $state.current.name != "recovery") { //Go to login
                        $state.go('login');
                    } else {
                        callback(response.data);
                    }
                });
            },
            put: function (url, data, callback) {
                if (K.progressFlag) {
                    progressbar.start();
                }

                $http.put(K.URL + url, data, getConfig()).
                    success(function (data, status, headers, config) {
                        if (K.progressFlag) {
                            progressbar.complete();
                        }
                        callback(null, data.response);
                    }).
                    error(function (data, status, headers, config) {
                        if (K.progressFlag) {
                            progressbar.complete();
                        }
                        if (status == 401 && $state.current.name != "login" && $state.current.name != "recovery") { //Go to login
                            $state.go('login');
                        } else {
                            callback(data);
                        }
                    });
            },
            customPut: function (url, data, callback) {
                progressbar.start();                  
                $http.put(K.URL + url, data, getConfig()).then(function(response) {
                    progressbar.complete();     

                    if(response.status >= 400) {
                        return callback(response.data)
                    }

                    callback(null, response.data);
                }).catch(function(response) {
                    progressbar.complete();
                    console.log(data);
                    if (response.status == 401 && $state.current.name != "login" && $state.current.name != "recovery") { //Go to login
                        $state.go('login');
                    } else {
                        callback(response.data);
                    }
                });
            },
            delete: function (url, callback) {
                progressbar.start();

                $http.delete(K.URL + url, getConfig()).
                    success(function (data, status, headers, config) {
                        progressbar.complete();
                        callback(null, data);
                    }).
                    error(function (data, status, headers, config) {
                        progressbar.complete();
                        if (status == 401 && $state.current.name != "login" && $state.current.name != "recovery") { //Go to login
                            $state.go('login');
                        } else {
                            callback(data);
                        }
                    });
            }
        }

        return factory;

    }]);

}(angular));
