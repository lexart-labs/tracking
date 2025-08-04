(function (ng) {

  'use strict';

  var Module = ng.module('LexTracking');

  Module.factory('BudgetServices', ['RestClient', function(RestClient){

    var model = "budget";

    var factory = {

      find: function(page, q, cb) {
        RestClient.get( "budgets/all", function(err, result, countItems) {
          cb(err, result, countItems);
        })
      },

      findById: function(id, cb) {
        RestClient.get(model + "/" + id, function(err, result) {
          cb(err, result);
        })
      },

      findAll: function(page, q,  cb) {
        RestClient.get(model + "?sort[name]=1" + q, function(err, result) {
          cb(err, result);
        })
      },

      findByMonth: function(page, q, cb) {
          RestClient.get( model+"/all/by-date/" + q, function(err, result, countItems) {
            cb(err, result, countItems);
          })
      },

      findByUserMonth: function(page, q, cb) {
          RestClient.get( model+"/all/by-user-date/" + q, function(err, result, countItems) {
            cb(err, result, countItems);
          })
      },

      allStatus : function (cb) {
        RestClient.get("budgets/status/all", function (err,result) {
          cb(err,result);
        })

      },

      allConcepts : function (cb) {
        RestClient.get("budgets/concept/all", function (err,result) {
          cb(err,result);
        })

      },

      save: function(obj, cb) {
        if (obj.id) {
          RestClient.post(model + "/update", obj, function(err, result) {
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
