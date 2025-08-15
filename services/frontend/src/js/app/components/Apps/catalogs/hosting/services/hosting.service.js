(function (ng) {

    'use strict';

    var Module = ng.module('LexTracking');

    Module.factory('HostingServices', ['RestClient', function(RestClient){

	  	var model = "hosting";

	  	var factory = {

		    find: function(page, q, cb) {
		      	RestClient.get( model+"/all", function(err, result, countItems) {
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

		    save: function(obj, cb) {
		    	if (obj.id) {
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
		    	RestClient.post(model + "/delete", id, function(err, result) {
		        	cb(err, result);
		      	})
		    }
	  	};

	  	return factory;

	}]);

}(angular));
