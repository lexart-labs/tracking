(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('tasks_automaticServices', ['RestClient', function(RestClient){

	  	var model = "taskAutomatic";

	  	var factory = {

		    find: function(page, q, cb) {
				  RestClient.get(model + "/all", function(err, result, countItems) {
		        	cb(err, result, countItems);
		      	})
		    },

		    findById: function(id, cb) {
		    	RestClient.get(model + "/" + id, function(err, result) {
		    		cb(err, result[0]);
		    	})
		    },


        findByIdClient: function(id, cb) {
         RestClient.get(model + "/id-client/" + id, function(err, result) {
           cb(err, result);
         })
       },

        findByIdUser: function(id, cb) {
         RestClient.get(model + "/id-user/" + id, function(err, result) {
           cb(err, result);
         })
       },

		   	findAll: function(page, q,  cb) {
				RestClient.get(model + "?sort[name]=1" + q, function(err, result) {
					cb(err, result);
				})
			},

		    save: function(obj, cb) {
		    	if (obj.id) {
		        	RestClient.put(model + "/" + obj.id, obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	} else {
		        	RestClient.post(model, obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	}
		    },

		    remove: function(id, cb) {
		    	RestClient.get(model + "/delete/" + id, function(err, result) {
		        	cb(err, result);
		      	})
			},

			saveTask_Automatic: function(obj, cb) {
		    	if (obj.id) { 
		        	RestClient.post(model + "/update/" + obj.id, obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	} else {
		        	RestClient.post(model + "/new", obj, function(err, result) {
		          		cb(err, result);
		        	})
		      	}
			}
	  	};

	  	return factory;

	}]);



}(angular));
