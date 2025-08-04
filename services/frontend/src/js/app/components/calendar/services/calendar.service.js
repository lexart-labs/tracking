(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('CalendarServices', ['RestClient', function(RestClient){
        var model = 'user';
        var USER_ID = window.localStorage.getItem('userId');

        var factory = {
            

            getUserEvents: function(id, cb){
                var authUserId = window.localStorage.userId; //se for mudado o backend retorna erro

                var path = authUserId == id ? '/current/hours' : '/' + id +'/hours';

                RestClient.get(model + path, function(err, result){
                    cb(err, result);
                })
            },

            getUserExceptions: function(id, fecha, cb){
                var authUserId = window.localStorage.userId; //se for mudado o backend retorna erro

                var path = authUserId == id ? '/current/exceptions/' : '/' + id +'/exceptions/';

                RestClient.get(model + path + fecha, function(err, result){
                    cb(err, result);
                })
            },

            postUserEvents: function(obj, cb){
                RestClient.post(model + '/fixeds/' + USER_ID, obj, function(err, result){
                    cb(err, result);
                })
            },


            postUserExceptions: function(obj, id, fecha, cb){
                RestClient.post(model + '/exceptions' + '/' + id + '/' + fecha, obj , function(err, result){
                    cb(err, result);
                })
            },


            removeEvents: function(obj, cb){
                RestClient.delete(model + '/delete-fixed-hours/' + obj.id, obj, function(err, result){
                    cb(err, result);
                })
            },

            getTrackedHours: function(id, fecha, cb){
                var authUserId = window.localStorage.userId; //se for mudado o backend retorna erro

                var path = authUserId == id ? 'tracks/user/current' : 'tracks/user/' + id;

                RestClient.get(path + '/calendar/' + fecha, function(err, result){
                    cb(err, result); 
                })
            },
        };
        return factory;
    }]);

}(angular));