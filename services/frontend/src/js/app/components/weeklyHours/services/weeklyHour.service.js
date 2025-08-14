(function (ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.factory('WeeklyHourServices', ['RestClient', function(RestClient){

    var model = "weeklyhours";

    var factory = {

      find: function(page, q, cb) {

        var user = window.localStorage;
        var role = user.userRole;

        var path = role == "developer" ? "user/current" : "all";

        RestClient.get( "weeklyhours/" + path, function(err, result, countItems) {
          cb(err, result, countItems);
        })
      },

      findById: function(id, cb) {
        RestClient.get(model + "/" + id, function(err, result) {
          cb(err, result);
        })
      },

      verifyUSer: function (user, cb){
        RestClient.get(model + "/user/" + user, function(err, result){
          cb(err,result);
        })
      },

      findByIdUser: function (user, cb){
        RestClient.get(model + "/user/" + user, function(err, result){
          cb(err,result);
        })
      },

      currentUser: function (user, cb){
        RestClient.get(model + "/user/current", function(err, result){
          cb(err,result);
        })
      },

      findAll: function(page, q,  cb) {
        RestClient.get(model + "?sort[name]=1" + q, function(err, result) {
          cb(err, result);
        })
      },

      
      save: function(obj, cb) {
        if (obj.id) {
          obj.id = +obj.id
          RestClient.put(model + "/update", obj, function(err, result) {
            cb(err, result);
          })
        } else {
          RestClient.post(model + "/new", obj, function(err, result) {
            cb(err, result);
          })
        }
      },

      remove: function(id, cb) {
        RestClient.delete(model + "/" + id, function(err, result) {
          cb(err, result);
        })
      }
    };

    return factory;

  }]);

}(angular));
